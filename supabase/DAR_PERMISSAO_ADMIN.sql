-- ⚡ SCRIPT SUPER SIMPLES - DAR PERMISSÃO DE SUPER ADMIN
-- Execute este script no SQL Editor do Supabase
-- Email: faiteloficial@gmail.com

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar ID do usuário
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'faiteloficial@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Usuário não encontrado!';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Usuário encontrado: %', v_user_id;

  -- Adicionar role de super_admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Adicionar role de admin também
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUPER ADMIN CONFIGURADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Agora você tem acesso total ao sistema!';
  RAISE NOTICE 'Faça logout e login novamente.';
END $$;

-- Ver as roles do usuário
SELECT 
  ur.user_id,
  ur.role,
  au.email
FROM public.user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';
