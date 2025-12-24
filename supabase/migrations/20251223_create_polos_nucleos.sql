-- ============================================
-- FAITEL EAD - Sistema de Polos e Núcleos
-- ============================================
-- Cria tabelas para gestão de Polos e Núcleos
-- com suporte CEP, diretores e vinculação de alunos
-- ============================================

-- 1. Tabela de Polos
CREATE TABLE IF NOT EXISTS polos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informações Básicas
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  
  -- Endereço
  is_international BOOLEAN DEFAULT false,
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Brasil',
  
  -- Diretor do Polo
  director_name TEXT NOT NULL,
  director_email TEXT NOT NULL UNIQUE,
  director_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CHECK (is_international = false OR cep IS NULL), -- Internacional não tem CEP
  CHECK (is_international = true OR cep IS NOT NULL) -- Brasil tem CEP obrigatório
);

-- Índices para performance
CREATE INDEX idx_polos_active ON polos(is_active) WHERE is_active = true;
CREATE INDEX idx_polos_city ON polos(city);
CREATE INDEX idx_polos_state ON polos(state);
CREATE INDEX idx_polos_director ON polos(director_user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_polos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER polos_updated_at
  BEFORE UPDATE ON polos
  FOR EACH ROW
  EXECUTE FUNCTION update_polos_updated_at();

-- ============================================
-- 2. Tabela de Núcleos
CREATE TABLE IF NOT EXISTS nucleos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com Polo (núcleo pertence a um polo)
  polo_id UUID REFERENCES polos(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações Básicas
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  
  -- Endereço
  is_international BOOLEAN DEFAULT false,
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Brasil',
  
  -- Coordenador do Núcleo
  coordinator_name TEXT NOT NULL,
  coordinator_email TEXT NOT NULL UNIQUE,
  coordinator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadados
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CHECK (is_international = false OR cep IS NULL),
  CHECK (is_international = true OR cep IS NOT NULL)
);

-- Índices
CREATE INDEX idx_nucleos_polo ON nucleos(polo_id, is_active);
CREATE INDEX idx_nucleos_active ON nucleos(is_active) WHERE is_active = true;
CREATE INDEX idx_nucleos_city ON nucleos(city);
CREATE INDEX idx_nucleos_coordinator ON nucleos(coordinator_user_id);

-- Trigger
CREATE TRIGGER nucleos_updated_at
  BEFORE UPDATE ON nucleos
  FOR EACH ROW
  EXECUTE FUNCTION update_polos_updated_at();

-- ============================================
-- 3. Tabela de Atribuição de Alunos
-- (Define se aluno é da Matriz, Polo ou Núcleo)
CREATE TABLE IF NOT EXISTS student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Aluno
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de atribuição (apenas um pode estar preenchido)
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('matriz', 'polo', 'nucleo')),
  
  -- IDs (apenas um deve estar preenchido)
  polo_id UUID REFERENCES polos(id) ON DELETE SET NULL,
  nucleo_id UUID REFERENCES nucleos(id) ON DELETE SET NULL,
  
  -- Metadados
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(student_id), -- Um aluno só pode estar em um lugar
  CHECK (
    (assignment_type = 'matriz' AND polo_id IS NULL AND nucleo_id IS NULL) OR
    (assignment_type = 'polo' AND polo_id IS NOT NULL AND nucleo_id IS NULL) OR
    (assignment_type = 'nucleo' AND nucleo_id IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_student_assignments_student ON student_assignments(student_id);
CREATE INDEX idx_student_assignments_polo ON student_assignments(polo_id) WHERE polo_id IS NOT NULL;
CREATE INDEX idx_student_assignments_nucleo ON student_assignments(nucleo_id) WHERE nucleo_id IS NOT NULL;
CREATE INDEX idx_student_assignments_type ON student_assignments(assignment_type);

-- ============================================
-- 4. Tabela de Cursos Disponíveis por Polo
-- (Polos podem oferecer subconjunto dos cursos da matriz)
CREATE TABLE IF NOT EXISTS polo_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  polo_id UUID NOT NULL REFERENCES polos(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  
  is_active BOOLEAN DEFAULT true,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  
  UNIQUE(polo_id, course_id)
);

-- Índices
CREATE INDEX idx_polo_courses_polo ON polo_courses(polo_id, is_active);
CREATE INDEX idx_polo_courses_course ON polo_courses(course_id);

-- ============================================
-- 5. Funções Auxiliares

-- Função: Obter cursos disponíveis para um aluno
CREATE OR REPLACE FUNCTION get_available_courses_for_student(check_student_id UUID)
RETURNS TABLE(course_id UUID) AS $$
DECLARE
  assignment RECORD;
BEGIN
  -- Buscar atribuição do aluno
  SELECT * INTO assignment
  FROM student_assignments
  WHERE student_id = check_student_id;
  
  -- Se não tem atribuição ou é da matriz, retorna todos os cursos
  IF assignment IS NULL OR assignment.assignment_type = 'matriz' THEN
    RETURN QUERY SELECT id FROM courses WHERE is_active = true;
    RETURN;
  END IF;
  
  -- Se é de polo, retorna cursos do polo
  IF assignment.assignment_type = 'polo' THEN
    RETURN QUERY 
      SELECT pc.course_id 
      FROM polo_courses pc
      WHERE pc.polo_id = assignment.polo_id 
        AND pc.is_active = true;
    RETURN;
  END IF;
  
  -- Se é de núcleo, retorna cursos do polo pai
  IF assignment.assignment_type = 'nucleo' THEN
    RETURN QUERY 
      SELECT pc.course_id
      FROM polo_courses pc
      INNER JOIN nucleos n ON n.polo_id = pc.polo_id
      WHERE n.id = assignment.nucleo_id
        AND pc.is_active = true;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Verificar se usuário é diretor de polo
CREATE OR REPLACE FUNCTION is_polo_director_by_email(check_email TEXT, check_polo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM polos
    WHERE id = check_polo_id 
      AND director_email = check_email
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Verificar se usuário é coordenador de núcleo
CREATE OR REPLACE FUNCTION is_nucleo_coordinator_by_email(check_email TEXT, check_nucleo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM nucleos
    WHERE id = check_nucleo_id 
      AND coordinator_email = check_email
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RLS Policies

ALTER TABLE polos ENABLE ROW LEVEL SECURITY;
ALTER TABLE nucleos ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE polo_courses ENABLE ROW LEVEL SECURITY;

-- Policies para Polos
CREATE POLICY "Super admins can manage all polos"
  ON polos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Directors can view their own polo"
  ON polos FOR SELECT
  USING (director_user_id = auth.uid());

CREATE POLICY "Everyone can view active polos"
  ON polos FOR SELECT
  USING (is_active = true);

-- Policies para Núcleos
CREATE POLICY "Super admins can manage all nucleos"
  ON nucleos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Coordinators can view their nucleo"
  ON nucleos FOR SELECT
  USING (coordinator_user_id = auth.uid());

CREATE POLICY "Directors can view nucleos of their polo"
  ON nucleos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polos 
      WHERE polos.id = nucleos.polo_id 
        AND polos.director_user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active nucleos"
  ON nucleos FOR SELECT
  USING (is_active = true);

-- Policies para Student Assignments
CREATE POLICY "Super admins can manage all assignments"
  ON student_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Students can view their own assignment"
  ON student_assignments FOR SELECT
  USING (student_id = auth.uid());

-- Policies para Polo Courses
CREATE POLICY "Super admins can manage polo courses"
  ON polo_courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Everyone can view active polo courses"
  ON polo_courses FOR SELECT
  USING (is_active = true);

-- ============================================
-- 7. Comments para documentação

COMMENT ON TABLE polos IS 'Polos da FAITEL - unidades descentralizadas';
COMMENT ON TABLE nucleos IS 'Núcleos vinculados a polos';
COMMENT ON TABLE student_assignments IS 'Vinculação de alunos a Matriz/Polo/Núcleo';
COMMENT ON TABLE polo_courses IS 'Cursos disponíveis em cada polo';

COMMENT ON COLUMN polos.is_international IS 'Se true, polo é fora do Brasil e não precisa CEP';
COMMENT ON COLUMN polos.director_user_id IS 'Referência ao usuário autenticado do diretor';
COMMENT ON COLUMN nucleos.polo_id IS 'Polo pai do núcleo';
COMMENT ON COLUMN student_assignments.assignment_type IS 'matriz, polo ou nucleo';

COMMENT ON FUNCTION get_available_courses_for_student IS 'Retorna cursos disponíveis para aluno baseado em sua atribuição';
COMMENT ON FUNCTION is_polo_director_by_email IS 'Verifica se email é de diretor de polo específico';
COMMENT ON FUNCTION is_nucleo_coordinator_by_email IS 'Verifica se email é de coordenador de núcleo específico';
