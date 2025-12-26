import { supabase } from '@/integrations/supabase/client'

export const api = {
  async listCourses(params?: { tenant_id?: string; is_active?: boolean }) {
    let query = supabase.from('courses').select('*')

    if (params?.tenant_id) query = query.eq('tenant_id', params.tenant_id)
    if (typeof params?.is_active !== 'undefined') query = query.eq('is_active', params.is_active)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async createCourse(payload: { tenant_id?: string; title: string; description?: string; duration_months?: number; total_hours?: number; monthly_price?: number; modality?: string; thumbnail_url?: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        tenant_id: payload.tenant_id || 'tenant-1',
        title: payload.title,
        description: payload.description,
        duration_months: payload.duration_months,
        total_hours: payload.total_hours,
        monthly_price: payload.monthly_price,
        modality: payload.modality,
        thumbnail_url: payload.thumbnail_url,
        is_active: payload.is_active ?? true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateCourse(id: string, patch: any) {
    const { data, error } = await supabase
      .from('courses')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { id }
  },

  async getCourse(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async listEnrollmentsByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('student_id', studentId)

    if (error) throw error
    return data || []
  },

  async createEnrollment(payload: { student_id: string; course_id: string; is_active?: boolean }) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .insert({
        student_id: payload.student_id,
        course_id: payload.course_id,
        is_active: payload.is_active ?? true
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEnrollment(id: string) {
    const { error } = await supabase
      .from('student_enrollments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { id }
  },

  async getSubject(id: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getModulesBySubject(subjectId: string) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getModulesByCourse(courseId: string) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getModule(id: string) {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createModule(payload: { subject_id: string; course_id?: string; title: string; description?: string; order_index?: number }) {
    let course_id = payload.course_id

    // Se course_id não foi fornecido, buscar da subject
    if (!course_id && payload.subject_id) {
      const { data: subjectData } = await supabase
        .from('course_subjects')
        .select('course_id')
        .eq('id', payload.subject_id)
        .single()

      course_id = subjectData?.course_id
    }

    const { data, error } = await supabase
      .from('modules')
      .insert({
        subject_id: payload.subject_id,
        course_id: course_id,
        title: payload.title,
        description: payload.description,
        order_index: payload.order_index || 1
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateModule(id: string, patch: any) {
    const { data, error } = await supabase
      .from('modules')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteModule(id: string) {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { id }
  },

  async listContentsByModule(moduleId: string) {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('module_id', moduleId)
      .order('order', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createContent(payload: { module_id: string; title: string; content_type: string; url?: string | null; order?: number; is_required?: boolean; duration_minutes?: number; payload?: any }) {
    const { data, error } = await supabase
      .from('contents')
      .insert({
        module_id: payload.module_id,
        title: payload.title,
        content_type: payload.content_type,
        url: payload.url,
        order: payload.order || 1,
        is_required: payload.is_required ?? false,
        duration_minutes: payload.duration_minutes,
        payload: payload.payload
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateContent(id: string, patch: any) {
    const { data, error } = await supabase
      .from('contents')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteContent(id: string) {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { id }
  },

  async listContentProgress(studentId: string, courseId: string) {
    const { data, error } = await supabase
      .from('content_progress')
      .select('*')
      .eq('student_id', studentId)

    if (error) throw error
    return data || []
  },

  async listContentProgressAny(studentId: string) {
    const { data, error } = await supabase
      .from('content_progress')
      .select('*')
      .eq('student_id', studentId)

    if (error) throw error
    return data || []
  },

  async upsertContentProgress(id: string | null, payload: { student_id: string; content_id: string; completed: boolean }) {
    if (id) {
      const { data, error } = await supabase
        .from('content_progress')
        .update({ completed: payload.completed })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('content_progress')
        .insert({
          student_id: payload.student_id,
          content_id: payload.content_id,
          completed: payload.completed
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async listGallery() {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createGallery(payload: { url: string; title?: string }) {
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        url: payload.url,
        title: payload.title
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteGallery(id: string) {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { id }
  },

  async getStudentStats(student_id: string, course_id: string) {
    // 1. Get all modules for the course
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course_id);
    
    const moduleIds = modules?.map(m => m.id) || [];

    // 2. Get all contents (lessons)
    const { data: contents } = await supabase
      .from('contents')
      .select('id, is_required')
      .in('module_id', moduleIds);
    
    const contentIds = contents?.map(c => c.id) || [];
    const total_lessons = contentIds.length;

    // 3. Get progress
    const { data: progress } = await supabase
      .from('content_progress')
      .select('content_id')
      .eq('student_id', student_id)
      .eq('completed', true)
      .in('content_id', contentIds);

    const completed_lessons = progress?.length || 0;
    const completion_rate = total_lessons > 0 
      ? Math.round((completed_lessons / total_lessons) * 100) 
      : 0;

    // 4. Get exams stats
    const { data: exams } = await supabase
      .from('exams')
      .select('id')
      .in('module_id', moduleIds);
    
    const examIds = exams?.map(e => e.id) || [];
    const exams_count = examIds.length;

    const { data: submissions } = await supabase
      .from('exam_submissions')
      .select('score, passed')
      .eq('student_id', student_id)
      .in('exam_id', examIds);

    const exams_attempted = submissions?.length || 0;
    
    // Average score
    const totalScore = submissions?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;
    const average_score = exams_attempted > 0 
      ? Math.round(totalScore / exams_attempted) 
      : null;

    // Pass rate
    const passedCount = submissions?.filter(s => s.passed).length || 0;
    const pass_rate = exams_attempted > 0 
      ? Math.round((passedCount / exams_attempted) * 100) 
      : 0;

    // Check required contents
    const requiredContentIds = contents?.filter(c => c.is_required).map(c => c.id) || [];
    const completedContentIds = progress?.map(p => p.content_id) || [];
    const required_completed = requiredContentIds.every(id => completedContentIds.includes(id));

    return {
      student_id,
      course_id,
      total_lessons,
      completed_lessons,
      completion_rate,
      exams_count,
      exams_attempted,
      average_score,
      pass_rate,
      required_completed
    };
  }
}
