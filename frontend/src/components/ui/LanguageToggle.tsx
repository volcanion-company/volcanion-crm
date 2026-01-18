'use client';

import { Globe } from 'lucide-react';
import { Button } from './Button';
import { useUIStore, type Locale } from '@/stores/ui.store';
import { useEffect, useState } from 'react';

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageToggle() {
  const { locale, setLocale } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Globe className="h-5 w-5" />
      </Button>
    );
  }

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  const handleLanguageChange = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
    // Force reload to apply new translations
    window.location.reload();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        title={currentLanguage.name}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-md border bg-popover p-1 shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${
                  locale === lang.code ? 'bg-accent' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LanguageDropdown() {
  const { locale, setLocale } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleChange = (code: Locale) => {
    setLocale(code);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={locale === lang.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChange(lang.code)}
          className="flex items-center gap-1"
        >
          <span>{lang.flag}</span>
          {lang.name}
        </Button>
      ))}
    </div>
  );
}
