-- SCRIPT DE SINCRONIZAÇÃO DE ROLES
-- Garante que a coluna 'role' na tabela 'profiles' esteja preenchida corretamente
-- baseada na tabela 'user_roles'. Isso permite consultas mais simples e rápidas.

-- 1. Atualizar profiles baseado em user_roles
UPDATE public.profiles p
SET role = ur.role
FROM public.user_roles ur
WHERE p.id = ur.user_id
AND p.role IS NULL;

-- 2. Garantir que quem não tem role definida seja 'student' por padrão
UPDATE public.profiles
SET role = 'student'
WHERE role IS NULL;

-- 3. Criar índice para deixar a busca por role rápida
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
