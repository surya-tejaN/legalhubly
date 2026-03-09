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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          state: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          state: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          state?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          client_name: string
          created_at: string
          duration_minutes: number
          fee_amount: number | null
          id: string
          is_mvp_free: boolean
          lawyer_id: string | null
          matter_id: string | null
          notes: string | null
          scheduled_at: string
          status: string
          title: string
          type: string
        }
        Insert: {
          client_name: string
          created_at?: string
          duration_minutes?: number
          fee_amount?: number | null
          id?: string
          is_mvp_free?: boolean
          lawyer_id?: string | null
          matter_id?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          title: string
          type?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          duration_minutes?: number
          fee_amount?: number | null
          id?: string
          is_mvp_free?: boolean
          lawyer_id?: string | null
          matter_id?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_cases: {
        Row: {
          ai_case_summary: string | null
          ai_lead_score: number | null
          ai_recommended_lawyers: string[] | null
          ai_tags: string[] | null
          budget_range: string | null
          consultation_preference: string | null
          conversation_history: Json | null
          created_at: string
          id: string
          intake_data: Json | null
          language_preference: string | null
          legal_category: string | null
          location: string | null
          matter_description: string | null
          opposing_party_details: string | null
          session_id: string
          status: string
          timeline: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          ai_case_summary?: string | null
          ai_lead_score?: number | null
          ai_recommended_lawyers?: string[] | null
          ai_tags?: string[] | null
          budget_range?: string | null
          consultation_preference?: string | null
          conversation_history?: Json | null
          created_at?: string
          id?: string
          intake_data?: Json | null
          language_preference?: string | null
          legal_category?: string | null
          location?: string | null
          matter_description?: string | null
          opposing_party_details?: string | null
          session_id: string
          status?: string
          timeline?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          ai_case_summary?: string | null
          ai_lead_score?: number | null
          ai_recommended_lawyers?: string[] | null
          ai_tags?: string[] | null
          budget_range?: string | null
          consultation_preference?: string | null
          conversation_history?: Json | null
          created_at?: string
          id?: string
          intake_data?: Json | null
          language_preference?: string | null
          legal_category?: string | null
          location?: string | null
          matter_description?: string | null
          opposing_party_details?: string | null
          session_id?: string
          status?: string
          timeline?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      internal_notes: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          matter_id: string | null
          pinned: boolean
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          matter_id?: string | null
          pinned?: boolean
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          matter_id?: string | null
          pinned?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          is_mvp_simulated: boolean
          lawyer_id: string | null
          line_items: Json
          matter_id: string | null
          paid_at: string | null
          status: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount?: number
          client_name: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_mvp_simulated?: boolean
          lawyer_id?: string | null
          line_items?: Json
          matter_id?: string | null
          paid_at?: string | null
          status?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          is_mvp_simulated?: boolean
          lawyer_id?: string | null
          line_items?: Json
          matter_id?: string | null
          paid_at?: string | null
          status?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyer_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_mvp_free: boolean
          lawyer_id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_mvp_free?: boolean
          lawyer_id: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_mvp_free?: boolean
          lawyer_id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_subscriptions_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyer_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lawyers: {
        Row: {
          availability_status: string
          avatar_initials: string
          avg_response_hours: number
          bio: string | null
          budget_ranges: string[]
          city: string | null
          city_id: string | null
          complexity_levels: string[]
          consultation_fee: number | null
          consultation_types: string[]
          created_at: string
          email: string | null
          experience_years: number
          firm: string
          hourly_rate: number | null
          id: string
          jurisdictions: string[]
          languages: string[]
          name: string
          next_available_date: string | null
          phone: string | null
          practice_area_id: string | null
          practice_areas: string[]
          rating: number
          review_count: number
          review_summary: string | null
          specialization_tags: string[]
          state: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          availability_status?: string
          avatar_initials?: string
          avg_response_hours?: number
          bio?: string | null
          budget_ranges?: string[]
          city?: string | null
          city_id?: string | null
          complexity_levels?: string[]
          consultation_fee?: number | null
          consultation_types?: string[]
          created_at?: string
          email?: string | null
          experience_years?: number
          firm: string
          hourly_rate?: number | null
          id?: string
          jurisdictions?: string[]
          languages?: string[]
          name: string
          next_available_date?: string | null
          phone?: string | null
          practice_area_id?: string | null
          practice_areas?: string[]
          rating?: number
          review_count?: number
          review_summary?: string | null
          specialization_tags?: string[]
          state?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          availability_status?: string
          avatar_initials?: string
          avg_response_hours?: number
          bio?: string | null
          budget_ranges?: string[]
          city?: string | null
          city_id?: string | null
          complexity_levels?: string[]
          consultation_fee?: number | null
          consultation_types?: string[]
          created_at?: string
          email?: string | null
          experience_years?: number
          firm?: string
          hourly_rate?: number | null
          id?: string
          jurisdictions?: string[]
          languages?: string[]
          name?: string
          next_available_date?: string | null
          phone?: string | null
          practice_area_id?: string | null
          practice_areas?: string[]
          rating?: number
          review_count?: number
          review_summary?: string | null
          specialization_tags?: string[]
          state?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "lawyers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lawyers_practice_area_id_fkey"
            columns: ["practice_area_id"]
            isOneToOne: false
            referencedRelation: "practice_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_summary: string | null
          budget_range: string | null
          client_email: string | null
          client_name: string
          conflict_status: string
          created_at: string
          id: string
          intake_case_id: string | null
          issue: string
          lawyer_id: string | null
          lead_score: number
          legal_category: string | null
          source: string
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          ai_summary?: string | null
          budget_range?: string | null
          client_email?: string | null
          client_name: string
          conflict_status?: string
          created_at?: string
          id?: string
          intake_case_id?: string | null
          issue: string
          lawyer_id?: string | null
          lead_score?: number
          legal_category?: string | null
          source?: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          ai_summary?: string | null
          budget_range?: string | null
          client_email?: string | null
          client_name?: string
          conflict_status?: string
          created_at?: string
          id?: string
          intake_case_id?: string | null
          issue?: string
          lawyer_id?: string | null
          lead_score?: number
          legal_category?: string | null
          source?: string
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_intake_case_id_fkey"
            columns: ["intake_case_id"]
            isOneToOne: false
            referencedRelation: "intake_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          case_number: string
          client_email: string | null
          client_name: string
          created_at: string
          description: string | null
          id: string
          intake_case_id: string | null
          lawyer_id: string | null
          legal_category: string | null
          next_deadline: string | null
          notes: string | null
          priority: string
          status: string
          tags: string[]
          title: string
          total_billed: number
          updated_at: string
        }
        Insert: {
          case_number?: string
          client_email?: string | null
          client_name: string
          created_at?: string
          description?: string | null
          id?: string
          intake_case_id?: string | null
          lawyer_id?: string | null
          legal_category?: string | null
          next_deadline?: string | null
          notes?: string | null
          priority?: string
          status?: string
          tags?: string[]
          title: string
          total_billed?: number
          updated_at?: string
        }
        Update: {
          case_number?: string
          client_email?: string | null
          client_name?: string
          created_at?: string
          description?: string | null
          id?: string
          intake_case_id?: string | null
          lawyer_id?: string | null
          legal_category?: string | null
          next_deadline?: string | null
          notes?: string | null
          priority?: string
          status?: string
          tags?: string[]
          title?: string
          total_billed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matters_intake_case_id_fkey"
            columns: ["intake_case_id"]
            isOneToOne: false
            referencedRelation: "intake_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matters_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lawyer_id: string | null
          matter_id: string | null
          paid_at: string | null
          status: string
        }
        Insert: {
          amount: number
          client_name: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_areas: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          profile_photo: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          profile_photo?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          lawyer_id: string
          rating: number
          review_text: string | null
          reviewer_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          lawyer_id: string
          rating?: number
          review_text?: string | null
          reviewer_name: string
        }
        Update: {
          created_at?: string
          id?: string
          lawyer_id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_lawyers: {
        Row: {
          created_at: string
          id: string
          lawyer_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lawyer_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lawyer_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_lawyers_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          ai_credits_monthly: number
          commission_rate: number
          created_at: string
          features: Json
          id: string
          is_active: boolean
          lead_fee: number
          name: string
          price_monthly: number
          price_yearly: number
          tier: string
        }
        Insert: {
          ai_credits_monthly?: number
          commission_rate?: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          lead_fee?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          tier?: string
        }
        Update: {
          ai_credits_monthly?: number
          commission_rate?: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          lead_fee?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          tier?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lawyer_id: string | null
          matter_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean
          created_at: string
          date: string
          description: string
          hours: number
          id: string
          lawyer_id: string | null
          matter_id: string | null
          rate: number
        }
        Insert: {
          billable?: boolean
          created_at?: string
          date?: string
          description: string
          hours: number
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          rate?: number
        }
        Update: {
          billable?: boolean
          created_at?: string
          date?: string
          description?: string
          hours?: number
          id?: string
          lawyer_id?: string | null
          matter_id?: string | null
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_lawyer_id_fkey"
            columns: ["lawyer_id"]
            isOneToOne: false
            referencedRelation: "lawyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "client" | "lawyer" | "firm_admin" | "platform_admin"
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
      app_role: ["client", "lawyer", "firm_admin", "platform_admin"],
    },
  },
} as const
