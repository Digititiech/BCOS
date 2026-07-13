'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Sandbox registration preview
    setTimeout(() => {
      if (email && password) {
        router.push('/dashboard');
      } else {
        setError('Please complete all fields.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Register to begin reserving Omani workspaces.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {error ? (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-start">
            {error}
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

        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          type="text"
          label="Company Name (Optional)"
          placeholder="Acme Oman LLC"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Register Organization
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
