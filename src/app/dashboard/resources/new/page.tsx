'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ResourceService } from '@/services/ResourceService';
import { useRouter } from 'next/navigation';

export default function NewResourcePage() {
  const router = useRouter();
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('Meeting Room');
  const [capacity, setCapacity] = useState('10');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Sandbox creation mock
    setTimeout(() => {
      setMessage('Resource created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard/resources');
      }, 1500);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-start max-w-2xl">
      <PageHeader
        title="Add New Resource Space"
        description="Configure a new bookable room, office space, desk, or media studio."
      />

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
        {message ? (
          <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Resource Name (English)"
            placeholder="Meeting Room Emerald"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
          <Input
            label="Resource Name (Arabic)"
            placeholder="غرفة اجتماع الزمرد"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Unique Reference Code"
            placeholder="CONF-102"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Select
            label="Resource Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'Meeting Room', label: 'Meeting Room' },
              { value: 'Podcast Studio', label: 'Podcast Studio' },
              { value: 'Training Room', label: 'Training Room' },
              { value: 'Coworking Desk', label: 'Coworking Desk' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Seating Capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
          <Input
            label="Hourly Rental Price (OMR)"
            type="number"
            step="0.1"
            placeholder="8.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <Input
          label="Physical Location"
          placeholder="Muscat Main Branch, 2nd Floor"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div className="flex gap-3 justify-end border-t border-border pt-4">
          <Button variant="outline" type="button" onClick={() => router.push('/dashboard/resources')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Space
          </Button>
        </div>
      </form>
    </div>
  );
}
