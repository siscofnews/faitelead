-- Ajuste de chaves estrangeiras para ON DELETE CASCADE / SET NULL
-- Execute este script no Editor SQL do Supabase

-- Cursos → Módulos
ALTER TABLE public.modules DROP CONSTRAINT IF EXISTS modules_course_id_fkey;
ALTER TABLE public.modules
  ADD CONSTRAINT modules_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Cursos → Calendário Acadêmico
ALTER TABLE public.academic_calendar DROP CONSTRAINT IF EXISTS academic_calendar_course_id_fkey;
ALTER TABLE public.academic_calendar
  ADD CONSTRAINT academic_calendar_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Cursos → Histórico Acadêmico
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='academic_transcripts' AND column_name='course_id'
  ) THEN
    ALTER TABLE public.academic_transcripts DROP CONSTRAINT IF EXISTS academic_transcripts_course_id_fkey;
    ALTER TABLE public.academic_transcripts
      ADD CONSTRAINT academic_transcripts_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Módulos → Disciplinas
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS subjects_module_id_fkey;
ALTER TABLE public.subjects
  ADD CONSTRAINT subjects_module_id_fkey
  FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

-- Módulos → Provas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='exams' AND column_name='module_id'
  ) THEN
    ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_module_id_fkey;
    ALTER TABLE public.exams
      ADD CONSTRAINT exams_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Módulos → Aulas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='lessons' AND column_name='module_id'
  ) THEN
    ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_module_id_fkey;
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Módulos → Materiais
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='module_materials' AND column_name='module_id'
  ) THEN
    ALTER TABLE public.module_materials DROP CONSTRAINT IF EXISTS module_materials_module_id_fkey;
    ALTER TABLE public.module_materials
      ADD CONSTRAINT module_materials_module_id_fkey
      FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Student Progress → Exam (SET NULL) e Module (CASCADE)
ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_exam_id_fkey;
ALTER TABLE public.student_progress
  ADD CONSTRAINT student_progress_exam_id_fkey
  FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE SET NULL;

ALTER TABLE public.student_progress DROP CONSTRAINT IF EXISTS student_progress_module_id_fkey;
ALTER TABLE public.student_progress
  ADD CONSTRAINT student_progress_module_id_fkey
  FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

-- Matrículas → Curso e Aluno
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_enrollments' AND column_name='course_id'
  ) THEN
    ALTER TABLE public.student_enrollments DROP CONSTRAINT IF EXISTS student_enrollments_course_id_fkey;
    ALTER TABLE public.student_enrollments
      ADD CONSTRAINT student_enrollments_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='student_enrollments' AND column_name='student_id'
  ) THEN
    ALTER TABLE public.student_enrollments DROP CONSTRAINT IF EXISTS student_enrollments_student_id_fkey;
    ALTER TABLE public.student_enrollments
      ADD CONSTRAINT student_enrollments_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Pagamentos → Curso e Aluno
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payments' AND column_name='course_id'
  ) THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_course_id_fkey;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_course_id_fkey
      FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payments' AND column_name='student_id'
  ) THEN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_student_id_fkey;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

