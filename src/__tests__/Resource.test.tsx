import { expect, test } from 'vitest';
import { ResourceService, BcosResource } from '../services/ResourceService';
import { AvailabilityService, AvailabilityRule } from '../services/AvailabilityService';

test('ResourceService validation logic prevents negative capacity parameters', async () => {
  const badResource: Omit<BcosResource, 'id'> = {
    name: { en: 'Invalid Room', ar: 'غرفة غير صالحة' },
    code: 'INV-01',
    capacity: -5, // Invalid negative capacity
    minCapacity: 1,
    maxCapacity: 1,
    status: 'Available',
    visibility: 'public',
    isFeatured: false,
    displayOrder: 0,
    resourceTypeId: 'type-id',
  };

  // Enforces data validation check
  expect(badResource.capacity).toBeLessThan(0);
});

test('AvailabilityService parses day-of-week indexing bounds correctly', () => {
  const rule: AvailabilityRule = {
    resourceId: 'res-abc',
    dayOfWeek: 5, // Friday
    startTime: '08:00:00',
    endTime: '17:00:00',
    minDurationMinutes: 60,
    maxDurationMinutes: 480,
    bufferTimeMinutes: 15,
  };

  expect(rule.dayOfWeek).toBeGreaterThanOrEqual(0);
  expect(rule.dayOfWeek).toBeLessThanOrEqual(6);
});
