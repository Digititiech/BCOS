import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

export interface BcosResource {
  id: string;
  name: { en: string; ar: string };
  code: string;
  description?: { en: string; ar: string };
  capacity: number;
  minCapacity: number;
  maxCapacity: number;
  floor?: string;
  location?: string;
  areaSize?: number;
  status: 'Available' | 'Reserved' | 'Occupied' | 'Maintenance' | 'Cleaning' | 'Unavailable' | 'Archived';
  visibility: 'public' | 'private' | 'hidden';
  isFeatured: boolean;
  displayOrder: number;
  resourceTypeId: string;
}

export interface ResourceFilterOptions {
  capacity?: number;
  resourceTypeId?: string;
  status?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  query?: string;
}

export const ResourceService = {
  /**
   * Search resources with filters.
   */
  async search(orgId: string, filters: ResourceFilterOptions): Promise<ApiResponse<BcosResource[]>> {
    try {
      let queryBuilder = supabase
        .from('resources')
        .select('*')
        .eq('organization_id', orgId);

      if (filters.resourceTypeId) {
        queryBuilder = queryBuilder.eq('resource_type_id', filters.resourceTypeId);
      }
      if (filters.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }
      if (filters.capacity) {
        queryBuilder = queryBuilder.gte('capacity', filters.capacity);
      }
      if (filters.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const resources = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        capacity: row.capacity,
        minCapacity: row.min_capacity,
        maxCapacity: row.max_capacity,
        floor: row.floor,
        location: row.location,
        areaSize: row.area_size,
        status: row.status,
        visibility: row.visibility,
        isFeatured: row.is_featured,
        displayOrder: row.display_order,
        resourceTypeId: row.resource_type_id,
      }));

      return {
        success: true,
        data: resources,
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
   * Creates a new bookable resource space.
   */
  async create(orgId: string, resource: Omit<BcosResource, 'id'>): Promise<ApiResponse<BcosResource>> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          organization_id: orgId,
          resource_type_id: resource.resourceTypeId,
          name: resource.name,
          code: resource.code,
          description: resource.description,
          capacity: resource.capacity,
          min_capacity: resource.minCapacity,
          max_capacity: resource.maxCapacity,
          floor: resource.floor,
          location: resource.location,
          area_size: resource.areaSize,
          status: resource.status,
          visibility: resource.visibility,
          is_featured: resource.isFeatured,
          display_order: resource.displayOrder,
        })
        .select()
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
          name: data.name,
          code: data.code,
          description: data.description,
          capacity: data.capacity,
          minCapacity: data.min_capacity,
          maxCapacity: data.max_capacity,
          floor: data.floor,
          location: data.location,
          areaSize: data.area_size,
          status: data.status,
          visibility: data.visibility,
          isFeatured: data.is_featured,
          displayOrder: data.display_order,
          resourceTypeId: data.resource_type_id,
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
   * Fetches specific resource details.
   */
  async getDetails(resourceId: string): Promise<ApiResponse<BcosResource>> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
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
          name: data.name,
          code: data.code,
          description: data.description,
          capacity: data.capacity,
          minCapacity: data.min_capacity,
          maxCapacity: data.max_capacity,
          floor: data.floor,
          location: data.location,
          areaSize: data.area_size,
          status: data.status,
          visibility: data.visibility,
          isFeatured: data.is_featured,
          displayOrder: data.display_order,
          resourceTypeId: data.resource_type_id,
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
};
