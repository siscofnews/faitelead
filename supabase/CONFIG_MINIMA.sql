-- ========================================
-- CONFIGURAÇÃO MÍNIMA - SEM ERROS
-- ========================================

-- 1. Confirmar email do usuário
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'faiteloficial@gmail.com';

-- 2. Definir senha SIMPLES: 123456
UPDATE auth.users
SET 
  encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'faiteloficial@gmail.com';

-- 3. Garantir roles de super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificar configuração
SELECT 
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmado,
  ur.role
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE au.email = 'faiteloficial@gmail.com';

-- ========================================
-- LOGIN:
-- Email: faiteloficial@gmail.com
-- Senha: 123456
-- ========================================
