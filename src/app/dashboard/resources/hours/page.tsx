'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function WorkingHoursPage() {
  const [hours, setHours] = useState([
    { day: 'Sunday', open: '08:00', close: '22:00', active: true },
    { day: 'Monday', open: '08:00', close: '22:00', active: true },
    { day: 'Tuesday', open: '08:00', close: '22:00', active: true },
    { day: 'Wednesday', open: '08:00', close: '22:00', active: true },
    { day: 'Thursday', open: '08:00', close: '22:00', active: true },
    { day: 'Friday', open: '09:00', close: '18:00', active: true },
    { day: 'Saturday', open: '09:00', close: '18:00', active: true },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setMessage('Operating hours updated successfully.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-start max-w-2xl">
      <PageHeader
        title="Weekly Working Hours"
        description="Configure default open/closing hours for your organization branches."
      />

      {message ? (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        {hours.map((hr, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <span className="font-semibold text-sm w-28">{hr.day}</span>
            <div className="flex items-center gap-3">
              <Input
                type="time"
                value={hr.open}
                onChange={(e) => {
                  const updated = [...hours];
                  updated[idx]!.open = e.target.value;
                  setHours(updated);
                }}
              />
              <span className="text-muted-foreground text-xs">to</span>
              <Input
                type="time"
                value={hr.close}
                onChange={(e) => {
                  const updated = [...hours];
                  updated[idx]!.close = e.target.value;
                  setHours(updated);
                }}
              />
            </div>
          </div>
        ))}

        <Button type="submit" isLoading={isLoading} className="mt-4">
          Save Operating Schedule
        </Button>
      </form>
    </div>
  );
}
