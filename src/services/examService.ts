import { supabase } from "@/integrations/supabase/client";

export interface Exam {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  total_questions: number;
  passing_score: number;
  exam_type: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string | null;
  order_index: number;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  answers: any;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  status: 'started' | 'completed';
}

export const examService = {
  async getExamByModule(moduleId: string) {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('module_id', moduleId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Exam | null;
  },

  async getQuestions(examId: string) {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index');

    if (error) throw error;
    return data as Question[];
  },

  async startAttempt(examId: string, studentId: string) {
    // Check for existing active attempt
    const { data: existing } = await supabase
      .from('exam_submissions')
      .select('*')
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .eq('status', 'started')
      .maybeSingle();

    if (existing) return existing as ExamSubmission;

    // Create new attempt
    const { data, error } = await supabase
      .from('exam_submissions')
      .insert({
        exam_id: examId,
        student_id: studentId,
        status: 'started',
        started_at: new Date().toISOString(),
        answers: {},
        score: 0,
        passed: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExamSubmission;
  },

  async submitAttempt(submissionId: string, answers: Record<string, string>, score: number, passed: boolean) {
    const { data, error } = await supabase
      .from('exam_submissions')
      .update({
        answers,
        score,
        passed,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (error) throw error;
    return data as ExamSubmission;
  },

  async getHistory(examId: string, studentId: string) {
    const { data, error } = await supabase
      .from('exam_submissions')
      .select('*')
      .eq('exam_id', examId)
      .eq('student_id', studentId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data as ExamSubmission[];
  }
};
