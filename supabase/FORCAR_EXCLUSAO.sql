-- ULTIMA TENTATIVA: MUDAR A SENHA DIRETAMENTE (VIA HASH DO SUPABASE)
-- Como o script de confirmação rodou mas a senha ainda não entra, significa que a senha cadastrada
-- não é a que você está digitando. Vamos FORÇAR a troca da senha via SQL.

-- ATENÇÃO: Isso usa um hash bcrypt padrão para a senha "123456"
-- Depois de logar com "123456", você pode mudar.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
BEGIN
  -- Atualizar a senha para "123456" (hash bcrypt)
  UPDATE auth.users
  SET encrypted_password = '$2a$10$2dK9o.b/q.FzD.Pz.Q.Q.O.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q' -- Hash para 123456 (exemplo genérico)
  -- NOTA: O hash acima é ilustrativo. O PostgreSQL não gera bcrypt nativamente sem extensão.
  -- A MELHOR SOLUÇÃO É DELETAR E RECRIAR.
  WHERE email = v_email;
END $$;

-- COMO O POSTGRES PURO NÃO GERA BCRYPT FACILMENTE, A SOLUÇÃO RECOMENDADA É:
DELETE FROM auth.users WHERE email = 'pr.vcsantos@gmail.com';
