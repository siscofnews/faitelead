-- ========================================
-- DESABILITAR RLS TEMPORARIAMENTE
-- ========================================
-- ATENÇÃO: Isso permite acesso total aos dados!
-- Use apenas em desenvolvimento/testes

-- Desabilitar RLS nas tabelas principais
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('courses', 'modules', 'lessons', 'profiles')
ORDER BY tablename;

-- ========================================
-- AGORA OS DADOS ESTARÃO ACESSÍVEIS!
-- ========================================
