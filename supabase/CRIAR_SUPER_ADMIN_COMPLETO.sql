-- ========================================
-- CRIAR SUPER ADMIN DO ZERO
-- ========================================
-- Este script cria o usuário faiteloficial@gmail.com com a senha Admin123!

-- PASSO 1: Criar usuário no auth.users (se não existir)
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Verificar se usuário já existe
    SELECT id INTO new_user_id
    FROM auth.users
    WHERE email = 'faiteloficial@gmail.com';
    
    -- Se não existir, criar
    IF new_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'faiteloficial@gmail.com',
            crypt('Admin123!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Super Administrador FAITEL"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;
        
        RAISE NOTICE 'Usuário criado com ID: %', new_user_id;
    ELSE
        -- Se existir, atualizar senha
        UPDATE auth.users
        SET 
            encrypted_password = crypt('Admin123!', gen_salt('bf')),
            email_confirmed_at = NOW(),
            confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = new_user_id;
        
        RAISE NOTICE 'Senha do usuário atualizada. ID: %', new_user_id;
    END IF;
    
    -- PASSO 2: Criar/atualizar perfil
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        is_active,
        approval_status,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'faiteloficial@gmail.com',
        'Super Administrador FAITEL',
        true,
        'approved',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        is_active = true,
        approval_status = 'approved',
        updated_at = NOW();
    
    -- PASSO 3: Garantir roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Roles configuradas com sucesso!';
END $$;

-- Verificar resultado
SELECT 
    'USUÁRIO CRIADO:' as status,
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at
FROM auth.users au
WHERE au.email = 'faiteloficial@gmail.com';

-- Verificar perfil
SELECT 
    'PERFIL:' as status,
    p.id,
    p.email,
    p.full_name,
    p.is_active,
    p.approval_status
FROM public.profiles p
WHERE p.email = 'faiteloficial@gmail.com';

-- Verificar roles
SELECT 
    'ROLES:' as status,
    ur.role,
    au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com'
ORDER BY ur.role;

-- ========================================
-- CREDENCIAIS DE LOGIN:
-- Email: faiteloficial@gmail.com
-- Senha: Admin123!
-- ========================================
