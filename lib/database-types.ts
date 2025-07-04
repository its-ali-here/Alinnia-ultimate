export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      dashboard_comments: {
        Row: {
          id: string;
          dashboard_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          dashboard_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      // Add other tables here as needed
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
