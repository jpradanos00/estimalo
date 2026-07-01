import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import es from '../i18n/es';
import en from '../i18n/en';
import type { Translations } from '../i18n/es';

type Locale = 'es' | 'en';

const translations: Record<Locale, Translations> = { es, en };

function detectLocale(): Locale {
  const stored = localStorage.getItem('locale') as Locale | null;
  if (stored === 'es' || stored === 'en') return stored;
  if (navigator.language.startsWith('es')) return 'es';
  return 'en';
}

interface I18nContextValue {
  t: Translations;
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ t: translations[locale], locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
