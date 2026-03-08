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
      lawyers: {
        Row: {
          availability_status: string
          avatar_initials: string
          avg_response_hours: number
          bio: string | null
          budget_ranges: string[]
          city: string | null
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
          practice_areas?: string[]
          rating?: number
          review_count?: number
          review_summary?: string | null
          specialization_tags?: string[]
          state?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
