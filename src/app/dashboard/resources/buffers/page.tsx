'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function BufferSettingsPage() {
  const [targetType, setTargetType] = useState('Meeting Room');
  const [beforeMin, setBeforeMin] = useState('15');
  const [afterMin, setAfterMin] = useState('15');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setMessage(`Buffers saved for type: ${targetType}.`);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 text-start max-w-2xl">
      <PageHeader
        title="Setup & Cleaning Buffers"
        description="Set before/after reservation buffers to allow staff preparation and room maintenance."
      />

      {message ? (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <Select
          label="Apply Buffer To"
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          options={[
            { value: 'Meeting Room', label: 'All Meeting Rooms' },
            { value: 'Podcast Studio', label: 'All Podcast Studios' },
            { value: 'Training Room', label: 'All Training Rooms' },
            { value: 'Coworking Desk', label: 'All Coworking Desks' },
          ]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Pre-Booking Setup Buffer (Minutes)"
            type="number"
            value={beforeMin}
            onChange={(e) => setBeforeMin(e.target.value)}
            required
          />
          <Input
            label="Post-Booking Cleaning Buffer (Minutes)"
            type="number"
            value={afterMin}
            onChange={(e) => setAfterMin(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading}>
          Save Buffer Parameters
        </Button>
      </form>
    </div>
  );
}
