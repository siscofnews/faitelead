import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  duration_months: number | null;
  total_hours: number | null;
  monthly_price: number | null;
  modality: string;
  is_active: boolean;
  thumbnail_url: string | null;
  created_at: string;
}

class CourseService {
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCourseById(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCourse(courseData: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCourse(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCourse(id: string) {
    // Delete related data first (optional if cascade is set in DB)
    // Assuming cascade delete is configured in DB schema for modules/lessons
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async toggleStatus(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('courses')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

export const courseService = new CourseService();
