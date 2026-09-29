'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import PageBanner from './PageBanner';

const VALUES = [
  {
    icon: <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" />,
    title: ['value1_title', 'Rare Sourcing'],
    text: ['value1_text', 'Ingredients selected directly from growers and distillers who share our standard for quality over yield.'],
  },
  {
    icon: (
      <>
        <path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 12 2a8 8 0 0 0-8 8.2C4 17.5 12 22 12 22z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    title: ['value2_title', 'Considered Craft'],
    text: ['value2_text', 'Every composition is aged and re-tested for months before it is deemed worthy of the MESIR name.'],
  },
  {
    icon: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M4 8h16" />
      </>
    ),
    title: ['value3_title', 'Timeless Presentation'],
    text: ['value3_text', 'Each flacon is finished by hand — weighted glass, gilded caps, and packaging made to be kept.'],
  },
] as const;

const STORY = [
  {
    title: ['story1_title', 'Paris, 2014'],
    text: [
      'story1_text',
      'MESIR opened its first atelier on the Rue du Faubourg Saint-Honoré with a single collection of six fragrances. What united them was not a shared note, but a shared intention — to slow down, and to let rare materials speak for themselves rather than compete with a dozen synthetic accords.',
    ],
  },
  {
    title: ['story2_title', 'Today'],
    text: [
      'story2_text',
      "We now work with perfumers and ateliers across France, the UAE, Italy and the United States, but the process hasn't changed: small batches, honest ingredients, and enough patience to let a fragrance become what it was always meant to be.",
    ],
  },
] as const;

export default function About() {
  const { t } = useI18n();

  return (
    <>
      <PageBanner
        eyebrow={['about_eyebrow', 'Our Story']}
        title={['about_title', 'About MESIR']}
        subtitle={[
          'about_subtitle',
          'A curated house of exceptional perfumery, bridging European luxury and Eastern heritage since our founding in Paris.',
        ]}
      />

      <section className="page-content">
        <p className="about-lede">
          {t(
            'about_lede',
            "MESIR was born from a simple belief: that a fragrance should be more than a scent — it should be an heirloom. We travel to the source of the world's rarest raw materials, from the oud forests of the East to the rose fields of Bulgaria, and work only with maisons whose craftsmanship honors those origins. Every bottle in our collection is chosen for its character, not its trend."
          )}
        </p>

        <div className="value-grid">
          {VALUES.map((v) => (
            <div key={v.title[0]} className="value-card">
              <div className="value-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  {v.icon}
                </svg>
              </div>
              <h3 className="value-title">{t(v.title[0], v.title[1])}</h3>
              <p className="value-text">{t(v.text[0], v.text[1])}</p>
            </div>
          ))}
        </div>

        {STORY.map((s) => (
          <div key={s.title[0]} className="story-block">
            <span className="story-block-title">{t(s.title[0], s.title[1])}</span>
            <p className="story-block-text">{t(s.text[0], s.text[1])}</p>
          </div>
        ))}
      </section>
    </>
  );
}
