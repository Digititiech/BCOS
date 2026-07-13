'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function BlockedDatesPage() {
  const [targetResource, setTargetResource] = useState('res-1');
  const [startTime, setStartTime] = useState('2026-07-15T09:00');
  const [endTime, setEndTime] = useState('2026-07-15T12:00');
  const [reason, setReason] = useState('Annual deep-cleaning session');
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState([
    { id: '1', resource: 'Executive Boardroom', start: '2026-07-14 08:00', end: '2026-07-14 10:00', reason: 'AC Repair' },
  ]);

  const handleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setBlocks((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          resource: targetResource === 'res-1' ? 'Executive Boardroom' : 'Podcast Studio',
          start: startTime.replace('T', ' '),
          end: endTime.replace('T', ' '),
          reason,
        },
      ]);
      setReason('');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 text-start max-w-3xl">
      <PageHeader
        title="Blocked Dates & Blackouts"
        description="Schedule absolute time blocks for maintenance, cleaning shutdowns, or VIP private events."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create Block Form */}
        <form onSubmit={handleBlock} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-base">Register Blackout</h3>

          <Select
            label="Target Resource"
            value={targetResource}
            onChange={(e) => setTargetResource(e.target.value)}
            options={[
              { value: 'res-1', label: 'Executive Boardroom' },
              { value: 'res-2', label: 'Podcast Recording Studio' },
            ]}
          />

          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          <Input
            label="Reason"
            placeholder="E.g. Camera maintenance"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            Apply Time Block
          </Button>
        </form>

        {/* Existing Blocks List */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-base">Active Block Registers</h3>
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="border border-border/80 rounded-lg p-3 text-sm bg-secondary/10">
                <p className="font-semibold text-foreground">{block.resource}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{block.start} to {block.end}</p>
                <span className="inline-block mt-2 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">
                  {block.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
