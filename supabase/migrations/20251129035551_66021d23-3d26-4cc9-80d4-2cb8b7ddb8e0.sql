-- Add unique constraint for lesson_progress upsert
ALTER TABLE public.lesson_progress 
ADD CONSTRAINT lesson_progress_student_lesson_unique 
UNIQUE (student_id, lesson_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student 
ON public.lesson_progress(student_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson 
ON public.lesson_progress(lesson_id);