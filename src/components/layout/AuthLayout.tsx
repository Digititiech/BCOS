'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '../ui/Button';
import Link from 'next/link';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Visual branding side panel (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-card relative overflow-hidden flex-col justify-between p-12 border-e border-border">
        {/* Subtle backdrop glowing ambient circle */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
            BCOS
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        <div className="relative z-10 space-y-4 max-w-md text-start">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Premium workspace orchestration engine.
          </h2>
          <p className="text-muted-foreground text-sm">
            Book meeting boardrooms, manage shared offices, issue VAT statements, and deploy AI reservation agents in seconds.
          </p>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground text-start">
          © 2026 BCOS. Muscat, Sultanate of Oman.
        </div>
      </div>

      {/* Interactive Form Side Panel */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 md:p-16 lg:p-24 relative">
        {/* Language switcher for mobile viewports */}
        <div className="absolute top-6 end-6 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
