-- DAR PERMISSAO DE SUPER ADMIN
-- Email: faiteloficial@gmail.com

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar roles
SELECT 
  ur.role,
  au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';
