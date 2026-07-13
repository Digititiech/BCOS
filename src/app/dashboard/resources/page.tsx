'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PageHeader, LoadingState, EmptyState } from '@/components/ui/FeedbackStates';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';

export default function ResourcesPage() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Mock initial bookable resources matching Omani business center assets
  const [resources, setResources] = useState([
    {
      id: 'res-1',
      name: { en: 'Executive Boardroom', ar: 'غرفة الاجتماعات الرئاسية' },
      code: 'CONF-101',
      type: 'Meeting Room',
      capacity: 12,
      location: 'Muscat, 2nd Floor',
      price: '8.0 OMR/hr',
      status: 'Available',
    },
    {
      id: 'res-2',
      name: { en: 'Podcast Recording Studio', ar: 'استوديو تسجيل البودكاست' },
      code: 'POD-204',
      type: 'Podcast Studio',
      capacity: 4,
      location: 'Muscat, 1st Floor',
      price: '10.0 OMR/hr',
      status: 'Cleaning',
    },
    {
      id: 'res-3',
      name: { en: 'Training Hall Large', ar: 'قاعة التدريب الكبرى' },
      code: 'HALL-A',
      type: 'Training Room',
      capacity: 60,
      location: 'Sohar, Ground Floor',
      price: '15.0 OMR/hr',
      status: 'Available',
    },
    {
      id: 'res-4',
      name: { en: 'Co-Working Desk 12', ar: 'مكتب مشترك رقم ١٢' },
      code: 'COWORK-12',
      type: 'Coworking Desk',
      capacity: 1,
      location: 'Muscat, 3rd Floor',
      price: '1.5 OMR/hr',
      status: 'Occupied',
    },
  ]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.name.ar.includes(searchQuery) ||
      res.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || res.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 text-start">
      <PageHeader
        title="Spaces & Resources"
        description="Configure bookable rooms, studios, desks, pricing, and availability configurations."
        actions={
          (profile?.role === 'Admin' || profile?.role === 'Owner') && (
            <Link href="/dashboard/resources/new">
              <Button size="sm">
                <svg className="h-4 w-4 -ms-1 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Resource
              </Button>
            </Link>
          )
        }
      />

      {/* Filter and Search Bar Row */}
      <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={[
            { value: 'All', label: 'All Resource Types' },
            { value: 'Meeting Room', label: 'Meeting Room' },
            { value: 'Podcast Studio', label: 'Podcast Studio' },
            { value: 'Training Room', label: 'Training Room' },
            { value: 'Coworking Desk', label: 'Coworking Desk' },
          ]}
        />

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Available', label: 'Available' },
            { value: 'Occupied', label: 'Occupied' },
            { value: 'Cleaning', label: 'Cleaning' },
            { value: 'Maintenance', label: 'Maintenance' },
          ]}
        />
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <LoadingState message="Loading resource spaces..." />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="No Spaces Found"
          description="Try broadening your search query or filter options to discover assets."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-primary/20 transition-all shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {language === 'en' ? res.name.en : res.name.ar}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    res.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                    res.status === 'Occupied' ? 'bg-blue-500/10 text-blue-400' :
                    res.status === 'Cleaning' ? 'bg-amber-500/10 text-amber-400' : 'bg-destructive/10 text-destructive-foreground'
                  }`}>
                    {res.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Code: {res.code} • {res.type}</p>
                <div className="space-y-1.5 text-sm text-foreground/80 mb-6">
                  <p>👥 Capacity: {res.capacity} people</p>
                  <p>📍 Location: {res.location}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-bold text-primary">{res.price}</span>
                <Link href={`/dashboard/resources/${res.id}`}>
                  <Button variant="outline" size="sm">Configure</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
