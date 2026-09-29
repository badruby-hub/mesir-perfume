'use client';

import { useI18n } from '@/components/providers/I18nProvider';

type Text = [key: string, fallback: string];

export default function PageBanner({ eyebrow, title, subtitle }: { eyebrow: Text; title: Text; subtitle: Text }) {
  const { t } = useI18n();
  return (
    <section className="page-banner">
      <span className="page-banner-eyebrow">{t(...eyebrow)}</span>
      <h1 className="page-banner-title">{t(...title)}</h1>
      <p className="page-banner-subtitle">{t(...subtitle)}</p>
    </section>
  );
}
