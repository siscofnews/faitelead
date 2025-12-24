-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Students can view modules of enrolled courses" ON public.modules;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Admins can manage modules" 
ON public.modules 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view modules of enrolled courses" 
ON public.modules 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM student_enrollments
    WHERE student_enrollments.student_id = auth.uid()
    AND student_enrollments.course_id = modules.course_id
    AND student_enrollments.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);