-- =====================================================
-- CRIAR SUPER ADMIN GLOBAL - FAITEL
-- =====================================================
-- Email: faiteloficial@gmail.com
-- Este script configura o usuário como SUPER_ADMIN global
-- =====================================================

-- PASSO 1: Criar usuário no Supabase Auth (se não existir)
-- IMPORTANTE: Execute este script no SQL Editor do Supabase Dashboard

-- PASSO 2: Obter o UUID do usuário
-- Substitua USER_UUID_AQUI pelo ID do usuário após criação
-- Para obter: SELECT id, email FROM auth.users WHERE email = 'faiteloficial@gmail.com';

-- PASSO 3: Configurar como Super Admin
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
    RAISE NOTICE 'USUÁRIO NÃO ENCONTRADO! Criar primeiro no Authentication.';
    RETURN;
  END IF;

  RAISE NOTICE 'Usuário encontrado: %', v_user_id;

  -- 1. Criar/Atualizar perfil como SUPER_ADMIN
  INSERT INTO public.profiles (id, nome, role, ativo, created_at)
  VALUES (
    v_user_id,
    'Super Admin FAITEL',
    'SUPER_ADMIN',
    true,
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'SUPER_ADMIN',
    ativo = true,
    nome = 'Super Admin FAITEL';

  RAISE NOTICE '✓ Perfil criado/atualizado como SUPER_ADMIN';

  -- 2. Adicionar role de SUPER_ADMIN na tabela user_roles
  INSERT INTO public.user_roles (user_id, role, active, created_at)
  VALUES (
    v_user_id,
    'SUPER_ADMIN',
    true,
    NOW()
  )
  ON CONFLICT (user_id, role, polo_id, nucleo_id, curso_id) 
  DO UPDATE SET 
    active = true;

  RAISE NOTICE '✓ Role SUPER_ADMIN adicionada';

  -- 3. Registrar como master super admin (não deletável)
  INSERT INTO public.master_super_admin (user_id, active, created_at)
  VALUES (
    v_user_id,
    true,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    active = true;

  RAISE NOTICE '✓ Registrado como Master Super Admin';

  -- 4. Log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    table_name,
    action,
    record_id,
    payload,
    created_at
  )
  VALUES (
    v_user_id,
    'master_super_admin',
    'SUPER_ADMIN_CREATED',
    v_user_id,
    jsonb_build_object(
      'email', 'faiteloficial@gmail.com',
      'role', 'SUPER_ADMIN',
      'created_by', 'SQL_SCRIPT'
    ),
    NOW()
  );

  RAISE NOTICE '✓ Log de auditoria criado';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUPER ADMIN CONFIGURADO COM SUCESSO!';
  RAISE NOTICE 'Email: faiteloficial@gmail.com';
  RAISE NOTICE 'UUID: %', v_user_id;
  RAISE NOTICE 'Role: SUPER_ADMIN (Global)';
  RAISE NOTICE 'Status: Ativo';
  RAISE NOTICE '========================================';

END $$;

-- VERIFICAÇÃO: Confirmar configuração
SELECT 
  p.id,
  p.nome,
  p.role,
  p.ativo,
  CASE WHEN msa.user_id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as is_master_super_admin,
  au.email
FROM public.profiles p
LEFT JOIN public.master_super_admin msa ON msa.user_id = p.id
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.email = 'faiteloficial@gmail.com';

-- VERIFICAÇÃO 2: Ver todas as roles
SELECT 
  ur.user_id,
  ur.role,
  ur.active,
  ur.polo_id,
  ur.nucleo_id,
  ur.curso_id,
  au.email
FROM public.user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';
