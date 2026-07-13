import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

export interface OrganizationSettings {
  name: string;
  slug: string;
  logoUrl?: string;
  subscriptionTier: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
  status: 'active' | 'suspended' | 'trialing';
}

export const OrganizationService = {
  /**
   * Fetches settings of the current user's organization.
   */
  async getSettings(orgId: string): Promise<ApiResponse<OrganizationSettings>> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name, slug, logo_url, subscription_tier, status')
        .eq('id', orgId)
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
          name: data.name,
          slug: data.slug,
          logoUrl: data.logo_url,
          subscriptionTier: data.subscription_tier as any,
          status: data.status as any,
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
   * Updates settings of the organization.
   */
  async updateSettings(
    orgId: string,
    updates: Partial<OrganizationSettings>
  ): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: updates.name,
          slug: updates.slug,
          logo_url: updates.logoUrl,
          subscription_tier: updates.subscriptionTier,
          status: updates.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orgId);

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
};
