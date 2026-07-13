'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { PageHeader, EmptyState } from '@/components/ui/FeedbackStates';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLanguage();

  const isAdmin = profile?.role === 'Admin' || profile?.role === 'Owner' || profile?.role === 'Manager';
  const isStaff = profile?.role === 'Staff' || profile?.role === 'Receptionist';

  // 1. Render Admin Dashboard Dashboard View
  if (isAdmin) {
    return (
      <div className="space-y-6 text-start">
        <PageHeader
          title={t('dashboard')}
          description="Operational dashboard and workspace KPIs."
          actions={
            <Button size="sm">
              <svg className="h-4 w-4 -ms-1 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Resource
            </Button>
          }
        />

        {/* Dashboard Metric Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              {t('mrr')}
            </span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">12,450.00 OMR</h3>
            <p className="text-xs text-emerald-500 font-medium mt-1">+12% vs last month</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              {t('activeTenants')}
            </span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">148</h3>
            <p className="text-xs text-muted-foreground mt-1">Across 3 branches</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              {t('utilization')}
            </span>
            <h3 className="text-2xl font-bold mt-1 text-foreground">78.4%</h3>
            <p className="text-xs text-emerald-500 font-medium mt-1">Peak: 10:00 AM - 3:00 PM</p>
          </div>
        </div>

        {/* Operations Logs List */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Active System Inquiries</h3>
          <div className="space-y-4">
            {[
              { id: '1024', user: 'Said Al-Rawahi', space: 'Meeting Room A', status: 'Awaiting Payment', price: '15.00 OMR' },
              { id: '1025', user: 'Fatma Al-Balushi', space: 'Podcast Studio', status: 'Paid', price: '24.50 OMR' },
              { id: '1026', user: 'Amjad Engineering', space: 'Training Hall Large', status: 'Quoted', price: '120.00 OMR' },
            ].map((booking) => (
              <div key={booking.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="text-start">
                  <p className="text-sm font-medium text-foreground">{booking.user}</p>
                  <p className="text-xs text-muted-foreground">{booking.space} • Invoice #{booking.id}</p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-bold text-foreground">{booking.price}</p>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    booking.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Staff Portal View
  if (isStaff) {
    return (
      <div className="space-y-6 text-start">
        <PageHeader
          title="Staff Operations"
          description="Track room preparations and check-in schedules."
        />

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Today&apos;s Preparation Checklist</h3>
          <div className="space-y-4">
            {[
              { id: 't1', room: 'Meeting Room A', action: 'Set up coffee station for 6 guests', status: 'InProgress', time: '1:30 PM' },
              { id: 't2', room: 'Podcast Studio', action: 'Verify microphone inputs & levels', status: 'Pending', time: '3:00 PM' },
              { id: 't3', room: 'Training Hall Large', action: 'Arrange 40 chairs in classroom layout', status: 'Completed', time: '9:00 AM' },
            ].map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="text-start">
                  <p className="text-sm font-medium text-foreground">{task.room}</p>
                  <p className="text-xs text-muted-foreground">{task.action}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{task.time}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    task.status === 'InProgress' ? 'bg-blue-500/10 text-blue-400' : 'bg-zinc-500/10 text-zinc-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Customer Dashboard View (Default fallback)
  return (
    <div className="space-y-6 text-start">
      <PageHeader
        title="My Workspaces"
        description="Book on-demand training halls, podcast studios, and meeting offices."
      />

      <EmptyState
        title="No Active Bookings"
        description="You don't have any upcoming space reservations. Let's find you the perfect room!"
        actionText="Reserve a Space"
        onAction={() => alert('Launching Booking Wizard...')}
      />
    </div>
  );
}
