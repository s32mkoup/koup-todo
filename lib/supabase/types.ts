export type Database = {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          telegram_chat_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          telegram_chat_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          telegram_chat_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          user_id: string
          name: string
          code: string | null
          professor: string | null
          room: string | null
          color: string
          semester_start: string
          semester_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          code?: string | null
          professor?: string | null
          room?: string | null
          color?: string
          semester_start: string
          semester_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          code?: string | null
          professor?: string | null
          room?: string | null
          color?: string
          semester_start?: string
          semester_end?: string
          created_at?: string
        }
        Relationships: []
      }
      course_schedules: {
        Row: {
          id: string
          course_id: string
          day_of_week: number
          start_time: string | null
          end_time: string | null
        }
        Insert: {
          id?: string
          course_id: string
          day_of_week: number
          start_time?: string | null
          end_time?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          day_of_week?: number
          start_time?: string | null
          end_time?: string | null
        }
        Relationships: []
      }
      homework: {
        Row: {
          id: string
          course_id: string
          user_id: string
          title: string
          description: string | null
          has_deadline: boolean
          deadline: string | null
          remind_at: string | null
          reminder_sent: boolean
          is_done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          title: string
          description?: string | null
          has_deadline?: boolean
          deadline?: string | null
          remind_at?: string | null
          reminder_sent?: boolean
          is_done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          title?: string
          description?: string | null
          has_deadline?: boolean
          deadline?: string | null
          remind_at?: string | null
          reminder_sent?: boolean
          is_done?: boolean
          created_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          id: string
          course_id: string
          user_id: string
          title: string
          exam_date: string
          location: string | null
          topics: string | null
          readiness: number | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          title: string
          exam_date: string
          location?: string | null
          topics?: string | null
          readiness?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          title?: string
          exam_date?: string
          location?: string | null
          topics?: string | null
          readiness?: number | null
          created_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: string
          course_id: string
          user_id: string
          content: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          content?: string | null
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          content?: string | null
          url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      teammates: {
        Row: {
          id: string
          course_id: string
          user_id: string
          name: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          name: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          name?: string
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          id: string
          course_id: string
          user_id: string
          item_name: string
          max_score: number
          received_score: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          item_name: string
          max_score: number
          received_score: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          item_name?: string
          max_score?: number
          received_score?: number
          created_at?: string
        }
        Relationships: []
      }
      todo_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          priority: string
          due_at: string | null
          remind_at: string | null
          reminder_sent: boolean
          is_done: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          priority?: string
          due_at?: string | null
          remind_at?: string | null
          reminder_sent?: boolean
          is_done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          priority?: string
          due_at?: string | null
          remind_at?: string | null
          reminder_sent?: boolean
          is_done?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
  }
}
