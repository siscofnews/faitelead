-- ========================================
-- RESETAR SENHA - SIMPLES E DIRETO
-- ========================================
-- ID do usuário: 5e9541ca-ce6e-4301-958f-b7c93f56e356
-- Nova senha: Faitel@2025

UPDATE auth.users
SET 
  encrypted_password = crypt('Faitel@2025', gen_salt('bf')),
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = '5e9541ca-ce6e-4301-958f-b7c93f56e356';

-- Verificar
SELECT 
  id,
  email,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE id = '5e9541ca-ce6e-4301-958f-b7c93f56e356';

-- ========================================
-- CREDENCIAIS:
-- Email: faiteloficial@gmail.com
-- Senha: Faitel@2025
-- ========================================
