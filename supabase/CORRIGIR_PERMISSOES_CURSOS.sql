-- CORRIGIR PERMISSOES PARA CRIAR CURSOS

-- Permitir que admins criem cursos
CREATE POLICY IF NOT EXISTS "Admins can insert courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Permitir que admins atualizem cursos
CREATE POLICY IF NOT EXISTS "Admins can update courses"
ON public.courses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Permitir que admins deletem cursos
CREATE POLICY IF NOT EXISTS "Admins can delete courses"
ON public.courses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Verificar policies criadas
SELECT * FROM pg_policies WHERE tablename = 'courses';
