import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, LOCALES, dictionaries } from './translations';

const I18nContext = createContext(null);

function applyDocumentLang(locale) {
  const meta = LOCALES.find((l) => l.id === locale) || LOCALES[0];
  document.documentElement.lang = meta.id;
  document.documentElement.dir = meta.dir;
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem('dashenna_lang') || DEFAULT_LOCALE;
    } catch {
      return DEFAULT_LOCALE;
    }
  });

  useEffect(() => {
    applyDocumentLang(locale);
    try {
      localStorage.setItem('dashenna_lang', locale);
    } catch { /* ignore */ }
  }, [locale]);

  const setLocale = (id) => {
    if (dictionaries[id]) setLocaleState(id);
  };

  const t = useMemo(() => {
    const dict = dictionaries[locale] || dictionaries.fr;
    return (key) => dict[key] ?? dictionaries.fr[key] ?? key;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, t, locales: LOCALES }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
