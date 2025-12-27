-- SCRIPT PARA GARANTIR ACESSO DO ALUNO DE TESTE
-- Este script verifica se o aluno existe, se tem a role 'student' e se está matriculado

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
  v_course_id uuid;
BEGIN
  -- 1. Buscar ID do usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuário não encontrado. Cadastre-o primeiro pela plataforma Admin.';
    RETURN;
  END IF;

  -- 2. Garantir Role 'student'
  INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'student')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.profiles SET role = 'student' WHERE id = v_user_id;

  -- 3. Buscar um curso ativo para matricular (ex: Básico em Teologia)
  SELECT id INTO v_course_id FROM public.courses WHERE is_active = true LIMIT 1;

  IF v_course_id IS NOT NULL THEN
    -- 4. Matricular no curso (se não estiver)
    INSERT INTO public.student_enrollments (student_id, course_id, is_active)
    VALUES (v_user_id, v_course_id, true)
    ON CONFLICT (student_id, course_id) DO NOTHING;
    
    RAISE NOTICE 'Aluno matriculado no curso ID: %', v_course_id;
  ELSE
    RAISE NOTICE 'Nenhum curso ativo encontrado para matricular.';
  END IF;

  RAISE NOTICE 'Configuração do aluno de teste concluída! ID: %', v_user_id;
END $$;
