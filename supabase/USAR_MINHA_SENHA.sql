-- ========================================
-- RESETAR PARA SUA SENHA
-- ========================================

UPDATE auth.users
SET 
  encrypted_password = crypt('P26192920m', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = '5e9541ca-ce6e-4301-958f-b7c93f56e356';

SELECT 'Senha atualizada com sucesso!' as status;
