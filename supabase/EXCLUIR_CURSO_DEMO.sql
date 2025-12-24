-- EXCLUIR O CURSO DE DEMONSTRACAO

-- Ver cursos atuais
SELECT id, title FROM public.courses;

-- Excluir o curso "Curso de Demonstração"
DELETE FROM public.courses 
WHERE title LIKE '%Demonstra%';

-- Confirmar que foi excluído
SELECT id, title FROM public.courses;
