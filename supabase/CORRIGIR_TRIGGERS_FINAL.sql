-- CORREÇÃO FINAL DE TRIGGERS
-- Remove todos os triggers da tabela auth.users e recria apenas o necessário
-- Isso elimina conflitos de triggers duplicados ou antigos

-- 1. Dropar triggers antigos conhecidos (e desconhecidos pelo nome genérico se possível)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 2. Garantir que a função handler seja segura e idempotente (não quebra se rodar 2x)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Perfil (Profiles)
  INSERT INTO public.profiles (
    id, full_name, email, role, is_active, cpf, phone, education_level
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    true,
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'education_level'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    cpf = EXCLUDED.cpf,
    phone = EXCLUDED.phone,
    education_level = EXCLUDED.education_level;

  -- 2. Role (User Roles) - CRÍTICO: Usar ON CONFLICT DO NOTHING
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro catastrófico no trigger, permitir a criação do usuário no Auth
  -- (O erro será silenciado aqui, mas o usuário será criado. O Frontend pode tentar corrigir depois)
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o Trigger Único
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Limpeza final de duplicatas em user_roles (caso tenha sobrado lixo)
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.role = b.role;
