'use client';

// Every site string in EN / RU / HY. Each keystroke updates the in-memory
// copy and marks it unpublished — nothing is saved until "Опубликовать".
import type { Lang, Translations } from '@/lib/types';

const LANG_FIELDS: { lang: Lang; placeholder: string }[] = [
  { lang: 'en', placeholder: 'EN' },
  { lang: 'ru', placeholder: 'RU' },
  { lang: 'hy', placeholder: 'HY (пока пусто — покажет EN)' },
];

export default function TextsTab({ i18n, onChange }: { i18n: Translations; onChange: (i18n: Translations) => void }) {
  const keys = Object.keys(i18n.en || {});

  const update = (lang: Lang, key: string, value: string) => onChange({ ...i18n, [lang]: { ...(i18n[lang] || {}), [key]: value } });

  return (
    <section className="admin-tab-panel">
      <div className="panel-header">
        <h2>Тексты сайта</h2>
      </div>
      <p className="panel-hint">Каждая строка сайта — на английском, русском и армянском. Правки применятся к сайту после нажатия «Опубликовать» в шапке.</p>
      <div className="texts-list">
        {keys.map((key) => (
          <div key={key} className="text-row">
            <div className="text-row-key">{key}</div>
            {LANG_FIELDS.map(({ lang, placeholder }) => (
              <input key={lang} type="text" placeholder={placeholder} value={i18n[lang]?.[key] || ''} onChange={(e) => update(lang, key, e.target.value)} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
