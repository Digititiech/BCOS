import { expect, test } from 'vitest';
import {
  checkAvailability,
  getAvailableSlots,
  WorkingHour,
  BlockedPeriod,
  CalendarEvent,
  BufferSetting,
} from '../utils/schedulingEngine';

const mockWorkingHours: WorkingHour[] = [
  { dayOfWeek: 1, startTime: '08:00:00', endTime: '17:00:00' }, // Monday
];

const mockBuffers: BufferSetting = {
  bufferBeforeMinutes: 15,
  bufferAfterMinutes: 15,
};

test('checkAvailability detects overlap with active calendar event', () => {
  const events: CalendarEvent[] = [
    {
      startTime: '2026-07-13T10:00:00Z',
      endTime: '2026-07-13T12:00:00Z',
      title: 'Board Meeting',
    },
  ];

  // Try to book a slot that overlaps (11:00 to 13:00)
  const check = checkAvailability({
    startTime: '2026-07-13T11:00:00Z',
    endTime: '2026-07-13T13:00:00Z',
    workingHours: mockWorkingHours,
    blockedPeriods: [],
    calendarEvents: events,
    buffers: mockBuffers,
    holidays: [],
  });

  expect(check.available).toBe(false);
  expect(check.conflictReason).toContain('Reservation conflict');
});

test('checkAvailability respects setup/cleaning buffer margins', () => {
  const events: CalendarEvent[] = [
    {
      startTime: '2026-07-13T10:00:00Z',
      endTime: '2026-07-13T12:00:00Z',
      title: 'Board Meeting',
    },
  ];

  // Booking from 12:05 should conflict because of 15-minute after-buffer (cleaning blocks till 12:15)
  const check = checkAvailability({
    startTime: '2026-07-13T12:05:00Z',
    endTime: '2026-07-13T13:00:00Z',
    workingHours: mockWorkingHours,
    blockedPeriods: [],
    calendarEvents: events,
    buffers: mockBuffers,
    holidays: [],
  });

  expect(check.available).toBe(false);
  expect(check.conflictReason).toContain('Reservation conflict');
});
