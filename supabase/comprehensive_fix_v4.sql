-- ==========================================================
-- COMPREHENSIVE FIX: LOGIN, REGISTRATION & ENROLLMENT (v4.2)
-- ==========================================================

-- 1. SYNC PROFILES SCHEMA
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text DEFAULT 'medio';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS polo_id uuid;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending';

-- 2. SYNC STUDENT_ENROLLMENTS SCHEMA
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    progress integer DEFAULT 0,
    enrolled_at timestamptz DEFAULT now(),
    UNIQUE(student_id, course_id)
);

ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS completion_percentage DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS final_exam_score DECIMAL(5,2);
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS passing_score DECIMAL(5,2) DEFAULT 70.00;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS exam_attempts INTEGER DEFAULT 0;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS max_exam_attempts INTEGER DEFAULT NULL;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS requires_completion BOOLEAN DEFAULT true;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS enrolled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'manual' CHECK (enrollment_type IN ('manual', 'self', 'bulk', 'automatic'));
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS enrollment_notes TEXT;
ALTER TABLE public.student_enrollments ADD COLUMN IF NOT EXISTS can_retake_exam BOOLEAN DEFAULT true;

-- 3. ENSURE ENROLLMENT_PERMISSIONS EXISTS
CREATE TABLE IF NOT EXISTS public.enrollment_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_by_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  allow_multiple_courses BOOLEAN DEFAULT true,
  specific_courses UUID[] DEFAULT ARRAY[]::UUID[],
  max_concurrent_courses INTEGER DEFAULT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoke_reason TEXT
);

-- 4. CRITICAL RPC FUNCTIONS (Required by enrollmentService)

CREATE OR REPLACE FUNCTION has_enrollment_permission(
  p_student_id UUID,
  p_course_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM enrollment_permissions
    WHERE student_id = p_student_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND ( (specific_courses = ARRAY[]::UUID[] OR specific_courses IS NULL) OR (p_course_id = ANY(specific_courses)) )
  ) INTO v_has_permission;
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_student_enroll(
  p_student_id UUID,
  p_course_id UUID
) RETURNS TABLE(can_enroll BOOLEAN, reason TEXT, has_permission BOOLEAN, incomplete_courses INTEGER, current_enrollments INTEGER) AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_incomplete_count INTEGER;
  v_current_count INTEGER;
  v_max_concurrent INTEGER;
BEGIN
  v_has_permission := has_enrollment_permission(p_student_id, p_course_id);
  SELECT COUNT(*) INTO v_incomplete_count FROM student_enrollments WHERE student_id = p_student_id AND is_active = true AND completed_at IS NULL AND requires_completion = true;
  SELECT COUNT(*) INTO v_current_count FROM student_enrollments WHERE student_id = p_student_id AND is_active = true;
  IF v_has_permission THEN
    SELECT max_concurrent_courses INTO v_max_concurrent FROM enrollment_permissions WHERE student_id = p_student_id AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1;
    IF v_max_concurrent IS NOT NULL AND v_current_count >= v_max_concurrent THEN
      RETURN QUERY SELECT false, 'Limite de cursos simultâneos atingido (' || v_max_concurrent || ')', v_has_permission, v_incomplete_count, v_current_count; RETURN;
    END IF;
    RETURN QUERY SELECT true, 'Permissão especial concedida', v_has_permission, v_incomplete_count, v_current_count; RETURN;
  END IF;
  IF v_incomplete_count > 0 THEN
    RETURN QUERY SELECT false, 'Você possui ' || v_incomplete_count || ' curso(s) incompleto(s).', v_has_permission, v_incomplete_count, v_current_count; RETURN;
  END IF;
  RETURN QUERY SELECT true, 'Elegível para matrícula', v_has_permission, v_incomplete_count, v_current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER OPTIMIZATION (SAFE VERSION)
-- Note: We are NO LONGER updating auth.users directly here to avoid generated column errors.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role text;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
    IF v_role = 'ALUNO' THEN v_role := 'student'; END IF;
    IF v_role = 'ADMIN' THEN v_role := 'admin'; END IF;
    IF v_role = 'SUPER_ADMIN' THEN v_role := 'super_admin'; END IF;

    -- PROVISION PROFILE
    INSERT INTO public.profiles (id, full_name, email, role, is_active, cpf, phone, education_level, approval_status)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), new.email, v_role, true, new.raw_user_meta_data->>'cpf', new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'education_level', CASE WHEN v_role = 'student' THEN 'pending' ELSE 'approved' END)
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, role = EXCLUDED.role, cpf = COALESCE(EXCLUDED.cpf, public.profiles.cpf), phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

    -- ALLOCATE ROLE
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, v_role) ON CONFLICT (user_id, role) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RLS & CLEANUP Logic (Schema Only)
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage all enrollments" ON public.student_enrollments;
CREATE POLICY "Admins manage all enrollments" ON public.student_enrollments FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')));
DROP POLICY IF EXISTS "Students see own" ON public.student_enrollments;
CREATE POLICY "Students see own" ON public.student_enrollments FOR SELECT USING (student_id = auth.uid());


-- 7. STUDENT LIST VIEW
CREATE OR REPLACE VIEW student_list AS
SELECT p.id, p.full_name, p.email, p.photo_url, p.is_active, p.created_at, ur.role, (SELECT COUNT(*) FROM student_enrollments WHERE student_id = p.id) AS enrollments_count
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'student'
ORDER BY p.created_at DESC;
