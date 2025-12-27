-- CORREÇÃO DE CHAVE ESTRANGEIRA E PERMISSÕES DE LEITURA
-- O erro "violates foreign key constraint student_enrollments_student_id_fkey" acontece porque
-- o Frontend tenta criar a matrícula mas não consegue "ver" o usuário recém-criado na tabela auth.users,
-- ou o trigger de criação de perfil falhou silenciosamente e o perfil não existe.

-- 1. Garantir que o perfil seja criado (se falhou antes)
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 'student')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_profile_trigger ON auth.users;
CREATE TRIGGER ensure_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_profile_exists();

-- 2. Resolver o problema da Foreign Key:
-- A tabela student_enrollments aponta para auth.users.
-- Se o RLS estiver impedindo a leitura, o INSERT pode falhar na verificação da chave.

-- Mas o erro mais provável é que a constraint está apontando para 'profiles' em vez de 'auth.users'
-- ou vice-versa, e o registro não existe na tabela alvo.

-- Vamos verificar e corrigir a Foreign Key para apontar para auth.users (que é o padrão)
-- e garantir que ela seja ON DELETE CASCADE
ALTER TABLE public.student_enrollments
  DROP CONSTRAINT IF EXISTS student_enrollments_student_id_fkey;

ALTER TABLE public.student_enrollments
  ADD CONSTRAINT student_enrollments_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 3. Mesmo para 'payments'
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_student_id_fkey;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- 4. Mesmo para 'student_credentials'
ALTER TABLE public.student_credentials
  DROP CONSTRAINT IF EXISTS student_credentials_student_id_fkey;

ALTER TABLE public.student_credentials
  ADD CONSTRAINT student_credentials_student_id_fkey
  FOREIGN KEY (student_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
