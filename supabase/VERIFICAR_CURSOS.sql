-- VERIFICACAO COMPLETA

-- 1. Ver se UPDATE funcionou
SELECT id, title, is_active, created_at 
FROM public.courses 
ORDER BY created_at DESC;

-- 2. Contar cursos
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as ativos,
  COUNT(*) FILTER (WHERE is_active = false OR is_active IS NULL) as inativos
FROM public.courses;
