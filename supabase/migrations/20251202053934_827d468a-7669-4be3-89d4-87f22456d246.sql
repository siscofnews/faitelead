-- Criar tabela de materiais do módulo (PDFs, Word, PPT, vídeos)
CREATE TABLE IF NOT EXISTS public.module_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('pdf', 'word', 'powerpoint', 'video', 'other')),
  file_url TEXT, -- Para arquivos uploaded
  youtube_url TEXT, -- Para vídeos do YouTube
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar campo de tentativas máximas na tabela exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 3;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS retry_wait_days INTEGER NOT NULL DEFAULT 7;
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS retry_fee NUMERIC NOT NULL DEFAULT 0;

-- Adicionar campos de controle de tentativas na tabela exam_submissions
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.exam_submissions ADD COLUMN IF NOT EXISTS is_paid_retry BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela para controle de pagamento de retry
CREATE TABLE IF NOT EXISTS public.exam_retry_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  retry_available_at TIMESTAMPTZ, -- Data quando pode refazer (7 dias após pagamento)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.module_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_retry_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para module_materials
CREATE POLICY "Admins can manage materials" ON public.module_materials
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Students can view materials of enrolled courses" ON public.module_materials
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM modules m
    JOIN student_enrollments se ON se.course_id = m.course_id
    WHERE m.id = module_materials.module_id
    AND se.student_id = auth.uid()
    AND se.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Políticas para exam_retry_payments
CREATE POLICY "Admins can manage retry payments" ON public.exam_retry_payments
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Students can view their retry payments" ON public.exam_retry_payments
FOR SELECT TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can create retry payments" ON public.exam_retry_payments
FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid());

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_module_materials_module_id ON public.module_materials(module_id);
CREATE INDEX IF NOT EXISTS idx_exam_retry_payments_student_exam ON public.exam_retry_payments(student_id, exam_id);