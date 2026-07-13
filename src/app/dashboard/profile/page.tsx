'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UserService, UserProfileDetails } from '@/services/UserService';

export default function UserProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('en');
  const [timezone, setTimezone] = useState('Asia/Muscat');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const res = await UserService.getProfile(user.id);
        if (res.success && res.data) {
          setFirstName(res.data.firstName || '');
          setLastName(res.data.lastName || '');
          setPhone(res.data.phone || '');
          setJobTitle(res.data.jobTitle || '');
          setDepartment(res.data.department || '');
          setLanguage(res.data.languagePreference);
          setTimezone(res.data.timezone);
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    setMessage('');

    const res = await UserService.updateProfile(user.id, {
      firstName,
      lastName,
      phone,
      jobTitle,
      department,
      languagePreference: language,
      timezone,
    });

    if (res.success) {
      setMessage('Profile settings saved successfully.');
    } else {
      setMessage('Failed to update profile.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 text-start max-w-2xl">
      <PageHeader
        title="My Profile Settings"
        description="Manage your account profile details, localization preference, and contacts."
      />

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        {message ? (
          <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
            {message}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+968 9123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            placeholder="Operations Coordinator"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Input
            label="Department"
            placeholder="Sales & Booking"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Language Preference"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'العربية (Arabic)' },
            ]}
          />
          <Select
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={[
              { value: 'Asia/Muscat', label: 'Muscat (GMT+4)' },
              { value: 'UTC', label: 'UTC (GMT+0)' },
            ]}
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
