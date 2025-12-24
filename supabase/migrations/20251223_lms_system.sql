-- ============================================
-- FAITEL EAD - Sistema LMS Completo
-- ============================================
-- Matrículas, Módulos, Provas e Progressão
-- Nota mínima: 70%
-- ============================================

-- 1. Atualizar student_enrollments
ALTER TABLE student_enrollments
ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'active' 
  CHECK (enrollment_status IN ('pending', 'active', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS enrolled_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL DEFAULT 0;

-- 2. Atualizar modules
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS order_index INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duration_hours INT,
ADD COLUMN IF NOT EXISTS passing_grade DECIMAL DEFAULT 70.0;

-- Criar índice para ordem
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);

-- 3. Atualizar lessons  
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS lesson_type TEXT DEFAULT 'video' 
  CHECK (lesson_type IN ('video', 'text', 'pdf', 'quiz', 'live')),
ADD COLUMN IF NOT EXISTS order_index INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_minutes INT,
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, order_index);

-- 4. Tabela de Provas dos Módulos
CREATE TABLE IF NOT EXISTS module_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  
  exam_type TEXT NOT NULL CHECK (exam_type IN ('simulado', 'prova_final')),
  title TEXT NOT NULL,
  description TEXT,
  
  total_questions INT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  passing_grade DECIMAL NOT NULL DEFAULT 70.0,
  attempts_allowed INT DEFAULT 3,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_module_exams_module ON module_exams(module_id);

-- 5. Questões das Provas
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES module_exams(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' 
    CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
  
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  
  points DECIMAL DEFAULT 1.0,
  order_index INT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id, order_index);

