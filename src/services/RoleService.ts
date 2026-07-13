import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

export interface BcosRole {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
}

export interface BcosPermission {
  id: string;
  name: string;
  description: string;
}

export const RoleService = {
  /**
   * Fetches the role options for the current organization.
   */
  async getRoles(orgId: string): Promise<ApiResponse<BcosRole[]>> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .or(`organization_id.eq.${orgId},organization_id.is.null`);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const roles = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isSystemRole: row.is_system_role,
      }));

      return {
        success: true,
        data: roles,
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
   * Fetches all available permissions in the system.
   */
  async getPermissions(): Promise<ApiResponse<BcosPermission[]>> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const permissions = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
      }));

      return {
        success: true,
        data: permissions,
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
   * Fetches permission ID mapping for a given role.
   */
  async getRolePermissions(roleId: string): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const permissionIds = (data || []).map((row: any) => row.permission_id);

      return {
        success: true,
        data: permissionIds,
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
