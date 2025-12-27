-- SCRIPT CORRIGIDO PARA CONFIRMAR USUÁRIO
-- A coluna 'confirmed_at' é gerada automaticamente em versões novas do Supabase.
-- Vamos atualizar apenas 'email_confirmed_at', que é o suficiente para liberar o login.

DO $$
DECLARE
  v_email text := 'pr.vcsantos@gmail.com';
  v_user_id uuid;
BEGIN
  -- Buscar ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NOT NULL THEN
    -- 1. Confirmar Email (Apenas email_confirmed_at)
    UPDATE auth.users
    SET email_confirmed_at = now()
    WHERE id = v_user_id;
    
    -- 2. Criar Perfil
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (v_user_id, 'Pastor Valmir Santos', v_email, 'student', true)
    ON CONFLICT (id) DO UPDATE SET role = 'student', is_active = true;
    
    -- 3. Garantir Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'student')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE '✅ Usuário corrigido com sucesso!';
  ELSE
    RAISE NOTICE '❌ Usuário não encontrado.';
  END IF;
END $$;
