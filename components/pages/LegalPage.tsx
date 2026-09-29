'use client';

// Shared layout of the Privacy Policy and Returns pages: a banner and a
// list of numbered sections, every string editable in the admin panel.
import { Fragment } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import PageBanner from './PageBanner';

type Text = [key: string, fallback: string];

export interface LegalPageContent {
  eyebrow: Text;
  title: Text;
  subtitle: Text;
  updated?: Text;
  sections: { title: Text; text: Text }[];
}

export default function LegalPage({ content }: { content: LegalPageContent }) {
  const { t } = useI18n();

  return (
    <>
      <PageBanner eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />

      <section className="page-content legal-content">
        {content.updated && <p className="legal-updated">{t(...content.updated)}</p>}
        {content.sections.map((s) => (
          <Fragment key={s.title[0]}>
            <h3>{t(...s.title)}</h3>
            <p>{t(...s.text)}</p>
          </Fragment>
        ))}
      </section>
    </>
  );
}
