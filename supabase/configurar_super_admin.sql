-- =====================================================
-- CRIAR SUPER ADMIN GLOBAL - FAITEL
-- =====================================================
-- Email: faiteloficial@gmail.com
-- Script compatível com o schema real do banco de dados
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'faiteloficial@gmail.com';

  -- Se o usuário não existir, mostrar erro
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ USUÁRIO NÃO ENCONTRADO!';
    RAISE NOTICE 'Crie primeiro em: Authentication → Add User';
    RAISE NOTICE 'Email: faiteloficial@gmail.com';
    RAISE NOTICE 'Senha: P26192920m';
    RAISE NOTICE '✅ Auto Confirm User: MARCAR';
    RETURN;
  END IF;

  RAISE NOTICE '✓ Usuário encontrado: %', v_user_id;

  -- 1. Criar/Atualizar perfil
  INSERT INTO public.profiles (id, full_name, email, cpf, phone, education_level)
  VALUES (
    v_user_id,
    'Super Admin FAITEL',
    'faiteloficial@gmail.com',
    '00000000000',
    '(00) 0000-0000',
    'superior'
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    full_name = 'Super Admin FAITEL',
    email = 'faiteloficial@gmail.com';

  RAISE NOTICE '✓ Perfil criado/atualizado';

  -- 2. Adicionar role de super_admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    v_user_id,
    'super_admin'::app_role
  )
  ON CONFLICT (user_id, role) 
  DO NOTHING;

  RAISE NOTICE '✓ Role SUPER_ADMIN adicionada';

  -- 3. Adicionar role de admin também (para acesso total)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    v_user_id,
    'admin'::app_role
  )
  ON CONFLICT (user_id, role) 
  DO NOTHING;

  RAISE NOTICE '✓ Role ADMIN adicionada (acesso total)';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SUPER ADMIN CONFIGURADO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Email: faiteloficial@gmail.com';
  RAISE NOTICE 'UUID: %', v_user_id;
  RAISE NOTICE 'Roles: super_admin + admin';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Agora você pode fazer login no site!';
  RAISE NOTICE '🌐 https://faitel-ead.netlify.app';

END $$;

-- VERIFICAÇÃO: Confirmar configuração
SELECT 
  p.id,
  p.full_name,
  p.email,
  au.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.email = 'faiteloficial@gmail.com';

-- VERIFICAÇÃO 2: Ver roles do usuário
SELECT 
  ur.user_id,
  ur.role,
  au.email
FROM public.user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id  
WHERE au.email = 'faiteloficial@gmail.com';
