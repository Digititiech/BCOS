'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/FeedbackStates';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { OrganizationService } from '@/services/OrganizationService';

export default function OrganizationSettingsPage() {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [tier, setTier] = useState<'Standard' | 'Silver' | 'Gold' | 'Platinum'>('Standard');
  const [status, setStatus] = useState<'active' | 'suspended' | 'trialing'>('trialing');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (profile?.organizationId) {
        const res = await OrganizationService.getSettings(profile.organizationId);
        if (res.success && res.data) {
          setName(res.data.name);
          setSlug(res.data.slug);
          setLogoUrl(res.data.logoUrl || '');
          setTier(res.data.subscriptionTier);
          setStatus(res.data.status);
        }
      }
    };
    loadSettings();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organizationId) return;

    setIsLoading(true);
    setMessage('');

    const res = await OrganizationService.updateSettings(profile.organizationId, {
      name,
      slug,
      logoUrl,
      subscriptionTier: tier,
      status,
    });

    if (res.success) {
      setMessage('Organization settings updated successfully.');
    } else {
      setMessage('Failed to update organization details.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 text-start max-w-2xl">
      <PageHeader
        title="Organization Settings"
        description="Configure your business center workspace profile details, branding and subscription tier."
      />

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4">
        {message ? (
          <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
            {message}
          </div>
        ) : null}

        <Input
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Tenant URL Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
        />

        <Input
          label="Logo Image URL"
          placeholder="https://company.com/logo.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Subscription Tier"
            value={tier}
            onChange={(e) => setTier(e.target.value as any)}
            disabled={profile?.role !== 'Admin' && profile?.role !== 'Owner'}
            options={[
              { value: 'Standard', label: 'Standard Tier' },
              { value: 'Silver', label: 'Silver Tier' },
              { value: 'Gold', label: 'Gold Tier' },
              { value: 'Platinum', label: 'Platinum Tier' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={profile?.role !== 'Admin' && profile?.role !== 'Owner'}
            options={[
              { value: 'trialing', label: 'Trialing' },
              { value: 'active', label: 'Active Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
        </div>

        {(profile?.role === 'Admin' || profile?.role === 'Owner') && (
          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Save Organization Details
          </Button>
        )}
      </form>
    </div>
  );
}
