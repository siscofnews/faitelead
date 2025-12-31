-- ==========================================================
-- DEFINITIVE FIX FOR STUDENT LOGIN & REGISTRATION (v3)
-- ==========================================================

-- 1. UNIFY PROFILES SCHEMA
-- Ensure all columns used by the frontend exist and are correctly typed.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. ROBUST USER CREATION TRIGGER (SECURITY DEFINER)
-- This function runs with service_role privileges, allowing it to bypass RLS and update auth.users.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role text;
BEGIN
    -- Determine role (default to 'student')
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    
    -- Normalize role name if necessary (mapping ALUNO -> student, etc. if desired, 
    -- but here we follow what's in meta_data)
    
    -- A. AUTO-CONFIRM EMAIL (THE BLOCKER FIX)
    -- This removes the need for students to check their email before logging in.
    UPDATE auth.users 
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        confirmed_at = COALESCE(confirmed_at, now()),
        last_sign_in_at = COALESCE(last_sign_in_at, now())
    WHERE id = new.id;

    -- B. CREATE/UPDATE PUBLIC PROFILE
    INSERT INTO public.profiles (
        id, 
        full_name, 
        email, 
        role, 
        is_active, 
        cpf, 
        phone, 
        education_level
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
        new.email,
        v_role,
        true,
        new.raw_user_meta_data->>'cpf',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'education_level'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        cpf = COALESCE(EXCLUDED.cpf, public.profiles.cpf),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        education_level = COALESCE(EXCLUDED.education_level, public.profiles.education_level);

    -- C. ASSIGN ROLE IN user_roles
    -- Using INSERT ... ON CONFLICT to avoid errors if already assigned.
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, v_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Log error (Supabase logs) but don't block user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RECREATE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. CLEANUP EXISTING DATA (Optional but recommended)
-- Normalize existing roles to lowercase for frontend consistency
UPDATE public.profiles SET role = 'student' WHERE role = 'ALUNO';
UPDATE public.profiles SET role = 'super_admin' WHERE role = 'SUPER_ADMIN';
UPDATE public.user_roles SET role = 'student' WHERE role = 'ALUNO';
UPDATE public.user_roles SET role = 'super_admin' WHERE role = 'SUPER_ADMIN';

-- Ensure all current users are confirmed (fixes backlog of broken accounts)
UPDATE auth.users 
SET email_confirmed_at = now(), confirmed_at = now() 
WHERE email_confirmed_at IS NULL;

-- 5. ENSURE RLS FOR LOGINS
-- The frontend needs to read its own role during login.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read their own roles" ON public.user_roles;
CREATE POLICY "Anyone can read their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Also allow public select if needed for login logic (optional, but safer is above)
-- CREATE POLICY "Public role check" ON public.user_roles FOR SELECT USING (true);
