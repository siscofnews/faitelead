-- Script para corrigir erros no cadastro de alunos
-- Garante que todas as colunas e tabelas usadas no frontend existam

-- 1. Garantir colunas na tabela profiles (usadas no StudentsManagement.tsx)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rg text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS complement text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text DEFAULT 'Brasil';

-- 2. Garantir tabela student_credentials
CREATE TABLE IF NOT EXISTS public.student_credentials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    enrollment_number text NOT NULL,
    qr_code_data text,
    valid_until timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Garantir tabela payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    amount numeric(10, 2) NOT NULL,
    status text CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    due_date date,
    paid_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Garantir tabela student_enrollments (reforço)
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    progress integer DEFAULT 0,
    enrolled_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    UNIQUE(student_id, course_id)
);

-- 5. Atualizar Trigger de criação de usuário (se existir) para lidar com novos campos
-- Primeiro, vamos ver se o trigger existe e recriá-lo de forma segura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
    new.raw_user_meta_data->>'full_name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'), -- Default to student if not provided
    true,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'education_level'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    cpf = EXCLUDED.cpf,
    phone = EXCLUDED.phone,
    education_level = EXCLUDED.education_level;
    
  -- Se o usuário for criado como super_admin ou admin via metadados, inserir em user_roles
  IF (new.raw_user_meta_data->>'role' IN ('admin', 'super_admin')) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (new.id, new.raw_user_meta_data->>'role')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger para garantir que ele use a função atualizada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Garantir permissões RLS (Row Level Security)
-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas Permissivas para Admin/Super Admin
-- Profiles: Admin pode ver e editar todos
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Profiles: Users can see and edit own profile
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Student Credentials: Admin manage, user view own
DROP POLICY IF EXISTS "Admins manage credentials" ON public.student_credentials;
CREATE POLICY "Admins manage credentials" ON public.student_credentials
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Users view own credentials" ON public.student_credentials;
CREATE POLICY "Users view own credentials" ON public.student_credentials
  FOR SELECT USING (student_id = auth.uid());

-- Payments: Admin manage, user view own
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (student_id = auth.uid());

-- Student Enrollments: Admin manage, user view own
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.student_enrollments;
CREATE POLICY "Admins manage enrollments" ON public.student_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Users view own enrollments" ON public.student_enrollments;
CREATE POLICY "Users view own enrollments" ON public.student_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- User Roles: Admin manage
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
  
-- Allow public read of roles (needed for login checks sometimes)
DROP POLICY IF EXISTS "Public read roles" ON public.user_roles;
CREATE POLICY "Public read roles" ON public.user_roles
  FOR SELECT USING (true);
  
-- CORREÇÃO FINAL: Garantir que o Super Admin atual tenha a role 'super_admin'
-- (Substitua o ID abaixo pelo ID do seu usuário se souber, mas o script tenta garantir para quem executar se for self-fix, 
-- mas como é executado no SQL Editor, não tem auth.uid(). O ideal é garantir via insert direto se soubermos o email)

-- Permissão explicita para INSERT em user_roles para qualquer usuário autenticado (CUIDADO: Isso permite que qualquer um se torne admin se souber a API)
-- MELHOR: Criar uma função RPC para criar aluno se o RLS bloquear, mas vamos tentar ajustar o RLS primeiro.
-- O frontend faz: supabase.from("user_roles").insert({ user_id: ..., role: "student" })
-- Isso requer que o usuário logado (Admin) tenha permissão de INSERT na tabela user_roles.
-- A política "Admins manage roles" acima já cobre isso SE o usuário logado já tiver a role 'admin' ou 'super_admin'.

