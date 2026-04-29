export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description?: string
          address?: string
          start_date: string
          end_date?: string
          budget: number
          status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
        };
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string
          address?: string
          start_date: string
          end_date?: string
          budget: number
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
        };
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string
          address?: string
          start_date?: string
          end_date?: string
          budget?: number
          status?: 'planning' | 'in_progress' | 'completed' | 'on_hold'
        };
      };
      phases: {
        Row: {
          id: string
          project_id: string
          parent_phase_id?: string
          name: string
          description?: string
          start_date: string
          end_date: string
          budget: number
          status: 'not_started' | 'in_progress' | 'completed'
          completion_percentage: number
        };
        Insert: {
          id?: string
          project_id: string
          parent_phase_id?: string
          name: string
          description?: string
          start_date: string
          end_date: string
          budget: number
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_percentage?: number
        };
        Update: {
          id?: string
          project_id?: string
          parent_phase_id?: string
          name?: string
          description?: string
          start_date?: string
          end_date?: string
          budget?: number
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_percentage?: number
        };
      };
      tasks: {
        Row: {
          id: string
          phase_id: string
          name: string
          description?: string
          due_date: string
          status: 'todo' | 'in_progress' | 'done'
          assignee_id?: string
        };
        Insert: {
          id?: string
          phase_id: string
          name: string
          description?: string
          due_date: string
          status?: 'todo' | 'in_progress' | 'done'
          assignee_id?: string
        };
        Update: {
          id?: string
          phase_id?: string
          name?: string
          description?: string
          due_date?: string
          status?: 'todo' | 'in_progress' | 'done'
          assignee_id?: string
        };
      };
      expenses: {
        Row: {
          id: string
          project_id: string
          phase_id?: string
          task_id?: string
          description: string
          amount: number
          date: string
          category: string
          vendor?: string
          invoice_id?: string
          unit_rate?: number
          quantity?: number
          unit?: string
          notes?: string
          payment_method?: string
          paid_by?: string
        };
        Insert: {
          id?: string
          project_id: string
          phase_id?: string
          task_id?: string
          description: string
          amount: number
          date: string
          category: string
          vendor?: string
          invoice_id?: string
          unit_rate?: number
          quantity?: number
          unit?: string
          notes?: string
          payment_method?: string
          paid_by?: string
        };
        Update: {
          id?: string
          project_id?: string
          phase_id?: string
          task_id?: string
          description?: string
          amount?: number
          date?: string
          category?: string
          vendor?: string
          invoice_id?: string
          unit_rate?: number
          quantity?: number
          unit?: string
          notes?: string
          payment_method?: string
          paid_by?: string
        };
      };
      documents: {
        Row: {
          id: string
          project_id: string
          file_name: string
          file_path: string
          file_type: 'drawing' | 'invoice' | 'receipt' | 'permit' | 'contract' | 'photo' | 'other'
          uploaded_at: string
          uploaded_by: string
        };
        Insert: {
          id?: string
          project_id: string
          file_name: string
          file_path: string
          file_type: 'drawing' | 'invoice' | 'receipt' | 'permit' | 'contract' | 'photo' | 'other'
          uploaded_at?: string
          uploaded_by: string
        };
        Update: {
          id?: string
          project_id?: string
          file_name?: string
          file_path?: string
          file_type?: 'drawing' | 'invoice' | 'receipt' | 'permit' | 'contract' | 'photo' | 'other'
          uploaded_at?: string
          uploaded_by?: string
        };
      };
      price_intelligence: {
        Row: {
          id: string
          item_name: string
          item_type: 'material' | 'labor'
          unit: string
          price: number
          location: string
          updated_at: string
        };
        Insert: {
          id?: string
          item_name: string
          item_type: 'material' | 'labor'
          unit: string
          price: number
          location: string
          updated_at?: string
        };
        Update: {
          id?: string
          item_name?: string
          item_type?: 'material' | 'labor'
          unit?: string
          price?: number
          location?: string
          updated_at?: string
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
