-- SCRIPT PARA CORRIGIR LOGIN (CONFIRMAR EMAIL)
-- Se o usuário já foi cadastrado mas não consegue logar, pode ser falta de confirmação de email.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
BEGIN
  -- 1. Verificar se o usuário existe
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- 2. Confirmar email manualmente (Burla a necessidade de clicar no link)
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      confirmed_at = now(),
      last_sign_in_at = now(),
      raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
    WHERE id = v_user_id;
    
    RAISE NOTICE '✅ Usuário % confirmado com sucesso! Tente logar agora.', v_email;
  ELSE
    RAISE NOTICE '❌ Usuário % NÃO ENCONTRADO no banco de dados.', v_email;
    RAISE NOTICE '👉 Por favor, vá em "Gestão de Alunos" > "Novo Aluno" e cadastre-o primeiro.';
  END IF;
END $$;
