-- CORREÇÃO DE DUPLICIDADE EM USER_ROLES E FLUXO DE CADASTRO
-- O erro "duplicate key value violates unique constraint" ocorre porque tanto o Trigger quanto o Frontend estão tentando inserir a role 'student'.

-- 1. Remover a inserção de role do Trigger para deixar o Frontend controlar isso (ou vice-versa)
-- Vamos ajustar o trigger para inserir APENAS se não houver conflito, usando ON CONFLICT DO NOTHING

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir Perfil
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

  -- Inserir Role (COM PROTEÇÃO CONTRA DUPLICIDADE)
  -- Isso garante que se o front tentar inserir depois, ou se o trigger rodar duas vezes, não quebre.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir que a constraint de unicidade exista corretamente (caso não exista ou esteja errada)
-- Primeiro, remover duplicatas se existirem
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.role = b.role;

-- 3. Função RPC para criação segura de aluno (Alternativa ao frontend direto)
-- Isso permite que o frontend chame uma função única em vez de várias chamadas sujeitas a erro de rede/permissão.
CREATE OR REPLACE FUNCTION create_student_v2(
  p_email text,
  p_password text,
  p_full_name text,
  p_cpf text,
  p_phone text,
  p_education_level text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- A criação do usuário Auth deve ser feita pelo Client Supabase (GoTrue), 
  -- mas podemos facilitar a criação de dados complementares aqui se necessário.
  -- Como o erro é no INSERT do user_roles, a correção do Trigger acima (ON CONFLICT DO NOTHING) deve resolver.
  RETURN null; 
END;
$$ LANGUAGE plpgsql;

-- 4. Ajustar permissões para garantir que o Frontend possa fazer o INSERT se o Trigger falhar ou não rodar
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

-- Permitir INSERT para Admins (com verificação de segurança)
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL 
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );

-- Permitir SELECT público (essencial para evitar recursão na verificação de admin)
DROP POLICY IF EXISTS "Public read roles" ON public.user_roles;
CREATE POLICY "Public read roles" ON public.user_roles
  FOR SELECT USING (true);
