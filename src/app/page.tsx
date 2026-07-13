'use client';

import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  const { t, language } = useLanguage();

  return (
    <PublicLayout>
      <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 space-y-8 relative">
        {/* Glow backdrop decorative bubble */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="space-y-4 max-w-3xl relative z-10 text-start md:text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Sultanate of Oman • Premium Business Spaces
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            {language === 'en'
              ? 'Orchestrate Your Workspace Operations'
              : 'أدر مساحات العمل والمؤتمرات بذكاء'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Book luxury boardrooms, host training events, manage private offices, and leverage conversational AI reservation agents.'
              : 'احجز قاعات الاجتماعات والتدريب الفاخرة، وأدر المكاتب المشتركة والمستندات المالية مع المساعد الذكي المدمج.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md relative z-10">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              {language === 'en' ? 'Launch Dashboard' : 'دخول لوحة التحكم'}
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              {language === 'en' ? 'Sign In' : 'تسجيل الدخول'}
            </Button>
          </Link>
        </div>

        {/* Featured Spaces Showcase Grid */}
        <div className="w-full pt-16 relative z-10 text-start">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
            {language === 'en' ? 'Explore Our Spaces' : 'استكشف مساحاتنا'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                titleEn: 'Training Hall Large',
                titleAr: 'قاعة التدريب الكبرى',
                descEn: 'Accommodates up to 60 pax. Equipped with visual projectors, audio speakers, and catering setups.',
                descAr: 'تتسع لـ 60 شخصاً. مجهزة بأجهزة عرض سينمائي، ومكبرات صوت، وبوفيه ضيافة مخصص.',
                capacity: 60,
                price: '15.0 OMR/hr',
              },
              {
                titleEn: 'Podcast Recording Studio',
                titleAr: 'استوديو تسجيل البودكاست',
                descEn: 'Soundproofed booths with professional cameras, microphone sets, and high-fidelity video mix suites.',
                descAr: 'غرف معزولة للصوت ومجهزة بأحدث الكاميرات والميكروفونات الاحترافية لتسجيل البودكاست.',
                capacity: 4,
                price: '10.0 OMR/hr',
              },
              {
                titleEn: 'Executive Boardroom',
                titleAr: 'غرفة الاجتماعات الرئاسية',
                descEn: 'Premium luxury meeting table for 12 pax. High-speed fiber Wi-Fi, Apple TV sharing, and coffee desk.',
                descAr: 'طاولة اجتماعات فاخرة تتسع لـ 12 شخصاً. إنترنت فائق السرعة، ومشاركة الشاشة، ومشروبات ضيافة.',
                capacity: 12,
                price: '8.0 OMR/hr',
              },
            ].map((space, index) => (
              <div
                key={index}
                className="bg-card border border-border hover:border-primary/30 transition-all rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">
                      {language === 'en' ? space.titleEn : space.titleAr}
                    </h3>
                    <span className="text-xs font-mono bg-secondary px-2.5 py-0.5 rounded-full text-foreground/80">
                      Capacity: {space.capacity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {language === 'en' ? space.descEn : space.descAr}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-sm font-bold text-primary">{space.price}</span>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-xs">
                      {language === 'en' ? 'Book Now →' : 'احجز الآن ←'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
