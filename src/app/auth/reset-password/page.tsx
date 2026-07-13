'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Sandbox password reset preview
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        {error ? (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-start">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 rounded-lg text-start">
            Password updated successfully. Redirecting to login...
          </div>
        ) : null}

        <Input
          type="password"
          label="New Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Update Password
        </Button>
      </form>
    </AuthLayout>
  );
}
