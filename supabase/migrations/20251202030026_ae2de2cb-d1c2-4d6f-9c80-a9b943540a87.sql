-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'achievement',
  points INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_badges table
CREATE TABLE public.student_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

-- Create student_gamification table for tracking progress
CREATE TABLE public.student_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  exams_passed INTEGER NOT NULL DEFAULT 0,
  perfect_scores INTEGER NOT NULL DEFAULT 0,
  certificates_earned INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_gamification ENABLE ROW LEVEL SECURITY;

-- Badges policies
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Student badges policies
CREATE POLICY "Students can view their badges" ON public.student_badges FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins can manage student badges" ON public.student_badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System can insert badges" ON public.student_badges FOR INSERT WITH CHECK (student_id = auth.uid());

-- Student gamification policies
CREATE POLICY "Students can view their gamification" ON public.student_gamification FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can insert their gamification" ON public.student_gamification FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update their gamification" ON public.student_gamification FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins can manage gamification" ON public.student_gamification FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_student_gamification_updated_at
BEFORE UPDATE ON public.student_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, points, requirement_type, requirement_value) VALUES
('Primeiro Passo', 'Complete sua primeira aula', 'play', 'lesson', 10, 'lessons_completed', 1),
('Estudante Dedicado', 'Complete 10 aulas', 'book-open', 'lesson', 50, 'lessons_completed', 10),
('Maratonista', 'Complete 50 aulas', 'zap', 'lesson', 200, 'lessons_completed', 50),
('Mestre do Conhecimento', 'Complete 100 aulas', 'crown', 'lesson', 500, 'lessons_completed', 100),
('Aprovado!', 'Passe na sua primeira prova', 'check-circle', 'exam', 25, 'exams_passed', 1),
('Excelência Acadêmica', 'Passe em 5 provas', 'award', 'exam', 100, 'exams_passed', 5),
('Nota Máxima', 'Obtenha 100% em uma prova', 'star', 'exam', 75, 'perfect_scores', 1),
('Perfeição', 'Obtenha 100% em 5 provas', 'sparkles', 'exam', 300, 'perfect_scores', 5),
('Consistente', 'Mantenha uma sequência de 7 dias', 'flame', 'streak', 50, 'current_streak', 7),
('Imparável', 'Mantenha uma sequência de 30 dias', 'rocket', 'streak', 200, 'current_streak', 30),
('Nível 5', 'Alcance o nível 5', 'trending-up', 'level', 100, 'current_level', 5),
('Nível 10', 'Alcance o nível 10', 'medal', 'level', 250, 'current_level', 10),
('Formado', 'Obtenha seu primeiro certificado', 'graduation-cap', 'certificate', 500, 'certificates_earned', 1);