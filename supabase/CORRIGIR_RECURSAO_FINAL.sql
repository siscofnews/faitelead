-- CORREÇÃO FINAL E DEFINITIVA DE RECURSÃO INFINITA
-- O problema persiste porque a função is_admin() ainda depende de políticas RLS ao fazer SELECT na user_roles.
-- Solução: Usar SECURITY DEFINER (já usamos) + Garantir que não haja policies conflitantes.

-- 1. Remover TODAS as policies da tabela user_roles para começar do zero
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_roles;

-- 2. Garantir que a função is_admin seja SEGURA e não dispare RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- A consulta direta aqui dentro, com SECURITY DEFINER, deve ignorar o RLS.
  -- Mas para garantir, vamos fazer uma consulta simples que não depende de policies complexas.
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar Policies SIMPLIFICADAS e SEM RECURSÃO

-- Permitir leitura pública de roles (necessário para login e verificações iniciais)
-- Isso evita que a função is_admin precise ser chamada para ler a própria tabela que define quem é admin
CREATE POLICY "Public read roles" ON public.user_roles
  FOR SELECT USING (true);

-- Permitir que Admins insiram/atualizem/deletem roles
-- Aqui usamos a função is_admin(), mas como a leitura é pública (policy acima), não deve haver loop.
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL 
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );

-- 4. Garantir permissões nas outras tabelas (sem alterar a lógica, apenas reforçando)

-- Profiles
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING ( auth.uid() = id );

-- Enrollments
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.student_enrollments;
DROP POLICY IF EXISTS "Users view own enrollments" ON public.student_enrollments;

CREATE POLICY "Admins manage enrollments" ON public.student_enrollments
  FOR ALL USING ( public.is_admin() );

CREATE POLICY "Users view own enrollments" ON public.student_enrollments
  FOR SELECT USING ( student_id = auth.uid() );
