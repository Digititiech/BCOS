'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, LoadingState } from '@/components/ui/FeedbackStates';
import { Button } from '@/components/ui/Button';
import { RoleService, BcosRole, BcosPermission } from '@/services/RoleService';

export default function PermissionsPage() {
  const { profile } = useAuth();
  const [roles, setRoles] = useState<BcosRole[]>([]);
  const [permissions, setPermissions] = useState<BcosPermission[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadPermissions = async () => {
      // Mock standard permissions list for Sprint 0 preview
      const mockPerms: BcosPermission[] = [
        { id: 'p1', name: 'organization.update', description: 'Modify branding and settings' },
        { id: 'p2', name: 'branch.manage', description: 'Create and edit branches' },
        { id: 'p3', name: 'profile.manage', description: 'Invite and manage users' },
        { id: 'p4', name: 'role.manage', description: 'Edit roles and permissions' },
        { id: 'p5', name: 'resource.manage', description: 'Manage rooms and pricing' },
        { id: 'p6', name: 'booking.manage', description: 'Confirm or cancel bookings' },
        { id: 'p7', name: 'payment.view', description: 'View financial transaction logs' },
      ];

      const mockRoles: BcosRole[] = [
        { id: 'r1', name: 'Owner', description: 'Full owner control', isSystemRole: true },
        { id: 'r2', name: 'Admin', description: 'Organization administrator', isSystemRole: true },
        { id: 'r3', name: 'Manager', description: 'Operations manager', isSystemRole: true },
        { id: 'r4', name: 'Receptionist', description: 'Desk host', isSystemRole: true },
        { id: 'r5', name: 'Staff', description: 'Operations crew', isSystemRole: true },
        { id: 'r6', name: 'Customer', description: 'Space client', isSystemRole: true },
      ];

      // Initializing mock checked grid mapping
      const initialMatrix: Record<string, Record<string, boolean>> = {
        r1: { p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true }, // Owner has all
        r2: { p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: true }, // Admin has all
        r3: { p1: false, p2: false, p3: true, p4: false, p5: true, p6: true, p7: true }, // Manager
        r4: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: true, p7: false }, // Receptionist
        r5: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false }, // Staff
        r6: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false }, // Customer
      };

      setPermissions(mockPerms);
      setRoles(mockRoles);
      setMatrix(initialMatrix);
      setIsLoading(false);
    };

    loadPermissions();
  }, []);

  const handleToggle = (roleId: string, permissionId: string) => {
    if (profile?.role !== 'Admin' && profile?.role !== 'Owner') return; // Read-only guard

    setMatrix((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: !prev[roleId]?.[permissionId],
      },
    }));
  };

  const handleSave = () => {
    setMessage('Permissions matrix updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6 text-start">
      <PageHeader
        title="Roles & Permissions Matrix"
        description="Bind authorization scopes to custom and system roles. Only organization admins can modify this grid."
      />

      {message ? (
        <div className="p-3 text-sm text-primary bg-primary/10 rounded-lg">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading permissions grid..." />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-start">
              <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-start">Permission Domain</th>
                  {roles.map((role) => (
                    <th key={role.id} className="px-4 py-4 text-center whitespace-nowrap">
                      {role.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 text-start">
                      <p className="font-semibold text-foreground">{perm.name}</p>
                      <p className="text-xs text-muted-foreground">{perm.description}</p>
                    </td>
                    {roles.map((role) => {
                      const isChecked = !!matrix[role.id]?.[perm.id];
                      return (
                        <td key={role.id} className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                            checked={isChecked}
                            disabled={profile?.role !== 'Admin' && profile?.role !== 'Owner'}
                            onChange={() => handleToggle(role.id, perm.id)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(profile?.role === 'Admin' || profile?.role === 'Owner') && (
        <Button onClick={handleSave}>
          Save Permissions Mapping
        </Button>
      )}
    </div>
  );
}
