-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'super_admin', 'teacher', 'director');
CREATE TYPE public.exam_type AS ENUM ('multiple_choice', 'essay');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE public.education_level AS ENUM ('fundamental', 'medio', 'superior', 'pos_graduacao');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  education_level education_level NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  exam_type exam_type NOT NULL DEFAULT 'multiple_choice',
  passing_score INTEGER NOT NULL DEFAULT 70,
  total_questions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create exam_questions table
CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, order_index)
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

-- Create student_enrollments table
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- Create student_progress table
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  score INTEGER,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Create exam_submissions table
CREATE TABLE public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, cpf, phone, education_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'education_level')::education_level, 'medio')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for courses
CREATE POLICY "Everyone can view active courses"
  ON public.courses FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for modules
CREATE POLICY "Students can view modules of enrolled courses"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_enrollments
      WHERE student_id = auth.uid()
      AND course_id = modules.course_id
      AND is_active = true
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lessons
CREATE POLICY "Students can view lessons if enrolled and payments ok"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.student_enrollments se ON se.course_id = m.course_id
      WHERE m.id = lessons.module_id
      AND se.student_id = auth.uid()
      AND se.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.student_id = auth.uid()
        AND p.course_id = m.course_id
        AND p.status = 'overdue'
      )
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exams
CREATE POLICY "Students can view exams of their modules"
  ON public.exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.student_enrollments se ON se.course_id = m.course_id
      WHERE m.id = exams.module_id
      AND se.student_id = auth.uid()
      AND se.is_active = true
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage exams"
  ON public.exams FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exam_questions
CREATE POLICY "Students can view questions of accessible exams"
  ON public.exam_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.modules m ON m.id = e.module_id
      JOIN public.student_enrollments se ON se.course_id = m.course_id
      WHERE e.id = exam_questions.exam_id
      AND se.student_id = auth.uid()
      AND se.is_active = true
    ) OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage exam questions"
  ON public.exam_questions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for student_enrollments
CREATE POLICY "Students can view their enrollments"
  ON public.student_enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage enrollments"
  ON public.student_enrollments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for student_progress
CREATE POLICY "Students can view their own progress"
  ON public.student_progress FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own progress"
  ON public.student_progress FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own progress"
  ON public.student_progress FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage all progress"
  ON public.student_progress FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exam_submissions
CREATE POLICY "Students can view their submissions"
  ON public.exam_submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can submit exams"
  ON public.exam_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can view all submissions"
  ON public.exam_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Students can view their payments"
  ON public.payments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));