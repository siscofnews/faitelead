DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Students can view modules of enrolled courses" ON public.modules;

CREATE POLICY "Admins can manage modules"
ON public.modules
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'director'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'director'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
);

CREATE POLICY "Students can view modules of enrolled courses"
ON public.modules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.student_enrollments
    WHERE student_enrollments.student_id = auth.uid()
      AND student_enrollments.course_id = modules.course_id
      AND student_enrollments.is_active = true
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'director'::app_role)
  OR has_role(auth.uid(), 'teacher'::app_role)
);

