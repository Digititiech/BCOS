import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types/api';
import {
  checkAvailability,
  getAvailableSlots,
  WorkingHour,
  BlockedPeriod,
  CalendarEvent,
  BufferSetting,
} from '@/utils/schedulingEngine';

export const AvailabilityEngineService = {
  /**
   * Fetches required constraints and executes conflict detection check.
   */
  async checkSlotAvailability(params: {
    resourceId: string;
    startTime: string; // ISO Date String
    endTime: string; // ISO Date String
  }): Promise<ApiResponse<{ available: boolean; reason?: string }>> {
    try {
      // 1. Fetch Working Hours
      const { data: dbHours } = await supabase
        .from('resource_working_hours')
        .select('*')
        .eq('resource_id', params.resourceId);

      const workingHours: WorkingHour[] = (dbHours || []).map((h) => ({
        dayOfWeek: h.day_of_week,
        startTime: h.start_time,
        endTime: h.end_time,
      }));

      // 2. Fetch Blocked periods
      const { data: dbBlocks } = await supabase
        .from('resource_blocked_periods')
        .select('*')
        .eq('resource_id', params.resourceId)
        .eq('status', 'Approved');

      const blockedPeriods: BlockedPeriod[] = (dbBlocks || []).map((b) => ({
        startTime: b.start_time,
        endTime: b.end_time,
        reason: b.reason,
      }));

      // 3. Fetch Calendar reservations
      const { data: dbEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('resource_id', params.resourceId);

      const calendarEvents: CalendarEvent[] = (dbEvents || []).map((e) => ({
        startTime: e.start_time,
        endTime: e.end_time,
        title: e.title,
      }));

      // 4. Fetch Buffers
      const { data: dbBuffer } = await supabase
        .from('resource_buffers')
        .select('*')
        .eq('resource_id', params.resourceId)
        .maybeSingle();

      const buffers: BufferSetting = {
        bufferBeforeMinutes: dbBuffer?.buffer_before_minutes || 0,
        bufferAfterMinutes: dbBuffer?.buffer_after_minutes || 0,
      };

      // Run algorithm checks
      const result = checkAvailability({
        startTime: params.startTime,
        endTime: params.endTime,
        workingHours,
        blockedPeriods,
        calendarEvents,
        buffers,
        holidays: [], // Custom exceptions seeded at the organization level
      });

      return {
        success: true,
        data: {
          available: result.available,
          reason: result.conflictReason,
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
