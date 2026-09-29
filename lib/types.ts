export const LANGS = ['en', 'ru', 'hy'] as const;
export type Lang = (typeof LANGS)[number];

export type Localized<T = string> = { en: T; ru: T; hy?: T };
export type LangMap<T = Record<string, string>> = Partial<Record<Lang, T>>;

export type Availability = 'in-stock' | 'made-to-order';

export interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  size: string;
  country: string;
  availability: Availability;
  category?: string;
  image: string;
  description: Localized;
  notes: Localized;
}

export interface Slide {
  id: number;
  name: string;
  brand: string;
  price: string | number;
  image: string;
  accent?: string;
  size?: string;
  tagline: Localized;
  description: Localized;
  notes: Localized<string[]>;
}

export interface Filters {
  brands: string[];
  sizes: string[];
  countries: string[];
}

export interface Labels {
  countryLabels: LangMap;
  availabilityLabels: LangMap;
  categoryLabels: LangMap;
}

export type Translations = LangMap;

export interface SiteData {
  products: Product[];
  slides: Slide[];
  filters: Filters;
  i18n: Translations;
  labels: Labels;
}

export type SiteDataKey = keyof SiteData;
export const SITE_DATA_KEYS: SiteDataKey[] = ['products', 'slides', 'i18n', 'filters', 'labels'];

// A cart line: a product (or a hero slide turned into a cart-compatible
// item, with a "slide-" prefixed id) plus its quantity.
export interface CartItem {
  id: number | string;
  brand: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}
