'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useUIStore } from '@/stores/ui.store';
import { useEffect, useState } from 'react';

// Import messages statically
import enMessages from '@/i18n/locales/en.json';
import viMessages from '@/i18n/locales/vi.json';

const messages = {
  en: enMessages,
  vi: viMessages,
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { locale } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default locale during SSR to avoid hydration mismatch
  const currentLocale = mounted ? locale : 'vi';
  const currentMessages = messages[currentLocale] || messages.vi;

  return (
    <NextIntlClientProvider 
      locale={currentLocale} 
      messages={currentMessages}
      timeZone="Asia/Ho_Chi_Minh"
    >
      {children}
    </NextIntlClientProvider>
  );
}
