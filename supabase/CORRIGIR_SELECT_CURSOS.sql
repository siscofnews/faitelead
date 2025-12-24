-- ADICIONAR PERMISSAO DE LEITURA PARA ADMINS

-- Permitir que todos vejam cursos ativos (já existe)
-- Mas precisa adicionar permissão de ADMIN ver TODOS

DROP POLICY IF EXISTS "Everyone can view active courses" ON public.courses;

-- Nova policy: Admins veem TODOS os cursos, outros veem só ativos
CREATE POLICY "Users can view courses based on role"
ON public.courses
FOR SELECT
TO authenticated
USING (
  is_active = true 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Verificar courses agora
SELECT * FROM public.courses;
