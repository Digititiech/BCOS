'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/AuthService';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const res = await AuthService.resetPassword(email);
    if (res.success) {
      setMessage('Password reset email sent. Please check your inbox.');
    } else {
      setError(res.error?.message || 'Error triggering password reset link.');
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address to receive a recovery link.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        {error ? (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-start">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 rounded-lg text-start">
            {message}
          </div>
        ) : null}

        <Input
          type="email"
          label="Email Address"
          placeholder="name@company.om"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Back to{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
