-- CORRIGIR PERMISSAO DE INSERT DEFINITIVAMENTE

-- Remover policy antiga que pode estar bloqueando
DROP POLICY IF EXISTS "Admins can insert courses" ON public.courses;

-- Criar policy CORRETA que permite admin INSERIR
CREATE POLICY "Admins can create courses"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'super_admin'::app_role)
  )
);

-- Verificar que a policy foi criada
SELECT * FROM pg_policies WHERE tablename = 'courses' AND cmd = 'INSERT';
