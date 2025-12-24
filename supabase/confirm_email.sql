-- Forçar confirmação de e-mail do Super Admin (Corrigido)
-- A coluna confirmed_at é gerada e não pode ser alterada manualmente.
-- Execute apenas isso no Supabase SQL Editor:

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'pr.vcsantos@gmail.com';
