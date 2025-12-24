-- ========================================
-- RESETAR SENHA - CORRIGIDO
-- ========================================

UPDATE auth.users
SET 
  encrypted_password = crypt('Faitel@2025', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = '5e9541ca-ce6e-4301-958f-b7c93f56e356';

-- Verificar
SELECT 
  id,
  email,
  email_confirmed_at
FROM auth.users
WHERE id = '5e9541ca-ce6e-4301-958f-b7c93f56e356';
