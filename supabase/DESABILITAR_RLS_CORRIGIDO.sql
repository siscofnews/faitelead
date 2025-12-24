-- ========================================
-- DESABILITAR RLS - VERSÃO CORRIGIDA
-- ========================================

-- Desabilitar RLS apenas nas tabelas que EXISTEM
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('courses', 'modules', 'lessons', 'profiles')
ORDER BY tablename;
