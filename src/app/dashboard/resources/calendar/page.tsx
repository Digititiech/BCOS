'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';

export default function ResourceCalendarPage() {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState('13 July 2026');

  // Mock workspace schedules mapping
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  const rooms = [
    { name: 'Executive Boardroom', schedule: { '08:00': 'Booked (Ahmed)', '14:00': 'Booked (Nasser)' } },
    { name: 'Podcast Recording Studio', schedule: { '10:00': 'Maintenance', '16:00': 'Booked (Fatma)' } },
    { name: 'Training Hall Large', schedule: { '08:00': 'Booked (Amjad LLC)', '10:00': 'Booked (Amjad LLC)' } },
  ];

  return (
    <div className="space-y-6 text-start">
      <PageHeader
        title="Operational Booking Calendar"
        description="Check occupancy timelines, reservation schedules and blackout blocks across training halls, studios and desks."
        actions={
          <div className="flex gap-1.5 bg-secondary p-1 rounded-lg">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        }
      />

      {/* Date Header Controller */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <h3 className="font-bold text-lg">{currentDate}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            ← Previous
          </Button>
          <Button variant="outline" size="sm">
            Next →
          </Button>
        </div>
      </div>

      {/* Timeline Schedule Matrix Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-start">
            <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-start">Resource Space</th>
                {timeSlots.map((time) => (
                  <th key={time} className="px-6 py-4 text-center">
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {rooms.map((room, idx) => (
                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                    {room.name}
                  </td>
                  {timeSlots.map((time) => {
                    const status = (room.schedule as any)[time];
                    return (
                      <td key={time} className="px-4 py-4 text-center">
                        {status ? (
                          <div className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                            status.includes('Booked')
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {status}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 font-mono">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
