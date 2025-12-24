-- DESABILITAR RLS TEMPORARIAMENTE PARA COURSES
-- Isso vai permitir que você crie cursos sem problemas

ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;

-- Confirmar que RLS foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'courses';
