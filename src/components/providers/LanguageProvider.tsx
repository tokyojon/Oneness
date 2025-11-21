'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type LanguageCode = 'en' | 'ja' | 'ar';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  availableLanguages: { code: LanguageCode; label: string }[];
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = 'oneness_language';

const AVAILABLE_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'ja', label: '日本語' },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('ja');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, 'ja');
    document.documentElement.lang = 'ja';
    document.documentElement.dir = 'ltr';
  }, [language]);

  const setLanguage = (code: LanguageCode) => {
    setLanguageState('ja');
  };

  const value = useMemo(
    () => ({ language, setLanguage, availableLanguages: AVAILABLE_LANGUAGES }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
