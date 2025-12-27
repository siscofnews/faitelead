-- CORREÇÃO DE RECURSÃO INFINITA (Versão Corrigida)
-- O erro anterior ocorreu porque a política já existia. Agora vamos remover todas antes de recriar.

-- 1. Função segura para verificar Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover TODAS as políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles; -- Adicionado

DROP POLICY IF EXISTS "Admins manage credentials" ON public.student_credentials;
DROP POLICY IF EXISTS "Users view own credentials" ON public.student_credentials;

DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;

DROP POLICY IF EXISTS "Admins manage enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users view own enrollments" ON public.student_enrollments;

-- 3. Recriar as políticas

-- Tabela: user_roles
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING ( user_id = auth.uid() );

-- Tabela: profiles
CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING ( auth.uid() = id );

-- Tabela: student_credentials
CREATE POLICY "Admins manage credentials" ON public.student_credentials
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users view own credentials" ON public.student_credentials
  FOR SELECT USING ( student_id = auth.uid() );

-- Tabela: payments
CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING ( student_id = auth.uid() );

-- Tabela: student_enrollments
CREATE POLICY "Admins manage enrollments" ON public.student_enrollments
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users view own enrollments" ON public.student_enrollments
  FOR SELECT USING ( student_id = auth.uid() );
