export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      job: {
        Row: {
          created_at: string;
          id: string;
          parameters: Json | null;
          schedule: string;
          status: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          parameters?: Json | null;
          schedule: string;
          status?: string;
          type?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          parameters?: Json | null;
          schedule?: string;
          status?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      memory: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memory_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      message: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          content: Json;
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      task: {
        Row: {
          completed: boolean;
          created_at: string;
          description: string;
          due_at: string;
          id: string;
          priority: string;
          title: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          description: string;
          due_at: string;
          id?: string;
          priority?: string;
          title: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          description?: string;
          due_at?: string;
          id?: string;
          priority?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user";
            referencedColumns: ["id"];
          },
        ];
      };
      user: {
        Row: {
          created_at: string;
          display_name: string;
          email: string | null;
          id: string;
          line_user_id: string;
          onboarded: boolean;
          picture_url: string | null;
          plan: string;
          updated_at: string;
          voice: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          email?: string | null;
          id?: string;
          line_user_id: string;
          onboarded?: boolean;
          picture_url?: string | null;
          plan?: string;
          updated_at?: string;
          voice?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          email?: string | null;
          id?: string;
          line_user_id?: string;
          onboarded?: boolean;
          picture_url?: string | null;
          plan?: string;
          updated_at?: string;
          voice?: string;
        };
        Relationships: [];
      };
      wait: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
