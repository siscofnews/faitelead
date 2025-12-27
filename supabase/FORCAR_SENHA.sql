-- FORÇAR SENHA DO ALUNO
-- Como o aluno já existe (VALDINEI DA CONCEIÇÃO SANTOS), vamos apenas atualizar a senha
-- para garantir que você consiga logar com P26192920m

-- IMPORTANTE: No Supabase, a senha fica criptografada na tabela auth.users.
-- Não podemos atualizar via SQL simples.
-- O jeito é: Atualizar o usuário para "Email Confirmado" (caso não esteja) 
-- e instruir a usar o script de troca de senha via Admin API (que só o backend pode fazer) 
-- OU deletar e recriar.

-- Como você disse que "já tem este cadastrado" e quer usar a senha P26192920m,
-- mas está dando "Credencial Inválida", significa que:
-- 1. A senha cadastrada foi outra (talvez digitada errado ou com espaço).
-- 2. O email não foi confirmado.

-- Vamos confirmar o email primeiro:
UPDATE auth.users
SET email_confirmed_at = now(), confirmed_at = now(), last_sign_in_at = now()
WHERE email = 'pr.vcsantos@gmail.com';

-- Se mesmo assim não entrar, a senha está errada.
-- A solução mais rápida é deletar este usuário específico e cadastrar de novo com a senha certa.
-- Execute o DELETE abaixo SE E SOMENTE SE você quiser recadastrar com a senha correta:

-- DELETE FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
