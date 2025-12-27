-- SCRIPT PARA LIMPAR USUÁRIO TRAVADO
-- Use este script para remover um usuário que ficou "pela metade" (criado no Auth mas sem perfil)
-- Isso resolve o erro "For security purposes..." pois permite criar do zero novamente.

-- 1. Substitua o email abaixo pelo email do aluno que você está tentando cadastrar
-- Exemplo: 'aluno@teste.com'
DO $$
DECLARE
  v_email text := 'email_do_aluno_aqui@exemplo.com'; -- <--- COLOQUE O EMAIL AQUI
BEGIN
  -- Deletar da tabela de autenticação (isso apaga em cascata profiles, roles, etc)
  DELETE FROM auth.users WHERE email = v_email;
  
  RAISE NOTICE 'Usuário % deletado com sucesso. Tente cadastrar novamente.', v_email;
END $$;
