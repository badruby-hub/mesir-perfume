'use client';

// English / Russian / Armenian. The chosen language is kept in a cookie so
// the server renders the right language on the first paint (no flash of
// English), and in localStorage for visitors of the old static site.
// Translation strings and display labels come from Supabase (site_data
// rows "i18n" and "labels"), edited in the admin panel.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANG_COOKIE, isLang } from '@/lib/i18n';
import type { Labels, Lang, Localized, Translations } from '@/lib/types';

interface I18nValue {
  lang: Lang;
  setLanguage: (lang: Lang) => void;
  // Looks up a translation: current language, then English, then the
  // given fallback (the default text the page shipped with), then the key.
  t: (key: string, fallback?: string) => string;
  // Picks the current language out of a { en, ru, hy } value.
  pick: <T>(value: Localized<T>) => T;
  labels: Labels;
}

const I18nContext = createContext<I18nValue | null>(null);

const ONE_YEAR_S = 60 * 60 * 24 * 365;

function persistLanguage(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; Path=/; Max-Age=${ONE_YEAR_S}; SameSite=Lax`;
  try {
    localStorage.setItem(LANG_COOKIE, lang);
  } catch {
    /* ignore */
  }
}

export function I18nProvider({
  initialLang,
  translations,
  labels,
  children,
}: {
  initialLang: Lang;
  translations: Translations;
  labels: Labels;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);

  const setLanguage = useCallback((next: Lang) => {
    if (!isLang(next)) return;
    setLang(next);
    persistLanguage(next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  // One-time migration: a visitor of the old static site has their
  // language in localStorage only — adopt it and move it to the cookie.
  useEffect(() => {
    if (document.cookie.split('; ').some((c) => c.startsWith(`${LANG_COOKIE}=`))) return;
    try {
      const saved = localStorage.getItem(LANG_COOKIE);
      if (isLang(saved)) setLanguage(saved);
    } catch {
      /* ignore */
    }
  }, [setLanguage]);

  const value = useMemo<I18nValue>(() => {
    const t = (key: string, fallback?: string) =>
      translations[lang]?.[key] || translations.en?.[key] || fallback || key;
    // An empty string/array (e.g. HY left blank in the admin) counts as
    // missing, so it falls back to English.
    const pick = <T,>(v: Localized<T>): T => {
      const own = v[lang] as T | undefined;
      const empty = !own || (Array.isArray(own) && own.length === 0);
      return empty ? v.en : own;
    };
    return { lang, setLanguage, t, pick, labels };
  }, [lang, setLanguage, translations, labels]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
