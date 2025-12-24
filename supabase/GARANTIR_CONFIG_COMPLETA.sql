-- ========================================
-- GARANTIR QUE ESTÁ TUDO CONFIGURADO
-- ========================================

-- 1. Verificar e confirmar email
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW(),
  phone_confirmed_at = NOW()
WHERE email = 'faiteloficial@gmail.com';

-- 2. Definir senha SUPER SIMPLES: 123456
UPDATE auth.users
SET 
  encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'faiteloficial@gmail.com';

-- 3. Garantir perfil ativo
UPDATE public.profiles
SET 
  is_active = true,
  approval_status = 'approved'
WHERE email = 'faiteloficial@gmail.com';

-- 4. Garantir roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. VERIFICAR TUDO
SELECT 
  'AUTH USER:' as tipo,
  au.email,
  au.email_confirmed_at IS NOT NULL as email_confirmado,
  au.encrypted_password IS NOT NULL as tem_senha
FROM auth.users au
WHERE au.email = 'faiteloficial@gmail.com'

UNION ALL

SELECT 
  'PROFILE:' as tipo,
  p.email,
  p.is_active::text,
  p.approval_status
FROM public.profiles p
WHERE p.email = 'faiteloficial@gmail.com'

UNION ALL

SELECT 
  'ROLES:' as tipo,
  au.email,
  ur.role::text,
  ''
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';

-- ========================================
-- CREDENCIAIS SIMPLES:
-- Email: faiteloficial@gmail.com
-- Senha: 123456
-- ========================================
