import { createClient } from '@supabase/supabase-js';

// Supabase project details from the user's input
const supabaseUrl = 'https://mbrqjbkxorxwyrhzfimv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnFqYmt4b3J4d3lyaHpmaW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTAwMDAsImV4cCI6MjA4MTIyNjAwMH0.RB7SvXYBNe1HUoV4J_wcfgDujLJ-sdHS6ikr0FIdtKw';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the database schema types for better type safety
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string; // UUID
          tree_health: number;
          last_check_date: string; // date
        };
        Insert: {
          id: string;
          tree_health?: number;
          last_check_date?: string;
        };
        Update: {
          tree_health?: number;
          last_check_date?: string;
        };
      };
      habits: {
        Row: {
          id: number; // bigint
          user_id: string; // UUID
          name: string;
          created_at: string; // timestamp with time zone
        };
        Insert: {
          user_id: string;
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      habit_logs: {
        Row: {
          id: number; // bigint
          habit_id: number; // bigint
          date: string; // date
        };
        Insert: {
          habit_id: number;
          date: string;
        };
        Update: {};
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
