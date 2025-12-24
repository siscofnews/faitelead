-- Tabela de Polos (Estaduais/Regionais)
CREATE TABLE public.polos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'regional' CHECK (type IN ('estadual', 'regional')),
  state TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  director_id UUID REFERENCES auth.users(id),
  parent_polo_id UUID REFERENCES public.polos(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Anúncios
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'event')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'teachers', 'admins')),
  course_id UUID REFERENCES public.courses(id),
  polo_id UUID REFERENCES public.polos(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Fórum - Tópicos
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  module_id UUID REFERENCES public.modules(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Fórum - Respostas
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  is_answer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Credenciais do Aluno
CREATE TABLE public.student_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  enrollment_number TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  qr_code_data TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Certificados Emitidos
CREATE TABLE public.issued_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'completion' CHECK (certificate_type IN ('completion', 'extension', 'participation')),
  certificate_number TEXT NOT NULL UNIQUE,
  qr_verification_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  total_hours INTEGER NOT NULL,
  grade NUMERIC,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Histórico Acadêmico
CREATE TABLE public.academic_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  module_id UUID REFERENCES public.modules(id) NOT NULL,
  subject_name TEXT NOT NULL,
  grade NUMERIC,
  workload_hours INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved', 'failed', 'pending')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Calendário Acadêmico
CREATE TABLE public.academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'general' CHECK (event_type IN ('general', 'enrollment', 'exam', 'holiday', 'deadline')),
  start_date DATE NOT NULL,
  end_date DATE,
  course_id UUID REFERENCES public.courses(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.polos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Polos
CREATE POLICY "Admins can manage polos" ON public.polos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Everyone can view active polos" ON public.polos FOR SELECT USING (is_active = true);

-- Políticas RLS para Anúncios
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Everyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);

-- Políticas RLS para Fórum
CREATE POLICY "Authenticated users can view forum topics" ON public.forum_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create topics" ON public.forum_topics FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update their topics" ON public.forum_topics FOR UPDATE USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view forum replies" ON public.forum_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create replies" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para Credenciais
CREATE POLICY "Students can view their credentials" ON public.student_credentials FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can manage credentials" ON public.student_credentials FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para Certificados
CREATE POLICY "Students can view their certificates" ON public.issued_certificates FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can manage certificates" ON public.issued_certificates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can verify certificates" ON public.issued_certificates FOR SELECT USING (true);

-- Políticas RLS para Histórico
CREATE POLICY "Students can view their transcripts" ON public.academic_transcripts FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can manage transcripts" ON public.academic_transcripts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para Calendário
CREATE POLICY "Everyone can view calendar" ON public.academic_calendar FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage calendar" ON public.academic_calendar FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers para updated_at
CREATE TRIGGER update_polos_updated_at BEFORE UPDATE ON public.polos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_academic_transcripts_updated_at BEFORE UPDATE ON public.academic_transcripts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();