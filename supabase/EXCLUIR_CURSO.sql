-- EXCLUIR CURSO "Curso de Demonstracao"

-- Ver qual curso existe
SELECT id, title FROM public.courses;

-- Excluir o curso (isso vai excluir automaticamente módulos, aulas, etc por CASCADE)
DELETE FROM public.courses 
WHERE title = 'Curso de Demonstração';

-- OU se preferir excluir pelo ID específico:
-- DELETE FROM public.courses WHERE id = 'cole-o-id-aqui';

-- Verificar que foi excluído
SELECT id, title FROM public.courses;
