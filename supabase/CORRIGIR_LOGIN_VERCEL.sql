-- SCRIPT DE CORREÇÃO URGENTE PARA LOGIN NA VERCEL
-- Execute este script no SQL Editor do Supabase: https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/sql/new

-- 1. Forçar atualização da senha para 'P26192920m' e confirmar email
UPDATE auth.users
SET 
    encrypted_password = crypt('P26192920m', gen_salt('bf')),
    email_confirmed_at = NOW(),
    raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}',
    raw_user_meta_data = raw_user_meta_data || '{"full_name": "Super Admin FAITEL"}',
    is_super_admin = false, -- Supabase não usa isso para users normais, mas garante limpeza
    role = 'authenticated',
    updated_at = NOW()
WHERE email = 'faiteloficial@gmail.com';

-- 2. Garantir que o usuário existe na tabela de perfis
-- Nota: A coluna correta pode ser 'nome' ou 'full_name' dependendo da migração aplicada
-- Este script tenta usar 'nome' primeiro, se falhar, use a versão alternativa abaixo

-- VERSÃO 1: Tenta com 'nome'
-- INSERT INTO public.profiles (id, nome, role, ativo)
-- SELECT id, 'Super Admin FAITEL', 'SUPER_ADMIN', true
-- FROM auth.users WHERE email = 'faiteloficial@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', ativo = true;

-- VERSÃO 5 (CORRIGIDA): Incluindo campos obrigatórios (email, education_level)
-- O erro anterior confirmou que 'email' e 'education_level' são NOT NULL
INSERT INTO public.profiles (id, full_name, email, education_level, phone, cpf)
SELECT 
    id, 
    'Super Admin FAITEL',
    email,
    'pos_graduacao', -- Valor padrão seguro do enum
    '00000000000',   -- Valor dummy para garantir NOT NULL
    '00000000000'    -- Valor dummy para garantir NOT NULL
FROM auth.users 
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET 
    full_name = 'Super Admin FAITEL',
    education_level = 'pos_graduacao';

-- VERSÃO 6 (CORRIGIDA): Removendo 'active' de user_roles (não existe na criação original)
-- A tabela user_roles tem apenas (id, user_id, role, created_at) conforme migration 20251107...

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Verificação final
SELECT email, encrypted_password, email_confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'faiteloficial@gmail.com';
