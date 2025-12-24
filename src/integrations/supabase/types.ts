export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_calendar: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_active: boolean
          start_date: string
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          start_date: string
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_calendar_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_transcripts: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          grade: number | null
          id: string
          module_id: string
          status: string
          student_id: string
          subject_name: string
          updated_at: string
          workload_hours: number
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          grade?: number | null
          id?: string
          module_id: string
          status?: string
          student_id: string
          subject_name: string
          updated_at?: string
          workload_hours: number
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          grade?: number | null
          id?: string
          module_id?: string
          status?: string
          student_id?: string
          subject_name?: string
          updated_at?: string
          workload_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_transcripts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_transcripts_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          polo_id: string | null
          published_at: string
          target_audience: string
          title: string
          type: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          polo_id?: string | null
          published_at?: string
          target_audience?: string
          title: string
          type?: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          polo_id?: string | null
          published_at?: string
          target_audience?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_polo_id_fkey"
            columns: ["polo_id"]
            isOneToOne: false
            referencedRelation: "polos"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          points?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      chatbot_leads: {
        Row: {
          conversation_history: Json | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          conversation_history?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          conversation_history?: Json | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          career_opportunities: string | null
          created_at: string
          description: string | null
          differentials: string[] | null
          duration_months: number | null
          id: string
          is_active: boolean
          mec_rating: number | null
          modality: string | null
          monthly_price: number
          research_lines: string[] | null
          student_profile: string | null
          thumbnail_url: string | null
          title: string
          total_hours: number | null
          updated_at: string
        }
        Insert: {
          career_opportunities?: string | null
          created_at?: string
          description?: string | null
          differentials?: string[] | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          mec_rating?: number | null
          modality?: string | null
          monthly_price?: number
          research_lines?: string[] | null
          student_profile?: string | null
          thumbnail_url?: string | null
          title: string
          total_hours?: number | null
          updated_at?: string
        }
        Update: {
          career_opportunities?: string | null
          created_at?: string
          description?: string | null
          differentials?: string[] | null
          duration_months?: number | null
          id?: string
          is_active?: boolean
          mec_rating?: number | null
          modality?: string | null
          monthly_price?: number
          research_lines?: string[] | null
          student_profile?: string | null
          thumbnail_url?: string | null
          title?: string
          total_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_banners: {
        Row: {
          active_date: string
          bible_verse: string | null
          created_at: string
          gradient_colors: string
          icon_name: string
          id: string
          is_active: boolean
          subtitle: string
          title: string
        }
        Insert: {
          active_date?: string
          bible_verse?: string | null
          created_at?: string
          gradient_colors?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          subtitle: string
          title: string
        }
        Update: {
          active_date?: string
          bible_verse?: string | null
          created_at?: string
          gradient_colors?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          exam_id: string
          id: string
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          order_index: number
          question_text: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          exam_id: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          order_index: number
          question_text: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          exam_id?: string
          id?: string
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          order_index?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_retry_payments: {
        Row: {
          amount: number
          created_at: string
          exam_id: string
          id: string
          paid_at: string | null
          retry_available_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          exam_id: string
          id?: string
          paid_at?: string | null
          retry_available_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          exam_id?: string
          id?: string
          paid_at?: string | null
          retry_available_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_retry_payments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          answers: Json
          attempt_number: number
          exam_id: string
          id: string
          is_paid_retry: boolean
          passed: boolean
          score: number
          student_id: string
          submitted_at: string
        }
        Insert: {
          answers: Json
          attempt_number?: number
          exam_id: string
          id?: string
          is_paid_retry?: boolean
          passed: boolean
          score: number
          student_id: string
          submitted_at?: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          exam_id?: string
          id?: string
          is_paid_retry?: boolean
          passed?: boolean
          score?: number
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          max_attempts: number
          module_id: string
          passing_score: number
          retry_fee: number
          retry_wait_days: number
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          max_attempts?: number
          module_id: string
          passing_score?: number
          retry_fee?: number
          retry_wait_days?: number
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          max_attempts?: number
          module_id?: string
          passing_score?: number
          retry_fee?: number
          retry_wait_days?: number
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_answer: boolean
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_answer?: boolean
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_answer?: boolean
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          content: string
          course_id: string
          created_at: string
          id: string
          is_locked: boolean
          is_pinned: boolean
          module_id: string | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          content: string
          course_id: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          module_id?: string | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          module_id?: string | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      issued_certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          course_id: string
          course_name: string
          created_at: string
          grade: number | null
          id: string
          issued_at: string
          pdf_url: string | null
          qr_verification_code: string
          student_id: string
          student_name: string
          total_hours: number
        }
        Insert: {
          certificate_number: string
          certificate_type?: string
          course_id: string
          course_name: string
          created_at?: string
          grade?: number | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          qr_verification_code: string
          student_id: string
          student_name: string
          total_hours: number
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          course_id?: string
          course_name?: string
          created_at?: string
          grade?: number | null
          id?: string
          issued_at?: string
          pdf_url?: string | null
          qr_verification_code?: string
          student_id?: string
          student_name?: string
          total_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "issued_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          last_position: number | null
          lesson_id: string
          student_id: string
          updated_at: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_position?: number | null
          lesson_id: string
          student_id: string
          updated_at?: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_position?: number | null
          lesson_id?: string
          student_id?: string
          updated_at?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          module_id: string
          order_index: number
          pdf_url: string | null
          title: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id: string
          order_index: number
          pdf_url?: string | null
          title: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string
          order_index?: number
          pdf_url?: string | null
          title?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_class_attendance: {
        Row: {
          duration_seconds: number | null
          id: string
          joined_at: string
          left_at: string | null
          live_class_id: string
          student_id: string
        }
        Insert: {
          duration_seconds?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          live_class_id: string
          student_id: string
        }
        Update: {
          duration_seconds?: number | null
          id?: string
          joined_at?: string
          left_at?: string | null
          live_class_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_class_attendance_live_class_id_fkey"
            columns: ["live_class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          instructor_id: string | null
          instructor_name: string
          is_active: boolean
          max_participants: number | null
          module_id: string | null
          recording_url: string | null
          room_code: string
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id?: string | null
          instructor_name: string
          is_active?: boolean
          max_participants?: number | null
          module_id?: string | null
          recording_url?: string | null
          room_code: string
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          instructor_id?: string | null
          instructor_name?: string
          is_active?: boolean
          max_participants?: number | null
          module_id?: string | null
          recording_url?: string | null
          room_code?: string
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_classes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_materials: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          is_required: boolean
          material_type: string
          module_id: string
          order_index: number
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_required?: boolean
          material_type: string
          module_id: string
          order_index?: number
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_required?: boolean
          material_type?: string
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_materials_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          due_date: string
          id: string
          paid_date: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          due_date: string
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      polos: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          director_id: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          parent_polo_id: string | null
          phone: string | null
          state: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          director_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_polo_id?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          director_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_polo_id?: string | null
          phone?: string | null
          state?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polos_parent_polo_id_fkey"
            columns: ["parent_polo_id"]
            isOneToOne: false
            referencedRelation: "polos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          permission_key: string
          permission_name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          permission_key: string
          permission_name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          permission_key?: string
          permission_name?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          student_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          student_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      student_credentials: {
        Row: {
          created_at: string
          enrollment_number: string
          id: string
          is_active: boolean
          issued_at: string
          photo_url: string | null
          qr_code_data: string
          student_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          enrollment_number: string
          id?: string
          is_active?: boolean
          issued_at?: string
          photo_url?: string | null
          qr_code_data: string
          student_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          enrollment_number?: string
          id?: string
          is_active?: boolean
          issued_at?: string
          photo_url?: string | null
          qr_code_data?: string
          student_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          is_active: boolean
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_gamification: {
        Row: {
          certificates_earned: number
          created_at: string
          current_level: number
          current_streak: number
          exams_passed: number
          id: string
          last_activity_date: string | null
          lessons_completed: number
          longest_streak: number
          perfect_scores: number
          student_id: string
          total_points: number
          updated_at: string
        }
        Insert: {
          certificates_earned?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          exams_passed?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          perfect_scores?: number
          student_id: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          certificates_earned?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          exams_passed?: number
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          longest_streak?: number
          perfect_scores?: number
          student_id?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          exam_id: string | null
          id: string
          module_id: string
          passed: boolean
          score: number | null
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exam_id?: string | null
          id?: string
          module_id: string
          passed?: boolean
          score?: number | null
          student_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exam_id?: string | null
          id?: string
          module_id?: string
          passed?: boolean
          score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          module_id: string
          name: string
          order_index: number
          professor_name: string | null
          professor_title: string | null
          updated_at: string
          workload_hours: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          module_id: string
          name: string
          order_index?: number
          professor_name?: string | null
          professor_title?: string | null
          updated_at?: string
          workload_hours?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          module_id?: string
          name?: string
          order_index?: number
          professor_name?: string | null
          professor_title?: string | null
          updated_at?: string
          workload_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_approve_user: {
        Args: { _approver_id: string; _user_id: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "student"
        | "teacher"
        | "director"
        | "super_admin"
        | "polo_director"
      education_level: "fundamental" | "medio" | "superior" | "pos_graduacao"
      exam_type: "multiple_choice" | "essay"
      payment_status: "paid" | "pending" | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "student",
        "teacher",
        "director",
        "super_admin",
        "polo_director",
      ],
      education_level: ["fundamental", "medio", "superior", "pos_graduacao"],
      exam_type: ["multiple_choice", "essay"],
      payment_status: ["paid", "pending", "overdue"],
    },
  },
} as const