-- 6. Tentativas de Provas
CREATE TABLE IF NOT EXISTS student_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES module_exams(id) ON DELETE CASCADE,
  
  attempt_number INT NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  score DECIMAL,
  max_score DECIMAL,
  percentage DECIMAL,
  passed BOOLEAN,
  
  answers JSONB,
  
  status TEXT DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  
  UNIQUE(student_id, exam_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_student_exam_attempts_student ON student_exam_attempts(student_id, exam_id);

-- 7. Progresso do Aluno por Módulo
CREATE TABLE IF NOT EXISTS student_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES student_enrollments(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'locked' 
    CHECK (status IN ('locked', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  lessons_completed INT DEFAULT 0,
  total_lessons INT DEFAULT 0,
  
  final_exam_score DECIMAL,
  final_exam_passed BOOLEAN DEFAULT false,
  
  unlocked_at TIMESTAMPTZ,
  
  UNIQUE(student_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_student_module_progress ON student_module_progress(student_id, module_id);

-- ============================================
-- FUNÇÕES
-- ============================================

-- Função: Matricular aluno em curso
CREATE OR REPLACE FUNCTION enroll_student_in_course(
  p_student_id UUID,
  p_course_id UUID,
  p_enrolled_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_enrollment_id UUID;
  v_module RECORD;
  v_first_module BOOLEAN := true;
BEGIN
  INSERT INTO student_enrollments (
    student_id, course_id, enrolled_by, enrollment_status, enrolled_at
  ) VALUES (
    p_student_id, p_course_id, p_enrolled_by, 'active', NOW()
  ) RETURNING id INTO v_enrollment_id;
  
  FOR v_module IN 
    SELECT * FROM modules 
    WHERE course_id = p_course_id 
    ORDER BY order_index
  LOOP
    INSERT INTO student_module_progress (
      student_id,
      module_id,
      enrollment_id,
      status,
      unlocked_at,
      total_lessons
    ) VALUES (
      p_student_id,
      v_module.id,
      v_enrollment_id,
      CASE WHEN v_first_module THEN 'in_progress' ELSE 'locked' END,
      CASE WHEN v_first_module THEN NOW() ELSE NULL END,
      (SELECT COUNT(*) FROM lessons WHERE module_id = v_module.id)
    );
    
    v_first_module := false;
  END LOOP;
  
  RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Função: Submeter prova e calcular nota
CREATE OR REPLACE FUNCTION submit_exam_attempt(
  p_attempt_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_attempt RECORD;
  v_exam RECORD;
  v_score DECIMAL := 0;
  v_max_score DECIMAL;
  v_percentage DECIMAL;
  v_passed BOOLEAN;
  v_answer JSONB;
  v_question RECORD;
BEGIN
  SELECT * INTO v_attempt FROM student_exam_attempts WHERE id = p_attempt_id;
  SELECT * INTO v_exam FROM module_exams WHERE id = v_attempt.exam_id;
  
  SELECT SUM(points) INTO v_max_score 
  FROM exam_questions WHERE exam_id = v_exam.id;
  
  FOR v_answer IN SELECT * FROM jsonb_array_elements(v_attempt.answers)
  LOOP
    SELECT * INTO v_question 
    FROM exam_questions 
    WHERE id = (v_answer->>'question_id')::UUID;
    
    IF v_question.question_type = 'multiple_choice' THEN
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_question.options) AS opt
        WHERE opt->>'id' = v_answer->>'answer' 
          AND (opt->>'is_correct')::boolean = true
      ) THEN
        v_score := v_score + v_question.points;
      END IF;
    ELSIF v_question.question_type = 'true_false' THEN
      IF v_question.correct_answer = v_answer->>'answer' THEN
        v_score := v_score + v_question.points;
      END IF;
    END IF;
  END LOOP;
  
  v_percentage := (v_score / NULLIF(v_max_score, 0)) * 100;
  v_passed := v_percentage >= v_exam.passing_grade;
  
  UPDATE student_exam_attempts SET
    completed_at = NOW(),
    score = v_score,
    max_score = v_max_score,
    percentage = v_percentage,
    passed = v_passed,
    status = 'completed'
  WHERE id = p_attempt_id;
  
  IF v_exam.exam_type = 'prova_final' AND v_passed THEN
    PERFORM unlock_next_module(v_attempt.student_id, v_exam.module_id);
  END IF;
  
  RETURN jsonb_build_object(
    'score', v_score,
    'max_score', v_max_score,
    'percentage', v_percentage,
    'passed', v_passed
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Desbloquear próximo módulo
CREATE OR REPLACE FUNCTION unlock_next_module(
  p_student_id UUID,
  p_current_module_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_course_id UUID;
  v_current_order INT;
  v_next_module_id UUID;
  v_enrollment_id UUID;
BEGIN
  SELECT course_id, order_index INTO v_course_id, v_current_order
  FROM modules WHERE id = p_current_module_id;
  
  SELECT enrollment_id INTO v_enrollment_id
  FROM student_module_progress
  WHERE student_id = p_student_id AND module_id = p_current_module_id;
  
  UPDATE student_module_progress SET
    status = 'completed',
    completed_at = NOW(),
    final_exam_passed = true
  WHERE student_id = p_student_id 
    AND module_id = p_current_module_id;
  
  SELECT id INTO v_next_module_id
  FROM modules
  WHERE course_id = v_course_id
    AND order_index = v_current_order + 1
  LIMIT 1;
  
  IF v_next_module_id IS NOT NULL THEN
    UPDATE student_module_progress SET
      status = 'in_progress',
      unlocked_at = NOW()
    WHERE student_id = p_student_id
      AND module_id = v_next_module_id;
    
    RETURN true;
  ELSE
    UPDATE student_enrollments SET
      enrollment_status = 'completed',
      completed_at = NOW(),
      progress_percentage = 100
    WHERE id = v_enrollment_id;
    
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE module_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_module_progress ENABLE ROW LEVEL SECURITY;

-- Exams
CREATE POLICY "Students can view active exams" ON module_exams
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage exams" ON module_exams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Questions
CREATE POLICY "Students can view questions of active exams" ON exam_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM module_exams WHERE id = exam_questions.exam_id AND is_active = true)
  );

CREATE POLICY "Admins can manage questions" ON exam_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Attempts
CREATE POLICY "Students can view own attempts" ON student_exam_attempts
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create attempts" ON student_exam_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own attempts" ON student_exam_attempts
  FOR UPDATE USING (student_id = auth.uid());

-- Progress
CREATE POLICY "Students can view own progress" ON student_module_progress
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can view all progress" ON student_module_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE module_exams IS 'Provas e simulados dos módulos';
COMMENT ON TABLE exam_questions IS 'Questões das provas';
COMMENT ON TABLE student_exam_attempts IS 'Tentativas de provas dos alunos';
COMMENT ON TABLE student_module_progress IS 'Progresso dos alunos por módulo';

COMMENT ON FUNCTION enroll_student_in_course IS 'Matricula aluno e cria progressos de módulos';
COMMENT ON FUNCTION submit_exam_attempt IS 'Calcula nota e desbloqueia próximo módulo se aprovado';
COMMENT ON FUNCTION unlock_next_module IS 'Desbloqueia próximo módulo após aprovação (≥70%)';
