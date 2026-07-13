'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Sandbox authentication preview login
    setTimeout(() => {
      if (email && password) {
        router.push('/dashboard');
      } else {
        setError('Please enter valid email and password.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout>
      <div className="space-y-2 text-start">
        <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your workspace email below to log in.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-primary hover:underline font-medium">
          Register
        </Link>
      </div>
    </AuthLayout>
  );
}
