-- ========================================
-- PERMITIR ACESSO TOTAL COM ANON KEY
-- ========================================

-- REMOVER TODAS as políticas antigas
DROP POLICY IF EXISTS "SELECT_todos_autenticados" ON public.courses;
DROP POLICY IF EXISTS "SELECT_publico_ativos" ON public.courses;
DROP POLICY IF EXISTS "INSERT_admins" ON public.courses;
DROP POLICY IF EXISTS "UPDATE_admins" ON public.courses;
DROP POLICY IF EXISTS "DELETE_admins" ON public.courses;
DROP POLICY IF EXISTS "Permitir SELECT para todos autenticados" ON public.courses;
DROP POLICY IF EXISTS "Permitir SELECT público para cursos ativos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem criar cursos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem atualizar cursos" ON public.courses;
DROP POLICY IF EXISTS "Admins podem deletar cursos" ON public.courses;

-- HABILITAR RLS (para poder criar políticas públicas)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICA SUPER PERMISSIVA PARA ANON
CREATE POLICY "anon_all_access"
ON public.courses
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- CRIAR POLÍTICA SUPER PERMISSIVA PARA AUTHENTICATED
CREATE POLICY "authenticated_all_access"
ON public.courses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- VERIFICAR
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'courses' AND schemaname = 'public';
