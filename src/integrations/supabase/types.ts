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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          email: string | null
          id: string
          location: string
          message: string | null
          name: string
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          service: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          message?: string | null
          name: string
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          service: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          message?: string | null
          name?: string
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          service?: string
          status?: string
        }
        Relationships: []
      }
      clinic_admin_state: {
        Row: {
          id: string
          payload: Json | null
          updated_at: string
        }
        Insert: {
          id: string
          payload?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          payload?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      clinic_staff_roles: {
        Row: {
          created_at: string
          display_name: string | null
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disabled_slots: {
        Row: {
          created_at: string
          date: string
          id: string
          time_slot: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          time_slot: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          time_slot?: string
        }
        Relationships: []
      }
      off_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      opd_bill_items: {
        Row: {
          bill_id: string
          discount: number
          gst: number
          id: string
          label: string
          position: number
          qty: number
          rate: number
          total: number
        }
        Insert: {
          bill_id: string
          discount?: number
          gst?: number
          id?: string
          label: string
          position?: number
          qty?: number
          rate?: number
          total?: number
        }
        Update: {
          bill_id?: string
          discount?: number
          gst?: number
          id?: string
          label?: string
          position?: number
          qty?: number
          rate?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "opd_bill_items_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "opd_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      opd_bills: {
        Row: {
          age: string
          appointment_id: string | null
          bill_date: string
          bill_no: string
          clinic_address: string
          clinic_name: string
          consultation_mode: string | null
          created_at: string
          doctor_name: string
          doctor_speciality: string
          gender: string
          id: string
          paid_amount: number
          patient_id: string
          patient_name: string
          payment_mode: string
          phone: string
          status: string
          total_amount: number
          updated_at: string
          visit_type: string
        }
        Insert: {
          age?: string
          appointment_id?: string | null
          bill_date: string
          bill_no: string
          clinic_address: string
          clinic_name: string
          consultation_mode?: string | null
          created_at?: string
          doctor_name: string
          doctor_speciality: string
          gender?: string
          id: string
          paid_amount?: number
          patient_id: string
          patient_name: string
          payment_mode: string
          phone: string
          status: string
          total_amount?: number
          updated_at?: string
          visit_type?: string
        }
        Update: {
          age?: string
          appointment_id?: string | null
          bill_date?: string
          bill_no?: string
          clinic_address?: string
          clinic_name?: string
          consultation_mode?: string | null
          created_at?: string
          doctor_name?: string
          doctor_speciality?: string
          gender?: string
          id?: string
          paid_amount?: number
          patient_id?: string
          patient_name?: string
          payment_mode?: string
          phone?: string
          status?: string
          total_amount?: number
          updated_at?: string
          visit_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          name: string
          rating: number
          text: string
          treatment: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          name: string
          rating?: number
          text: string
          treatment: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          name?: string
          rating?: number
          text?: string
          treatment?: string
        }
        Relationships: []
      }
      pharmacy_medicines: {
        Row: {
          batch: string
          created_at: string
          expiry_date: string
          generic: string
          group_name: string
          id: string
          location: string
          manufacturer: string
          name: string
          stock: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          batch?: string
          created_at?: string
          expiry_date: string
          generic?: string
          group_name?: string
          id: string
          location?: string
          manufacturer?: string
          name: string
          stock?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          batch?: string
          created_at?: string
          expiry_date?: string
          generic?: string
          group_name?: string
          id?: string
          location?: string
          manufacturer?: string
          name?: string
          stock?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_purchase_items: {
        Row: {
          id: string
          medicine_id: string | null
          name: string
          position: number
          price: number
          purchase_id: string
          qty: number
        }
        Insert: {
          id?: string
          medicine_id?: string | null
          name: string
          position?: number
          price?: number
          purchase_id: string
          qty?: number
        }
        Update: {
          id?: string
          medicine_id?: string | null
          name?: string
          position?: number
          price?: number
          purchase_id?: string
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_purchases: {
        Row: {
          amount: number
          contact_no: string
          created_at: string
          id: string
          invoice_no: string
          payment_status: string
          purchase_date: string
          supplier_id: string
          supplier_name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          contact_no: string
          created_at?: string
          id: string
          invoice_no: string
          payment_status: string
          purchase_date: string
          supplier_id: string
          supplier_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          contact_no?: string
          created_at?: string
          id?: string
          invoice_no?: string
          payment_status?: string
          purchase_date?: string
          supplier_id?: string
          supplier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_sale_items: {
        Row: {
          id: string
          medicine_id: string | null
          name: string
          position: number
          price: number
          qty: number
          sale_id: string
        }
        Insert: {
          id?: string
          medicine_id?: string | null
          name: string
          position?: number
          price?: number
          qty?: number
          sale_id: string
        }
        Update: {
          id?: string
          medicine_id?: string | null
          name?: string
          position?: number
          price?: number
          qty?: number
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_sales: {
        Row: {
          contact_no: string
          created_at: string
          discount: number
          discount_percent: number
          id: string
          invoice_no: string
          patient_id: string
          patient_name: string
          payment_status: string
          sale_date: string
          sale_type: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          contact_no: string
          created_at?: string
          discount?: number
          discount_percent?: number
          id: string
          invoice_no: string
          patient_id: string
          patient_name: string
          payment_status: string
          sale_date: string
          sale_type: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          contact_no?: string
          created_at?: string
          discount?: number
          discount_percent?: number
          id?: string
          invoice_no?: string
          patient_id?: string
          patient_name?: string
          payment_status?: string
          sale_date?: string
          sale_type?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_message_logs: {
        Row: {
          appointment_id: string | null
          created_at: string
          delivery_mode: string
          id: string
          message_body: string
          message_type: string
          patient_name: string
          phone: string
          sent_at: string | null
          sent_by: string | null
          status: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          delivery_mode?: string
          id?: string
          message_body: string
          message_type: string
          patient_name: string
          phone: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          delivery_mode?: string
          id?: string
          message_body?: string
          message_type?: string
          patient_name?: string
          phone?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
        }
        Relationships: []
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
