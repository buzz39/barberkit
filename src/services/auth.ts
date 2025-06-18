import { supabase } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  businessName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  // Sign up new user
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            business_name: data.businessName || ''
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: authData.user || undefined };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Sign in existing user
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: authData.user };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Sign out current user
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Update user profile
  async updateProfile(updates: { full_name?: string; business_name?: string }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
};

