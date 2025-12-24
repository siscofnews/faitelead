-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Everyone can view active courses" ON public.courses;

-- Criar políticas que incluem super_admin
CREATE POLICY "Admins can manage courses" 
ON public.courses 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Everyone can view active courses" 
ON public.courses 
FOR SELECT 
TO authenticated, anon
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));