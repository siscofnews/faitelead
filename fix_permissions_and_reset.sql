-- 1. Remover todas as políticas RLS existentes para garantir limpeza
DROP POLICY IF EXISTS "Permitir acesso total para super_admin em profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir acesso total para super_admin em courses" ON courses;
DROP POLICY IF EXISTS "Permitir acesso total para super_admin em modules" ON modules;
DROP POLICY IF EXISTS "Permitir acesso total para super_admin em lessons" ON lessons;
DROP POLICY IF EXISTS "Permitir acesso total para super_admin em student_enrollments" ON student_enrollments;

-- 2. Criar função auxiliar para verificar se é super_admin (se não existir)
CREATE OR REPLACE FUNCTION public.has_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  jwt_email := lower((auth.jwt() ->> 'email'));

  IF jwt_email <> lower('faiteloficial@gmail.com') THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RETURN true;
  END IF;

  DELETE FROM public.user_roles WHERE user_id = auth.uid();
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'super_admin');

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin() TO authenticated;

-- 3. Recriar políticas RLS garantindo acesso total para Super Admin
-- Profiles
DROP POLICY IF EXISTS "Super Admin Full Access Profiles" ON profiles;
CREATE POLICY "Admin Full Access Profiles" ON profiles
  FOR ALL
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL
  TO authenticated
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Courses
DROP POLICY IF EXISTS "Super Admin Full Access Courses" ON courses;
CREATE POLICY "Admin Full Access Courses" ON courses
  FOR ALL
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

-- Modules
DROP POLICY IF EXISTS "Super Admin Full Access Modules" ON modules;
CREATE POLICY "Admin Full Access Modules" ON modules
  FOR ALL
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

-- Lessons
DROP POLICY IF EXISTS "Super Admin Full Access Lessons" ON lessons;
CREATE POLICY "Admin Full Access Lessons" ON lessons
  FOR ALL
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

-- Enrollments
DROP POLICY IF EXISTS "Super Admin Full Access Enrollments" ON student_enrollments;
CREATE POLICY "Admin Full Access Enrollments" ON student_enrollments
  FOR ALL
  USING (has_admin_access())
  WITH CHECK (has_admin_access());

DROP POLICY IF EXISTS "Admins can manage course materials" ON storage.objects;
DROP POLICY IF EXISTS "Public can read course materials" ON storage.objects;

CREATE POLICY "Admins can manage course materials"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'course-materials' AND has_admin_access())
WITH CHECK (bucket_id = 'course-materials' AND has_admin_access());

CREATE POLICY "Public can read course materials"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-materials');
