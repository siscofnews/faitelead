-- ============================================
-- SISTEMA DE PRÉ-INSCRIÇÃO E CADASTRO PÚBLICO
-- ============================================
-- Alunos se cadastram publicamente
-- Indicam interesse em curso
-- Admins aprovam e matriculam
-- ============================================

-- Tabela de Pré-Inscrições (Self-Registration)
CREATE TABLE IF NOT EXISTS student_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Pessoais
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  birth_date DATE NOT NULL,
  
  -- Documento
  country TEXT NOT NULL DEFAULT 'Brasil',
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  
  -- Foto
  photo_url TEXT,
  
  -- Endereço
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Interesse em Curso
  desired_course_id UUID REFERENCES courses(id),
  desired_course_name TEXT, -- Nome do curso (caso o ID mude)
  
  -- Informações Adicionais
  education_level TEXT, -- Ensino Médio, Superior, etc
  why_course TEXT, -- Por que quer fazer o curso
  how_found_us TEXT, -- Como conheceu a instituição
  
  -- Status da Inscrição
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'enrolled')),
  
  -- Aprovação
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Polo/Núcleo (se especificado)
  preferred_polo_id UUID REFERENCES polos(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_student_applications_status ON student_applications(status);
CREATE INDEX IF NOT EXISTS idx_student_applications_email ON student_applications(email);
CREATE INDEX IF NOT EXISTS idx_student_applications_course ON student_applications(desired_course_id);
CREATE INDEX IF NOT EXISTS idx_student_applications_created ON student_applications(created_at DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_student_applications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_applications_timestamp
  BEFORE UPDATE ON student_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_student_applications_timestamp();

-- Função para aprovar inscrição e criar usuário
CREATE OR REPLACE FUNCTION approve_student_application(
  p_application_id UUID,
  p_approved_by UUID,
  p_temporary_password TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_application RECORD;
  v_user_id UUID;
  v_password TEXT;
BEGIN
  -- Buscar inscrição
  SELECT * INTO v_application 
  FROM student_applications 
  WHERE id = p_application_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inscrição não encontrada ou já processada';
  END IF;
  
  -- Gerar senha temporária se não fornecida
  v_password := COALESCE(p_temporary_password, substring(md5(random()::text) from 1 for 8));
  
  -- Criar usuário no auth (isso precisa ser feito via Supabase Admin API)
  -- Por enquanto, apenas atualizar status
  
  -- Atualizar status da inscrição
  UPDATE student_applications SET
    status = 'approved',
    reviewed_by = p_approved_by,
    reviewed_at = NOW()
  WHERE id = p_application_id;
  
  -- Retornar ID para próxima etapa
  RETURN p_application_id;
END;
$$ LANGUAGE plpgsql;

-- Função para rejeitar inscrição
CREATE OR REPLACE FUNCTION reject_student_application(
  p_application_id UUID,
  p_rejected_by UUID,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE student_applications SET
    status = 'rejected',
    reviewed_by = p_rejected_by,
    reviewed_at = NOW(),
    rejection_reason = p_reason
  WHERE id = p_application_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode criar inscrição (auto-cadastro público)
CREATE POLICY "Anyone can create application" ON student_applications
  FOR INSERT WITH CHECK (true);

-- Apenas a própria pessoa pode ver sua inscrição (sem autenticação)
-- Admins podem ver todas
CREATE POLICY "Admins can view all applications" ON student_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Apenas admins podem atualizar
CREATE POLICY "Admins can update applications" ON student_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Comments
COMMENT ON TABLE student_applications IS 'Pré-inscrições públicas de alunos interessados em cursos';
COMMENT ON COLUMN student_applications.status IS 'pending: aguardando, approved: aprovado, rejected: rejeitado, enrolled: matriculado';
