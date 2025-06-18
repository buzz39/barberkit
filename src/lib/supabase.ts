import { createClient } from '@supabase/supabase-js';
import type { Customer, Campaign, WhatsAppTemplate } from '../types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'createdAt'>;
        Update: Partial<Omit<Customer, 'id' | 'createdAt'>>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'id' | 'createdAt'>;
        Update: Partial<Omit<Campaign, 'id' | 'createdAt'>>;
      };
      whatsapp_templates: {
        Row: WhatsAppTemplate;
        Insert: Omit<WhatsAppTemplate, 'id'>;
        Update: Partial<Omit<WhatsAppTemplate, 'id'>>;
      };
    };
  };
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    error: error.message || 'An unexpected error occurred'
  };
};

// Helper function for successful responses
export const handleSuccess = (data: any) => {
  return {
    success: true,
    data
  };
};

