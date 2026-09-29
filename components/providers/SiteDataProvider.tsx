'use client';

// Products, hero slides and filter lists edited via the admin panel. The
// server layout reads them from Supabase on every request and hands them
// down here, so every page renders with real data on first paint.
import { createContext, useContext, type ReactNode } from 'react';
import type { Filters, Product, Slide } from '@/lib/types';

interface SiteDataValue {
  products: Product[];
  slides: Slide[];
  filters: Filters;
}

const SiteDataContext = createContext<SiteDataValue | null>(null);

export function SiteDataProvider({ value, children }: { value: SiteDataValue; children: ReactNode }) {
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData(): SiteDataValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error('useSiteData must be used inside <SiteDataProvider>');
  return ctx;
}
