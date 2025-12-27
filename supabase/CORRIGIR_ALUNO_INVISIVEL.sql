-- SCRIPT PARA CORRIGIR ALUNO INVISÍVEL E LOGIN
-- Este script força a criação do perfil e confirma o email para o aluno aparecer na lista e conseguir logar.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
BEGIN
  -- 1. Buscar o ID do usuário no Auth (ele deve existir se deu "Sucesso" no cadastro)
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ ERRO: Usuário Auth não encontrado. O cadastro falhou completamente.';
  ELSE
    RAISE NOTICE '✅ Usuário Auth encontrado: %', v_user_id;

    -- 2. Confirmar Email (Correção do Login)
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      confirmed_at = now(),
      last_sign_in_at = null, -- Forçar reset de sessão
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
    WHERE id = v_user_id;
    
    -- 3. Criar ou Atualizar Perfil (Correção da Lista)
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (
      v_user_id, 
      'Pastor Valmir Santos', -- Nome genérico se não tiver, depois atualiza
      v_email, 
      'student', 
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'student',
      email = EXCLUDED.email,
      is_active = true;
      
    -- 4. Garantir User Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE '✅ Perfil criado/corrigido com sucesso! O aluno deve aparecer na lista agora.';
  END IF;
END $$;
