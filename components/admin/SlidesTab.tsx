'use client';

import { useState, type FormEvent } from 'react';
import type { Slide } from '@/lib/types';
import { ImageUploadField, Modal, nextId, type ConfirmRequest } from './shared';

type Langs = { en: string; ru: string; hy: string };

// Notes are edited as one textarea per language, one note per line.
interface SlideForm {
  id: number | null;
  name: string;
  price: string;
  image: string;
  tagline: Langs;
  description: Langs;
  notes: Langs;
}

const EMPTY_LANGS: Langs = { en: '', ru: '', hy: '' };
const EMPTY_FORM: SlideForm = {
  id: null,
  name: '',
  price: '',
  image: '',
  tagline: EMPTY_LANGS,
  description: EMPTY_LANGS,
  notes: EMPTY_LANGS,
};

function toForm(s: Slide): SlideForm {
  return {
    id: s.id,
    name: s.name,
    price: String(s.price),
    image: s.image,
    tagline: { en: s.tagline.en, ru: s.tagline.ru, hy: s.tagline.hy || '' },
    description: { en: s.description.en, ru: s.description.ru, hy: s.description.hy || '' },
    notes: { en: s.notes.en.join('\n'), ru: s.notes.ru.join('\n'), hy: (s.notes.hy || []).join('\n') },
  };
}

const toLines = (text: string) => text.split('\n').map((s) => s.trim()).filter(Boolean);

function SlideFormModal({ initial, onSave, onClose }: { initial: SlideForm; onSave: (form: SlideForm) => void; onClose: () => void }) {
  const [form, setForm] = useState(initial);
  const set = <K extends 'name' | 'price' | 'image'>(key: K, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const setLocalized = (group: 'tagline' | 'description' | 'notes', lang: keyof Langs, value: string) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [lang]: value } }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={initial.id ? 'Изменить слайд' : 'Добавить слайд'} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-row-2">
          <div className="field">
            <label>Название (латиницей)</label>
            <input type="text" placeholder="OUD ROYAL" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Цена (в драмах, например 144400)</label>
            <input type="text" placeholder="144400" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
        </div>
        <ImageUploadField value={form.image} onChange={(url) => set('image', url)} />
        <div className="field">
          <label>Слоган (EN)</label>
          <input type="text" required value={form.tagline.en} onChange={(e) => setLocalized('tagline', 'en', e.target.value)} />
        </div>
        <div className="field">
          <label>Слоган (RU)</label>
          <input type="text" required value={form.tagline.ru} onChange={(e) => setLocalized('tagline', 'ru', e.target.value)} />
        </div>
        <div className="field">
          <label>Слоган (HY) — необязательно, пока пусто → покажет EN</label>
          <input type="text" value={form.tagline.hy} onChange={(e) => setLocalized('tagline', 'hy', e.target.value)} />
        </div>
        <div className="field">
          <label>Описание (EN)</label>
          <textarea required value={form.description.en} onChange={(e) => setLocalized('description', 'en', e.target.value)} />
        </div>
        <div className="field">
          <label>Описание (RU)</label>
          <textarea required value={form.description.ru} onChange={(e) => setLocalized('description', 'ru', e.target.value)} />
        </div>
        <div className="field">
          <label>Описание (HY) — необязательно</label>
          <textarea value={form.description.hy} onChange={(e) => setLocalized('description', 'hy', e.target.value)} />
        </div>
        <div className="field">
          <label>Ноты (EN) — по одной на строку</label>
          <textarea
            placeholder={'Top: Saffron, Cardamom\nHeart: Oud, Rose\nBase: Amber, Musk'}
            required
            value={form.notes.en}
            onChange={(e) => setLocalized('notes', 'en', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Ноты (RU) — по одной на строку</label>
          <textarea
            placeholder={'Верхние: шафран, кардамон\nСредние: уд, роза\nБазовые: амбра, мускус'}
            required
            value={form.notes.ru}
            onChange={(e) => setLocalized('notes', 'ru', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Ноты (HY) — по одной на строку, необязательно</label>
          <textarea value={form.notes.hy} onChange={(e) => setLocalized('notes', 'hy', e.target.value)} />
        </div>
        <div className="modal-actions">
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function SlidesTab({
  slides,
  onChange,
  askConfirm,
}: {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
  askConfirm: (request: ConfirmRequest) => void;
}) {
  const [editing, setEditing] = useState<SlideForm | null>(null);

  const save = (form: SlideForm) => {
    const existing = form.id ? slides.find((s) => s.id === form.id) : undefined;
    const trimAll = (l: Langs) => ({ en: l.en.trim(), ru: l.ru.trim(), hy: l.hy.trim() });
    const slide: Slide = {
      ...existing,
      id: form.id ?? nextId(slides),
      name: form.name.trim(),
      brand: existing ? existing.brand : 'MESIR',
      price: form.price.trim(),
      image: form.image.trim(),
      accent: existing ? existing.accent : '#c9901a',
      tagline: trimAll(form.tagline),
      description: trimAll(form.description),
      notes: { en: toLines(form.notes.en), ru: toLines(form.notes.ru), hy: toLines(form.notes.hy) },
    };
    onChange(form.id ? slides.map((s) => (s.id === slide.id ? slide : s)) : [...slides, slide]);
    setEditing(null);
  };

  const remove = (slide: Slide) =>
    askConfirm({
      text: `Удалить слайд «${slide.name}»? (Удаление применится после публикации.)`,
      onConfirm: () => onChange(slides.filter((s) => s.id !== slide.id)),
    });

  return (
    <section className="admin-tab-panel">
      <div className="panel-header">
        <h2>
          Hero-слайды <span className="count-badge">({slides.length})</span>
        </h2>
        <button className="btn-primary" onClick={() => setEditing(EMPTY_FORM)}>
          + Добавить слайд
        </button>
      </div>
      <div className="slides-list">
        {slides.map((s) => (
          <div key={s.id} className="slide-row">
            <img src={s.image} alt="" />
            <div className="slide-row-info">
              <div className="slide-row-name">
                {s.name} · {(+String(s.price).replace(/[^0-9.]/g, '') || 0).toLocaleString('ru-RU')} ֏
              </div>
              <div className="slide-row-tagline">{s.tagline.en}</div>
            </div>
            <div className="row-actions">
              <button className="icon-action-btn" onClick={() => setEditing(toForm(s))}>
                Изменить
              </button>
              <button className="icon-action-btn danger" onClick={() => remove(s)}>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && <SlideFormModal initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </section>
  );
}
