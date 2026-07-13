'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  dir: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    appName: 'BCOS',
    dashboard: 'Dashboard',
    bookings: 'Bookings',
    resources: 'Resources',
    invoices: 'Invoices',
    settings: 'Settings',
    logout: 'Logout',
    english: 'English',
    arabic: 'العربية',
    // Customer Portal
    bookRoom: 'Book a Resource',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    addons: 'Add-on Services',
    summary: 'Booking Summary',
    payNow: 'Pay Now',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    totalPrice: 'Total Price',
    confirmBooking: 'Confirm Booking',
    // Dashboard States
    quoted: 'Quoted',
    confirmed: 'Confirmed',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    mrr: 'MRR',
    activeTenants: 'Active Tenants',
    utilization: 'Space Utilization',
    revenue: 'Revenue',
  },
  ar: {
    // General
    appName: 'نظام إدارة مراكز الأعمال (BCOS)',
    dashboard: 'لوحة التحكم',
    bookings: 'الحجوزات',
    resources: 'الموارد',
    invoices: 'الفواتير',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    english: 'English',
    arabic: 'العربية',
    // Customer Portal
    bookRoom: 'حجز مورد',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    addons: 'الخدمات الإضافية',
    summary: 'ملخص الحجز',
    payNow: 'ادفع الآن',
    status: 'الحالة',
    date: 'التاريخ',
    time: 'الوقت',
    duration: 'المدة',
    totalPrice: 'السعر الإجمالي',
    confirmBooking: 'تأكيد الحجز',
    // Dashboard States
    quoted: 'مقدم عرض سعر',
    confirmed: 'مؤكد',
    paid: 'مدفوع',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    mrr: 'الإيرادات المتكررة الشهيرة (MRR)',
    activeTenants: 'المستأجرون النشطون',
    utilization: 'معدل استخدام المساحة',
    revenue: 'الإيرادات',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [dir, setDir] = useState<Direction>('ltr');

  // Load preferred language from localStorage if available
  useEffect(() => {
    const storedLang = localStorage.getItem('bcos-lang') as Language;
    if (storedLang === 'en' || storedLang === 'ar') {
      setLanguageState(storedLang);
      setDir(storedLang === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = storedLang;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const newDir = lang === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    localStorage.setItem('bcos-lang', lang);
    document.documentElement.dir = newDir;
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      <div dir={dir} className="w-full h-full min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
