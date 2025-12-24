-- EXCLUIR CURSO DEMONSTRACAO - SCRIPT DEFINITIVO

-- 1. Ver todos os cursos
SELECT * FROM public.courses;

-- 2. Excluir TODOS os cursos (se quiser limpar tudo)
DELETE FROM public.courses;

-- 3. Verificar que foi excluído
SELECT COUNT(*) as total_cursos FROM public.courses;
