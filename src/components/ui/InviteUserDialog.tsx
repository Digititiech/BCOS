import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: { email: string; name: string; role: string }) => void;
}

export function InviteUserDialog({ isOpen, onClose, onSuccess }: InviteUserDialogProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock invitation delay
    setTimeout(() => {
      onSuccess({
        email,
        name,
        role,
      });
      setEmail('');
      setName('');
      setRole('Staff');
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Invite New Team Member">
      <form onSubmit={handleInvite} className="space-y-4 text-start">
        <Input
          label="Full Name"
          placeholder="Abdullah Al-Kindi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="abdullah@company.om"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Select
          label="Access Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: 'Admin', label: 'Admin' },
            { value: 'Manager', label: 'Manager' },
            { value: 'Receptionist', label: 'Receptionist' },
            { value: 'Staff', label: 'Staff' },
            { value: 'Customer', label: 'Customer' },
          ]}
        />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
