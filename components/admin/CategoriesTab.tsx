'use client';

// Categories live in labels.categoryLabels — the same 3-language pattern
// as country/availability labels, but managed here since categories are
// entirely defined by this shop.
import type { Labels } from '@/lib/types';
import type { ConfirmRequest } from './shared';

const LANG_FIELDS = [
  { lang: 'ru', placeholder: 'RU — Духи' },
  { lang: 'en', placeholder: 'EN — Perfume' },
  { lang: 'hy', placeholder: 'HY — Օծանելիք' },
] as const;

export default function CategoriesTab({
  labels,
  onChange,
  askConfirm,
}: {
  labels: Labels;
  onChange: (labels: Labels) => void;
  askConfirm: (request: ConfirmRequest) => void;
}) {
  const cl = {
    en: labels.categoryLabels?.en || {},
    ru: labels.categoryLabels?.ru || {},
    hy: labels.categoryLabels?.hy || {},
  };
  const slugs = Object.keys(cl.ru).length ? Object.keys(cl.ru) : Object.keys(cl.en);

  const update = (next: typeof cl) => onChange({ ...labels, categoryLabels: next });

  const add = () => {
    // A stable, never-reused machine key — display text can be edited
    // freely afterward without breaking which products belong to it.
    const slug = `cat-${Date.now()}`;
    update({ en: { ...cl.en, [slug]: '' }, ru: { ...cl.ru, [slug]: '' }, hy: { ...cl.hy, [slug]: '' } });
  };

  const remove = (slug: string) =>
    askConfirm({
      text: 'Удалить эту категорию? (Товары, у которых она стояла, останутся без категории после публикации.)',
      onConfirm: () => {
        const without = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== slug));
        update({ en: without(cl.en), ru: without(cl.ru), hy: without(cl.hy) });
      },
    });

  return (
    <section className="admin-tab-panel">
      <div className="panel-header">
        <h2>
          Категории <span className="count-badge">({slugs.length})</span>
        </h2>
        <button className="btn-primary" onClick={add}>
          + Добавить категорию
        </button>
      </div>
      <p className="panel-hint">Название категории на трёх языках. Пустое поле HY/EN — сайт покажет русский вариант вместо него, пока не заполнено.</p>
      <div className="categories-list">
        {slugs.map((slug) => (
          <div key={slug} className="category-row">
            {LANG_FIELDS.map(({ lang, placeholder }) => (
              <input
                key={lang}
                type="text"
                placeholder={placeholder}
                value={cl[lang][slug] || ''}
                onChange={(e) => update({ ...cl, [lang]: { ...cl[lang], [slug]: e.target.value } })}
              />
            ))}
            <button className="icon-action-btn danger" type="button" onClick={() => remove(slug)}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
