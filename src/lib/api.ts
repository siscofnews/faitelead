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
        .from('subjects')
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
    // Esta função precisa de lógica mais complexa, mantendo a implementação original
    // ou criando uma view no Supabase
    return {
      student_id,
      course_id,
      total_lessons: 0,
      completed_lessons: 0,
      completion_rate: 0,
      exams_count: 0,
      exams_attempted: 0,
      average_score: null,
      pass_rate: 0,
      required_completed: false
    }
  }
}
