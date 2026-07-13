import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

export interface UserProfileDetails {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  languagePreference: 'ar' | 'en';
  timezone: string;
}

export const UserService = {
  /**
   * Fetches profile details of the logged-in user.
   */
  async getProfile(userId: string): Promise<ApiResponse<UserProfileDetails>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          avatarUrl: data.avatar_url,
          phone: data.phone,
          jobTitle: data.job_title,
          department: data.department,
          languagePreference: data.language_preference as any,
          timezone: data.timezone,
        },
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
   * Updates profile details of the user.
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfileDetails>
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatarUrl,
          phone: updates.phone,
          job_title: updates.jobTitle,
          department: updates.department,
          language_preference: updates.languagePreference,
          timezone: updates.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
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
   * Fetches team members of the specified organization.
   */
  async getTeamMembers(orgId: string): Promise<ApiResponse<UserProfileDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('user_profiles (*)')
        .eq('organization_id', orgId);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const profiles = (data || []).map((row: any) => {
        const profile = row.user_profiles;
        return {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          avatarUrl: profile.avatar_url,
          phone: profile.phone,
          jobTitle: profile.job_title,
          department: profile.department,
          languagePreference: profile.language_preference,
          timezone: profile.timezone,
        };
      });

      return {
        success: true,
        data: profiles,
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
