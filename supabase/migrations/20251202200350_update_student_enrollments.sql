-- Add fields to student_enrollments for course completion tracking
ALTER TABLE student_enrollments
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completion_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS final_exam_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS passing_score DECIMAL(5,2) DEFAULT 70.00,
ADD COLUMN IF NOT EXISTS exam_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_exam_attempts INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requires_completion BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enrolled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'manual' CHECK (enrollment_type IN ('manual', 'self', 'bulk', 'automatic')),
ADD COLUMN IF NOT EXISTS enrollment_notes TEXT,
ADD COLUMN IF NOT EXISTS can_retake_exam BOOLEAN DEFAULT true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_completed ON student_enrollments(student_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_active_incomplete ON student_enrollments(student_id, is_active, completed_at) 
  WHERE is_active = true AND completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_course_active ON student_enrollments(course_id, is_active) 
  WHERE is_active = true;

-- Function to check if student has active permission
CREATE OR REPLACE FUNCTION has_enrollment_permission(
  p_student_id UUID,
  p_course_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
BEGIN
  -- Check for active permission
  SELECT EXISTS (
    SELECT 1 FROM enrollment_permissions
    WHERE student_id = p_student_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (
      -- Permission applies to all courses
      (specific_courses = ARRAY[]::UUID[] OR specific_courses IS NULL)
      OR
      -- Or permission applies to this specific course
      (p_course_id = ANY(specific_courses))
    )
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if student can enroll in a course
CREATE OR REPLACE FUNCTION can_student_enroll(
  p_student_id UUID,
  p_course_id UUID
) RETURNS TABLE(
  can_enroll BOOLEAN,
  reason TEXT,
  has_permission BOOLEAN,
  incomplete_courses INTEGER,
  current_enrollments INTEGER
) AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_incomplete_count INTEGER;
  v_current_count INTEGER;
  v_max_concurrent INTEGER;
BEGIN
  -- Check for special permission
  v_has_permission := has_enrollment_permission(p_student_id, p_course_id);
  
  -- Count incomplete courses that require completion
  SELECT COUNT(*) INTO v_incomplete_count
  FROM student_enrollments
  WHERE student_id = p_student_id
  AND is_active = true
  AND completed_at IS NULL
  AND requires_completion = true;
  
  -- Count current active enrollments
  SELECT COUNT(*) INTO v_current_count
  FROM student_enrollments
  WHERE student_id = p_student_id
  AND is_active = true;
  
  -- If has permission, check max concurrent limit
  IF v_has_permission THEN
    SELECT max_concurrent_courses INTO v_max_concurrent
    FROM enrollment_permissions
    WHERE student_id = p_student_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_max_concurrent IS NOT NULL AND v_current_count >= v_max_concurrent THEN
      RETURN QUERY SELECT 
        false,
        'Limite de cursos simultâneos atingido (' || v_max_concurrent || ')',
        v_has_permission,
        v_incomplete_count,
        v_current_count;
      RETURN;
    END IF;
    
    -- Has permission and within limits
    RETURN QUERY SELECT 
      true,
      'Permissão especial concedida',
      v_has_permission,
      v_incomplete_count,
      v_current_count;
    RETURN;
  END IF;
  
  -- No permission - check for incomplete courses
  IF v_incomplete_count > 0 THEN
    RETURN QUERY SELECT 
      false,
      'Você possui ' || v_incomplete_count || ' curso(s) incompleto(s). Complete-os antes de se matricular em outro.',
      v_has_permission,
      v_incomplete_count,
      v_current_count;
    RETURN;
  END IF;
  
  -- Can enroll
  RETURN QUERY SELECT 
    true,
    'Elegível para matrícula',
    v_has_permission,
    v_incomplete_count,
    v_current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark course as complete
CREATE OR REPLACE FUNCTION complete_course_enrollment(
  p_enrollment_id UUID,
  p_exam_score DECIMAL
) RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  is_approved BOOLEAN
) AS $$
DECLARE
  v_passing_score DECIMAL;
  v_enrollment RECORD;
BEGIN
  -- Get enrollment details
  SELECT * INTO v_enrollment
  FROM student_enrollments
  WHERE id = p_enrollment_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Matrícula não encontrada', false;
    RETURN;
  END IF;
  
  v_passing_score := COALESCE(v_enrollment.passing_score, 70.00);
  
  -- Update exam attempts
  UPDATE student_enrollments
  SET exam_attempts = exam_attempts + 1,
      final_exam_score = p_exam_score
  WHERE id = p_enrollment_id;
  
  -- Check if passed
  IF p_exam_score >= v_passing_score THEN
    UPDATE student_enrollments
    SET 
      completed_at = NOW(),
      final_exam_score = p_exam_score,
      completion_percentage = 100.00
    WHERE id = p_enrollment_id;
    
    RETURN QUERY SELECT 
      true, 
      'Parabéns! Curso concluído com sucesso. Nota: ' || p_exam_score || '%',
      true;
    RETURN;
  ELSE
    -- Check if can retake
    IF v_enrollment.max_exam_attempts IS NOT NULL 
       AND v_enrollment.exam_attempts >= v_enrollment.max_exam_attempts THEN
      RETURN QUERY SELECT 
        true,
        'Nota insuficiente: ' || p_exam_score || '%. Limite de tentativas atingido.',
        false;
      RETURN;
    END IF;
    
    RETURN QUERY SELECT 
      true,
      'Nota insuficiente: ' || p_exam_score || '%. Nota mínima: ' || v_passing_score || '%. Você pode refazer a prova.',
      false;
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON COLUMN student_enrollments.completed_at IS 'Timestamp when student completed the course (passed final exam)';
COMMENT ON COLUMN student_enrollments.completion_percentage IS 'Overall course completion percentage';
COMMENT ON COLUMN student_enrollments.final_exam_score IS 'Score obtained in final exam (0-100)';
COMMENT ON COLUMN student_enrollments.passing_score IS 'Minimum score required to pass (default 70%)';
COMMENT ON COLUMN student_enrollments.exam_attempts IS 'Number of times student attempted the final exam';
COMMENT ON COLUMN student_enrollments.max_exam_attempts IS 'Maximum allowed exam attempts (NULL = unlimited)';
COMMENT ON COLUMN student_enrollments.requires_completion IS 'Whether this course must be completed before enrolling in another';
COMMENT ON COLUMN student_enrollments.enrolled_by IS 'User who enrolled the student (NULL if self-enrollment)';
COMMENT ON COLUMN student_enrollments.enrollment_type IS 'Type of enrollment: manual, self, bulk, or automatic';
