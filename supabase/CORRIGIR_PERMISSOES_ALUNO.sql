-- VERIFICAR E CORRIGIR ROLE DO ALUNO
-- Este script verifica quais roles o usuário tem. 
-- Se tiver admin ou super_admin, remove e deixa apenas student.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
  v_role text;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- Listar roles atuais (para debug no log)
    FOR v_role IN SELECT role FROM public.user_roles WHERE user_id = v_user_id LOOP
      RAISE NOTICE 'Role encontrada: %', v_role;
    END LOOP;

    -- REMOVER roles de admin se existirem por engano
    DELETE FROM public.user_roles 
    WHERE user_id = v_user_id AND role IN ('admin', 'super_admin');
    
    -- GARANTIR que tenha apenas student
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Atualizar profile também
    UPDATE public.profiles SET role = 'student' WHERE id = v_user_id;

    RAISE NOTICE '✅ Permissões corrigidas! O usuário agora é estritamente STUDENT.';
  ELSE
    RAISE NOTICE '❌ Usuário não encontrado.';
  END IF;
END $$;
