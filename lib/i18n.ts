import { LANGS, type Lang } from './types';
import { pluralRu } from './format';

export const LANG_COOKIE = 'mesir_lang';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

// Saved choice first, then the browser's Accept-Language, default English.
export function resolveLang(saved: string | undefined, acceptLanguage: string | null): Lang {
  if (isLang(saved)) return saved;
  const browserLang = (acceptLanguage || '').toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('hy')) return 'hy';
  return 'en';
}

export function itemsCountLabel(n: number, lang: Lang): string {
  if (lang === 'ru') {
    return `${n} ${pluralRu(n, 'аромат', 'аромата', 'ароматов')}`;
  }
  return `${n} ${n === 1 ? 'fragrance' : 'fragrances'}`;
}
