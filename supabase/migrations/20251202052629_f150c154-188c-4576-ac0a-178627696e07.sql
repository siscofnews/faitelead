-- Remover políticas antigas da tabela courses
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view active courses" ON public.courses;

-- Criar políticas PERMISSIVE corretas
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active courses" 
ON public.courses 
FOR SELECT 
TO authenticated, anon
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));