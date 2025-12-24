-- Add lifetime option to courses
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_final_exam BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS total_subjects INTEGER DEFAULT 0;

COMMENT ON COLUMN courses.is_lifetime IS 'Se o curso é vitalício (sem data de expiração)';
COMMENT ON COLUMN courses.has_final_exam IS 'Se o curso tem prova final';
COMMENT ON COLUMN courses.total_subjects IS 'Número total de matérias no curso';

-- Create course_subjects table (matérias)
CREATE TABLE IF NOT EXISTS course_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject_order INTEGER NOT NULL,
  estimated_hours DECIMAL(5,2),
  has_exam BOOLEAN DEFAULT true,
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_subjects_course ON course_subjects(course_id, subject_order);
CREATE INDEX idx_course_subjects_active ON course_subjects(course_id, is_active) WHERE is_active = true;

ALTER TABLE course_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subjects"
  ON course_subjects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage subjects"
  ON course_subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Update modules table to link to subjects
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES course_subjects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS module_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_modules_subject ON modules(subject_id, module_order);

COMMENT ON COLUMN modules.subject_id IS 'Matéria à qual o módulo pertence';
COMMENT ON COLUMN modules.module_order IS 'Ordem do módulo dentro da matéria';

-- Create module_contents table
CREATE TABLE IF NOT EXISTS module_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('pdf', 'word', 'powerpoint', 'text', 'video', 'youtube', 'external_link')),
  content_order INTEGER NOT NULL,
  
  -- File storage
  file_url TEXT,
  file_size BIGINT,
  file_name TEXT,
  
  -- Text content
  text_content TEXT,
  
  -- YouTube/External
  youtube_url TEXT,
  external_url TEXT,
  embed_code TEXT,
  
  -- Metadata
  duration_minutes INTEGER,
  is_required BOOLEAN DEFAULT true,
  is_downloadable BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_module_contents_module ON module_contents(module_id, content_order);
CREATE INDEX idx_module_contents_type ON module_contents(content_type);

ALTER TABLE module_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active contents"
  ON module_contents FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage contents"
  ON module_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Create subject_exams table
CREATE TABLE IF NOT EXISTS subject_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES course_subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score DECIMAL(5,2) DEFAULT 70.00,
  time_limit_minutes INTEGER,
  max_attempts INTEGER DEFAULT 3,
  randomize_questions BOOLEAN DEFAULT true,
  show_results_immediately BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subject_exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES subject_exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  question_order INTEGER,
  points DECIMAL(5,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subject_exams_subject ON subject_exams(subject_id);
CREATE INDEX idx_subject_exam_questions_exam ON subject_exam_questions(exam_id, question_order);

ALTER TABLE subject_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_exam_questions ENABLE ROW LEVEL SECURITY;

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_subject_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES course_subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  exam_score DECIMAL(5,2),
  exam_attempts INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  UNIQUE(student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS student_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  UNIQUE(student_id, module_id)
);

CREATE TABLE IF NOT EXISTS student_content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES module_contents(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_duration_seconds INTEGER,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(student_id, content_id)
);

CREATE INDEX idx_student_subject_progress ON student_subject_progress(student_id, subject_id);
CREATE INDEX idx_student_module_progress ON student_module_progress(student_id, module_id);
CREATE INDEX idx_student_content_views ON student_content_views(student_id, content_id);

-- Triggers for updated_at
CREATE TRIGGER course_subjects_updated_at
  BEFORE UPDATE ON course_subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER module_contents_updated_at
  BEFORE UPDATE ON module_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subject_exams_updated_at
  BEFORE UPDATE ON subject_exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE course_subjects IS 'Matérias dentro de um curso (ex: Pneumatologia, Soteriologia)';
COMMENT ON TABLE module_contents IS 'Conteúdos dentro de um módulo (PDFs, vídeos, textos, etc.)';
COMMENT ON TABLE subject_exams IS 'Provas ao final de cada matéria';
COMMENT ON TABLE student_subject_progress IS 'Progresso do aluno em cada matéria';
COMMENT ON TABLE student_module_progress IS 'Progresso do aluno em cada módulo';
COMMENT ON TABLE student_content_views IS 'Visualizações de conteúdo pelos alunos';
