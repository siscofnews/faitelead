-- SCRIPT DE CONSOLIDAÇÃO DO BACK-END (SUPABASE) - CORRIGIDO
-- Este script garante que a estrutura do banco, permissões e dados iniciais estejam corretos.
-- Execute-o no SQL Editor do Supabase.

-- 1. TIPOS ENUM (Se não existirem)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'super_admin', 'teacher', 'director', 'polo_director');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.exam_type AS ENUM ('multiple_choice', 'essay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.education_level AS ENUM ('fundamental', 'medio', 'superior', 'pos_graduacao');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELAS BASE (Core)

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  education_level education_level DEFAULT 'medio',
  registration_status TEXT DEFAULT 'approved', -- Auto-aprovado para admins iniciais
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Modules
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 3. FUNÇÕES AUXILIARES DE SEGURANÇA

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- 4. POLÍTICAS RLS (CORRIGIDAS E PERMISSIVAS PARA ADMINS)

-- Profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin') OR auth.uid() = id);

-- User Roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles; -- Nome antigo comum

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can read active courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view active courses" ON public.courses; -- Nome antigo comum

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Everyone can read active courses"
  ON public.courses FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

-- Modules (AQUI ESTAVA O ERRO PRINCIPAL)
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Students can view modules of enrolled courses" ON public.modules;
DROP POLICY IF EXISTS "Admins and Staff can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Students can view modules" ON public.modules;

CREATE POLICY "Admins and Staff can manage modules"
  ON public.modules
  FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'director'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'director'::app_role)
    OR has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "Students can view modules"
  ON public.modules
  FOR SELECT
  TO authenticated
  USING (true); -- Simplificado para leitura

-- 5. TRIGGER DE NOVO USUÁRIO (Auth -> Profile)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, cpf, phone, education_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário Novo'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'education_level')::education_level, 'medio')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Se for o email do admin, já dá permissão
  IF NEW.email = 'pr.vcsantos@gmail.com' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'super_admin'), (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. BOOTSTRAP DE ADMIN (Para usuário já existente)
DO $$
DECLARE
  target_email TEXT := 'pr.vcsantos@gmail.com';
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Garante profile
    INSERT INTO public.profiles (id, full_name, email, registration_status)
    VALUES (target_user_id, 'Super Admin', target_email, 'approved')
    ON CONFLICT (id) DO UPDATE SET registration_status = 'approved';

    -- Remove roles antigos e insere novos
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'super_admin');
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
    
    RAISE NOTICE 'Usuário % promovido a Super Admin.', target_email;
  END IF;
END $$;
