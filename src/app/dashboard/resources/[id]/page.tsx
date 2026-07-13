'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useParams, useRouter } from 'next/navigation';

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'setup' | 'hours' | 'blackout'>('basic');
  const [nameEn, setNameEn] = useState('Executive Boardroom');
  const [nameAr, setNameAr] = useState('غرفة الاجتماعات الرئاسية');
  const [status, setStatus] = useState('Available');
  const [price, setPrice] = useState('8.0');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Setup template list
  const [setups, setSetups] = useState([
    { type: 'Boardroom', capacity: 12, cost: '0.0' },
    { type: 'Classroom', capacity: 10, cost: '5.0' },
    { type: 'U-Shape', capacity: 8, cost: '5.0' },
  ]);

  // Operational hours per day
  const [hours, setHours] = useState([
    { day: 'Sunday - Thursday', open: '08:00', close: '17:00' },
    { day: 'Friday - Saturday', open: '09:00', close: '14:00' },
  ]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    setTimeout(() => {
      setMessage('Resource configurations saved successfully.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-start max-w-3xl">
      <PageHeader
        title={`Configure: ${nameEn}`}
        description={`Manage operational parameters, setup layouts, and pricing rates for space #${params.id}.`}
      />

      {/* Tabs Switcher Navigation */}
      <div className="flex border-b border-border gap-2">
        {(['basic', 'setup', 'hours', 'blackout'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-all ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {message ? (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
          {message}
        </div>
      ) : null}

      {/* Tab Panel 1: Basic Config */}
      {activeTab === 'basic' && (
        <form onSubmit={handleUpdate} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Resource Name (English)"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
            />
            <Input
              label="Resource Name (Arabic)"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hourly Rental Price (OMR)"
              type="number"
              step="0.1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Reserved', label: 'Reserved' },
                { value: 'Occupied', label: 'Occupied' },
                { value: 'Cleaning', label: 'Cleaning' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Unavailable', label: 'Unavailable' },
              ]}
            />
          </div>

          <Button type="submit" isLoading={isLoading}>
            Save Parameters
          </Button>
        </form>
      )}

      {/* Tab Panel 2: Setup Templates */}
      {activeTab === 'setup' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Supported Seat Arrangements</h3>
          <div className="space-y-3">
            {setups.map((setup, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{setup.type}</p>
                  <p className="text-xs text-muted-foreground">Capacity: {setup.capacity} pax</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold">Cost: +{setup.cost} OMR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 3: Hours Rules */}
      {activeTab === 'hours' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Operational Business Hours</h3>
          <div className="space-y-3">
            {hours.map((hr, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="font-medium">{hr.day}</span>
                <span className="text-sm text-muted-foreground">{hr.open} - {hr.close}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 4: Blackout blocks */}
      {activeTab === 'blackout' && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Scheduled Blackout Intervals</h3>
          <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-card/30">
            No active blackout date filters registered for this resource.
          </div>
          <Button size="sm">Schedule Block</Button>
        </div>
      )}
    </div>
  );
}
