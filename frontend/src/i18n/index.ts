import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export default getRequestConfig(async () => {
  // For client-side only app, we'll get locale from store
  const locale = defaultLocale;
  
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
