-- SCRIPT DEFINITIVO DE CORREÇÃO DE LOGIN (SEM EXCLUIR)
-- Este script vai resetar a senha do aluno para "123456" usando um hash válido
-- E confirmar todas as flags de email.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- 1. Forçar confirmação de email
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      encrypted_password = crypt('123456', gen_salt('bf')), -- Reseta senha para 123456
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
      is_sso_user = false
    WHERE id = v_user_id;

    -- 2. Garantir perfil ativo
    UPDATE public.profiles
    SET is_active = true, role = 'student'
    WHERE id = v_user_id;

    RAISE NOTICE '✅ SENHA RESETADA PARA "123456" (sem aspas). Tente logar agora!';
  ELSE
    RAISE NOTICE '❌ Usuário não encontrado. O cadastro realmente falhou.';
  END IF;
END $$;
