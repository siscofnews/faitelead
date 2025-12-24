-- Add unique constraint for student_progress upsert
ALTER TABLE public.student_progress 
ADD CONSTRAINT student_progress_student_module_unique 
UNIQUE (student_id, module_id);