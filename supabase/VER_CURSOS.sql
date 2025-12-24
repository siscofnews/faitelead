-- VERIFICAR SE O CURSO FOI CRIADO

-- Ver todos os cursos no banco
SELECT * FROM public.courses ORDER BY created_at DESC;

-- Ver quantidade de cursos
SELECT COUNT(*) as total FROM public.courses;
