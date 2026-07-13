'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, LoadingState } from '@/components/ui/FeedbackStates';
import { Button } from '@/components/ui/Button';
import { InviteUserDialog } from '@/components/ui/InviteUserDialog';
import { UserService, UserProfileDetails } from '@/services/UserService';

export default function TeamMembersPage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<UserProfileDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    const loadTeam = async () => {
      if (profile?.organizationId) {
        const res = await UserService.getTeamMembers(profile.organizationId);
        if (res.success && res.data) {
          setMembers(res.data);
        } else {
          // Mock initial members roster in Sprint 0 sandbox
          setMembers([
            { id: '1', email: 'ahmed@bcos.om', firstName: 'Ahmed', lastName: 'Al-Omani', jobTitle: 'CEO', department: 'Executive', languagePreference: 'en', timezone: 'Asia/Muscat' },
            { id: '2', email: 'fatma@bcos.om', firstName: 'Fatma', lastName: 'Al-Balushi', jobTitle: 'Workspace Host', department: 'Reception', languagePreference: 'ar', timezone: 'Asia/Muscat' },
            { id: '3', email: 'salim@bcos.om', firstName: 'Salim', lastName: 'Al-Kharusi', jobTitle: 'SRE Support', department: 'IT Operations', languagePreference: 'en', timezone: 'Asia/Muscat' },
          ]);
        }
      }
      setIsLoading(false);
    };
    loadTeam();
  }, [profile]);

  const handleInviteSuccess = (newUser: { email: string; name: string; role: string }) => {
    const [firstName, lastName] = newUser.name.split(' ');
    const newMember: UserProfileDetails = {
      id: Math.random().toString(),
      email: newUser.email,
      firstName: firstName || newUser.name,
      lastName: lastName || '',
      jobTitle: newUser.role,
      department: 'Invited Teammate',
      languagePreference: 'en',
      timezone: 'Asia/Muscat',
    };
    setMembers((prev) => [...prev, newMember]);
  };

  return (
    <div className="space-y-6 text-start">
      <PageHeader
        title="Team Members"
        description="Invite and manage access roles for workspace coordinators, staff and customers."
        actions={
          (profile?.role === 'Admin' || profile?.role === 'Owner') && (
            <Button size="sm" onClick={() => setIsInviteOpen(true)}>
              <svg className="h-4 w-4 -ms-1 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite User
            </Button>
          )
        }
      />

      {isLoading ? (
        <LoadingState message="Loading team members..." />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-start">
              <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-start">Name</th>
                  <th className="px-6 py-4 text-start">Email Address</th>
                  <th className="px-6 py-4 text-start">Job Title</th>
                  <th className="px-6 py-4 text-start">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
                    <td className="px-6 py-4 text-foreground/80">{member.jobTitle || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{member.department || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}
