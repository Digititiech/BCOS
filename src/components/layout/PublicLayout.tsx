'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '../ui/Button';
import Link from 'next/link';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">
              BCOS
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/spaces" className="hover:text-foreground transition-colors">
                Spaces
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main page content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-border bg-card py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 BCOS Business Center. All Rights Reserved. Muscat, Oman.</p>
        </div>
      </footer>
    </div>
  );
}
