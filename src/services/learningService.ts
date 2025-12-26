import { supabase } from "@/integrations/supabase/client";

export const learningService = {
  async getStudentCourses(studentId: string) {
    // Fetch active enrollments with course details
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        course_id,
        is_active,
        courses (
          id,
          title,
          description,
          thumbnail_url
        )
      `)
      .eq('student_id', studentId)
      .eq('is_active', true);

    if (error) throw error;
    
    // Flatten structure
    return data.map((e: any) => ({
      ...e.courses,
      enrolled_at: e.created_at
    }));
  },

  async getCourseModules(courseId: string, studentId: string) {
    // Fetch modules
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (error) throw error;

    // Fetch progress for these modules
    // Note: This requires joining contents and content_progress or handling logic here.
    // For simplicity and performance, we'll fetch all progress for the student and map it.
    
    const { data: progress } = await supabase
      .from('content_progress')
      .select('content_id, completed')
      .eq('student_id', studentId);

    const { data: exams } = await supabase
      .from('exam_submissions')
      .select('exam_id, score, passed')
      .eq('student_id', studentId)
      .eq('status', 'completed');

    // Attach progress metadata
    // We need to know which contents belong to which module to calculate percentage
    const { data: contents } = await supabase
      .from('contents')
      .select('id, module_id')
      .in('module_id', modules.map(m => m.id));

    const modulesWithProgress = modules.map(m => {
      const moduleContents = contents?.filter(c => c.module_id === m.id) || [];
      const totalLessons = moduleContents.length;
      
      const completedLessons = moduleContents.filter(c => 
        progress?.some(p => p.content_id === c.id && p.completed)
      ).length;

      // Check for module exam
      // Assuming exam is linked to module via exams table
      // We need to fetch exams for these modules separately or assume one per module
      // For now, let's just return basic progress
      
      return {
        ...m,
        lessons_total: totalLessons,
        lessons_completed: completedLessons,
        status: completedLessons === totalLessons ? 'completed' : (completedLessons > 0 ? 'in_progress' : 'locked'), // Simple logic, can be improved
        final_exam_score: null // Filled later if needed
      };
    });

    return modulesWithProgress;
  },

  async getModuleExamResult(moduleId: string, studentId: string) {
    // Find exam for module
    const { data: exam } = await supabase
      .from('exams')
      .select('id')
      .eq('module_id', moduleId)
      .single();

    if (!exam) return null;

    // Find best submission
    const { data: submission } = await supabase
      .from('exam_submissions')
      .select('score, passed')
      .eq('exam_id', exam.id)
      .eq('student_id', studentId)
      .eq('passed', true)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle();

    return submission;
  }
};
