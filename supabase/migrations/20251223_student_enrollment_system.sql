-- ============================================
-- FAITEL EAD - Sistema de Matrícula de Alunos
-- ============================================
-- Adiciona campos para cadastro completo de alunos
-- com suporte a documentos internacionais
-- ============================================

-- 1. Atualizar tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS document_type TEXT CHECK (document_type IN ('CPF', 'NIF', 'NIR')),
ADD COLUMN IF NOT EXISTS document_number TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil' CHECK (country IN ('Brasil', 'Portugal', 'França'));

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_document ON profiles(document_type, document_number);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);

-- 3. Constraint: documento único por tipo
-- (Remover se já existir)
DO $$ 
BEGIN
    ALTER TABLE profiles 
    ADD CONSTRAINT unique_document_per_type UNIQUE (document_type, document_number);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Comments para documentação
COMMENT ON COLUMN profiles.photo_url IS 'URL da foto do aluno no Supabase Storage';
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do aluno';
COMMENT ON COLUMN profiles.document_type IS 'Tipo de documento: CPF (Brasil), NIF (Portugal), NIR (França)';
COMMENT ON COLUMN profiles.document_number IS 'Número do documento de identificação';
COMMENT ON COLUMN profiles.country IS 'País de origem do aluno: Brasil, Portugal ou França';

-- 5. Função para validar CPF (Brasil)
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cleaned TEXT;
    sum INT;
    digit1 INT;
    digit2 INT;
    i INT;
BEGIN
    -- Remover formatação
    cleaned := regexp_replace(cpf, '\D', '', 'g');
    
    -- Validar comprimento
    IF length(cleaned) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Validar se todos os dígitos são iguais
    IF cleaned ~ '^(\d)\1+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular primeiro dígito verificador
    sum := 0;
    FOR i IN 0..8 LOOP
        sum := sum + substring(cleaned, i + 1, 1)::INT * (10 - i);
    END LOOP;
    digit1 := 11 - (sum % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcular segundo dígito verificador
    sum := 0;
    FOR i IN 0..9 LOOP
        sum := sum + substring(cleaned, i + 1, 1)::INT * (11 - i);
    END LOOP;
    digit2 := 11 - (sum % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Validar dígitos
    RETURN substring(cleaned, 10, 1)::INT = digit1 
       AND substring(cleaned, 11, 1)::INT = digit2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Trigger para validar documento antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_student_document()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar CPF se for Brasil
    IF NEW.country = 'Brasil' AND NEW.document_type = 'CPF' THEN
        IF NOT validate_cpf(NEW.document_number) THEN
            RAISE EXCEPTION 'CPF inválido: %', NEW.document_number;
        END IF;
    END IF;
    
    -- Validar NIF se for Portugal
    IF NEW.country = 'Portugal' AND NEW.document_type = 'NIF' THEN
        -- Validação básica de tamanho (9 dígitos)
        IF NEW.document_number !~ '^\d{9}$' THEN
            RAISE EXCEPTION 'NIF deve ter 9 dígitos';
        END IF;
    END IF;
    
    -- Validar NIR se for França
    IF NEW.country = 'França' AND NEW.document_type = 'NIR' THEN
        -- Validação básica de tamanho (15 dígitos)
        IF NEW.document_number !~ '^\d{15}$' THEN
            RAISE EXCEPTION 'NIR deve ter 15 dígitos';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS validate_document_trigger ON profiles;
CREATE TRIGGER validate_document_trigger
    BEFORE INSERT OR UPDATE OF document_number, document_type, country
    ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_student_document();

-- 7. RLS Policy atualizada para photos
-- (Assumindo que o bucket student-photos será criado no Supabase Storage)

-- 8. View para listagem de alunos
CREATE OR REPLACE VIEW student_list AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.photo_url,
    p.birth_date,
    p.country,
    p.document_type,
    p.document_number,
    p.is_active,
    p.created_at,
    ur.role,
    -- Calcular idade
    EXTRACT(YEAR FROM AGE(p.birth_date)) AS age,
    -- Contar matrículas
    (SELECT COUNT(*) FROM student_enrollments WHERE student_id = p.id) AS enrollments_count
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'student'
ORDER BY p.created_at DESC;

-- Comments finais
COMMENT ON FUNCTION validate_cpf IS 'Valida CPF brasileiro com dígitos verificadores';
COMMENT ON FUNCTION validate_student_document IS 'Trigger para validar documentos antes de salvar';
COMMENT ON VIEW student_list IS 'View com dados completos dos alunos para listagem';
