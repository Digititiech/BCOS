import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api'; // wait, we will define this type file next or inline
import { User, Session } from '@supabase/supabase-js';

export const AuthService = {
  /**
   * Signs in a user using email and password.
   */
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: User; session: Session }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'AUTH_ERROR', message: error.message },
        };
      }

      return {
        success: true,
        data: { user: data.user, session: data.session },
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { code: 'SYSTEM_ERROR', message: err.message || 'An unexpected error occurred.' },
      };
    }
  },

  /**
   * Signs up a user and automatically configures their default profile.
   */
  async signUp(email: string, password: string): Promise<ApiResponse<{ user: User }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'AUTH_ERROR', message: error.message },
        };
      }

      if (!data.user) {
        return {
          success: false,
          data: null,
          error: { code: 'AUTH_ERROR', message: 'User registration failed.' },
        };
      }

      return {
        success: true,
        data: { user: data.user },
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { code: 'SYSTEM_ERROR', message: err.message },
      };
    }
  },

  /**
   * Triggers a password reset email link.
   */
  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'AUTH_ERROR', message: error.message },
        };
      }

      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { code: 'SYSTEM_ERROR', message: err.message },
      };
    }
  },

  /**
   * Sign out the current user session.
   */
  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'AUTH_ERROR', message: error.message },
        };
      }
      return {
        success: true,
        data: null,
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: { code: 'SYSTEM_ERROR', message: err.message },
      };
    }
  },
};
