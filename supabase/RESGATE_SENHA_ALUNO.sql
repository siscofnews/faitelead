-- SCRIPT DE RESGATE DE SENHA E CRIAÇÃO DE ALUNO
-- Este script FORÇA a criação do usuário com a senha correta, ignorando qualquer erro anterior.

-- 1. Remover o usuário antigo para limpar qualquer estado corrompido
DELETE FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';

-- 2. Criar o usuário novamente (simulando o cadastro pelo backend do Supabase)
-- NOTA: Como não podemos criar usuário com senha diretamente via SQL puro (hash),
-- vamos usar o passo 3 que é o mais importante:

-- 3. Instrução para você executar AGORA na plataforma Admin:
-- a) Vá na tela de "Gestão de Alunos" > "Novo Aluno"
-- b) Preencha:
--    Nome: Pastor Valmir Santos
--    Email: pr.vcsantos@gmail.com
--    Senha: P26192920m
--    Confirmar Senha: P26192920m
-- c) Clique em "Cadastrar Aluno"

-- DEPOIS QUE VOCÊ FIZER ISSO, se ainda der erro, execute este bloco abaixo para "consertar" o usuário recém-criado:

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Confirmar email automaticamente
    UPDATE auth.users
    SET email_confirmed_at = now(), confirmed_at = now()
    WHERE id = v_user_id;
    
    -- Garantir permissões
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (v_user_id, 'Pastor Valmir Santos', 'pr.vcsantos@gmail.com', 'student', true)
    ON CONFLICT (id) DO UPDATE SET role = 'student';
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Usuário corrigido e confirmado!';
  END IF;
END $$;
