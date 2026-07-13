import { AvailabilityRule } from '@/services/AvailabilityService';

export interface BlockedPeriod {
  startTime: string; // ISO string
  endTime: string; // ISO string
  reason?: string;
}

export interface CalendarEvent {
  startTime: string; // ISO string
  endTime: string; // ISO string
  title: string;
}

export interface WorkingHour {
  dayOfWeek: number; // 0=Sunday
  startTime: string; // "HH:MM:SS"
  endTime: string; // "HH:MM:SS"
}

export interface BufferSetting {
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflictReason?: string;
}

/**
 * Validates if the requested slot overlaps with another slot.
 */
export function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Checks availability of a resource for a specified window.
 */
export function checkAvailability(params: {
  startTime: string; // ISO string
  endTime: string; // ISO string
  workingHours: WorkingHour[];
  blockedPeriods: BlockedPeriod[];
  calendarEvents: CalendarEvent[];
  buffers: BufferSetting;
  holidays: string[]; // array of ISO dates "YYYY-MM-DD"
}): AvailabilityCheckResult {
  const reqStart = new Date(params.startTime);
  const reqEnd = new Date(params.endTime);

  // 1. Check Date is not in Holidays
  const reqDateStr = reqStart.toISOString().split('T')[0];
  if (params.holidays.includes(reqDateStr)) {
    return { available: false, conflictReason: 'Requested date is an organization holiday' };
  }

  // 2. Check Working Hours constraints
  const dayOfWeek = reqStart.getUTCDay();
  const workHour = params.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
  if (!workHour) {
    return { available: false, conflictReason: 'Resource is closed on this day of the week' };
  }

  // Extract work hours boundaries
  const [wStartH, wStartM] = workHour.startTime.split(':').map(Number);
  const [wEndH, wEndM] = workHour.endTime.split(':').map(Number);

  const workStart = new Date(reqStart);
  workStart.setUTCHours(wStartH || 0, wStartM || 0, 0, 0);

  const workEnd = new Date(reqStart);
  workEnd.setUTCHours(wEndH || 0, wEndM || 0, 0, 0);

  if (reqStart < workStart || reqEnd > workEnd) {
    return { available: false, conflictReason: 'Requested timeslot is outside of operating hours' };
  }

  // 3. Check overlaps with Blocked Periods
  for (const block of params.blockedPeriods) {
    const blockStart = new Date(block.startTime);
    const blockEnd = new Date(block.endTime);
    if (isOverlapping(reqStart, reqEnd, blockStart, blockEnd)) {
      return { available: false, conflictReason: `Blocked period: ${block.reason || 'Maintenance'}` };
    }
  }

  // 4. Check overlaps with Calendar Events (including Pre/Post booking buffers!)
  const beforeBufferMs = (params.buffers?.bufferBeforeMinutes || 0) * 60 * 1000;
  const afterBufferMs = (params.buffers?.bufferAfterMinutes || 0) * 60 * 1000;

  for (const event of params.calendarEvents) {
    // Expand event times based on required setups / cleaning buffers
    const eventStartWithBuffer = new Date(new Date(event.startTime).getTime() - beforeBufferMs);
    const eventEndWithBuffer = new Date(new Date(event.endTime).getTime() + afterBufferMs);

    if (isOverlapping(reqStart, reqEnd, eventStartWithBuffer, eventEndWithBuffer)) {
      return { available: false, conflictReason: `Reservation conflict: ${event.title}` };
    }
  }

  return { available: true };
}

/**
 * Calculates available timeslots for a given day.
 */
export function getAvailableSlots(params: {
  date: string; // "YYYY-MM-DD"
  slotDurationMinutes: number;
  workingHours: WorkingHour[];
  blockedPeriods: BlockedPeriod[];
  calendarEvents: CalendarEvent[];
  buffers: BufferSetting;
  holidays: string[];
}): string[] {
  const slots: string[] = [];
  const startDay = new Date(`${params.date}T00:00:00Z`);

  // Fetch operating hours for the day
  const dayOfWeek = startDay.getUTCDay();
  const workHour = params.workingHours.find((h) => h.dayOfWeek === dayOfWeek);
  if (!workHour) return [];

  const [wStartH, wStartM] = workHour.startTime.split(':').map(Number);
  const [wEndH, wEndM] = workHour.endTime.split(':').map(Number);

  const totalSlots = Math.floor(
    (((wEndH || 0) - (wStartH || 0)) * 60 + ((wEndM || 0) - (wStartM || 0))) / params.slotDurationMinutes
  );

  for (let i = 0; i < totalSlots; i++) {
    const slotStart = new Date(startDay);
    slotStart.setUTCHours((wStartH || 0) + Math.floor((i * params.slotDurationMinutes) / 60), (wStartM || 0) + ((i * params.slotDurationMinutes) % 60), 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setTime(slotEnd.getTime() + params.slotDurationMinutes * 60 * 1000);

    const check = checkAvailability({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      workingHours: params.workingHours,
      blockedPeriods: params.blockedPeriods,
      calendarEvents: params.calendarEvents,
      buffers: params.buffers,
      holidays: params.holidays,
    });

    if (check.available) {
      const startStr = slotStart.toISOString().substring(11, 16);
      const endStr = slotEnd.toISOString().substring(11, 16);
      slots.push(`${startStr}-${endStr}`);
    }
  }

  return slots;
}
