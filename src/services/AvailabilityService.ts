import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';

export interface AvailabilityRule {
  id?: string;
  resourceId: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string; // e.g. "08:00:00"
  endTime: string; // e.g. "17:00:00"
  minDurationMinutes: number;
  maxDurationMinutes: number;
  bufferTimeMinutes: number;
}

export interface BlackoutDate {
  id?: string;
  resourceId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  reason?: string;
}

export const AvailabilityService = {
  /**
   * Fetches availability rules for a given resource.
   */
  async getRules(resourceId: string): Promise<ApiResponse<AvailabilityRule[]>> {
    try {
      const { data, error } = await supabase
        .from('resource_availability_rules')
        .select('*')
        .eq('resource_id', resourceId);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const rules = (data || []).map((row: any) => ({
        id: row.id,
        resourceId: row.resource_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        minDurationMinutes: row.min_duration_minutes,
        maxDurationMinutes: row.max_duration_minutes,
        bufferTimeMinutes: row.buffer_time_minutes,
      }));

      return {
        success: true,
        data: rules,
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
   * Adds or updates availability rules.
   */
  async upsertRule(rule: AvailabilityRule): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('resource_availability_rules')
        .upsert({
          id: rule.id,
          resource_id: rule.resourceId,
          day_of_week: rule.dayOfWeek,
          start_time: rule.startTime,
          end_time: rule.endTime,
          min_duration_minutes: rule.minDurationMinutes,
          max_duration_minutes: rule.maxDurationMinutes,
          buffer_time_minutes: rule.bufferTimeMinutes,
        }, {
          onConflict: 'resource_id, day_of_week',
        });

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
   * Fetches blackout dates for a given resource.
   */
  async getBlackouts(resourceId: string): Promise<ApiResponse<BlackoutDate[]>> {
    try {
      const { data, error } = await supabase
        .from('resource_blackout_dates')
        .select('*')
        .eq('resource_id', resourceId);

      if (error) {
        return {
          success: false,
          data: null,
          error: { code: 'DATABASE_ERROR', message: error.message },
        };
      }

      const blackouts = (data || []).map((row: any) => ({
        id: row.id,
        resourceId: row.resource_id,
        startTime: row.start_time,
        endTime: row.end_time,
        reason: row.reason,
      }));

      return {
        success: true,
        data: blackouts,
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
   * Adds a blackout blocks segment.
   */
  async createBlackout(blackout: BlackoutDate): Promise<ApiResponse<BlackoutDate>> {
    try {
      const { data, error } = await supabase
        .from('resource_blackout_dates')
        .insert({
          resource_id: blackout.resourceId,
          start_time: blackout.startTime,
          end_time: blackout.endTime,
          reason: blackout.reason,
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
          resourceId: data.resource_id,
          startTime: data.start_time,
          endTime: data.end_time,
          reason: data.reason,
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
