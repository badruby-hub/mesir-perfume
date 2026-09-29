'use client';

import { useState, type FormEvent } from 'react';
import type { Availability, Labels, Product } from '@/lib/types';
import { ImageUploadField, Modal, nextId, type ConfirmRequest } from './shared';

type ProductForm = Omit<Product, 'id' | 'price'> & { id: number | null; price: string };

const EMPTY_FORM: ProductForm = {
  id: null,
  brand: '',
  name: '',
  price: '',
  size: '',
  country: '',
  availability: 'in-stock',
  category: '',
  image: '',
  description: { en: '', ru: '', hy: '' },
  notes: { en: '', ru: '', hy: '' },
};

function toForm(p: Product): ProductForm {
  return {
    ...p,
    price: String(p.price),
    category: p.category || '',
    description: { en: p.description.en, ru: p.description.ru, hy: p.description.hy || '' },
    notes: { en: p.notes.en, ru: p.notes.ru, hy: p.notes.hy || '' },
  };
}

export function categoryLabel(labels: Labels, slug: string | undefined): string {
  if (!slug) return '—';
  const cl = labels.categoryLabels || {};
  return cl.ru?.[slug] || cl.en?.[slug] || cl.hy?.[slug] || slug;
}

function ProductFormModal({
  initial,
  labels,
  onSave,
  onClose,
}: {
  initial: ProductForm;
  labels: Labels;
  onSave: (form: ProductForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setLocalized = (group: 'description' | 'notes', lang: 'en' | 'ru' | 'hy', value: string) =>
    setForm((f) => ({ ...f, [group]: { ...f[group], [lang]: value } }));

  // Category options come from the managed category list (RU label shown,
  // the admin's working language). If this product's current category
  // isn't in that list, it's added so its assignment isn't silently lost.
  const cl = labels.categoryLabels || {};
  const slugs = new Set([...Object.keys(cl.ru || {}), ...Object.keys(cl.en || {}), ...Object.keys(cl.hy || {})]);
  if (initial.category) slugs.add(initial.category);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={initial.id ? 'Изменить товар' : 'Добавить товар'} onClose={onClose}>
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-row-2">
          <div className="field">
            <label>Бренд</label>
            <input type="text" required value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          </div>
          <div className="field">
            <label>Название</label>
            <input type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
        </div>
        <div className="form-row-3">
          <div className="field">
            <label>Цена (в драмах, например 144400)</label>
            <input type="number" min="0" step="1" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div className="field">
            <label>Объём</label>
            <input type="text" placeholder="50 ml" required value={form.size} onChange={(e) => set('size', e.target.value)} />
          </div>
          <div className="field">
            <label>Страна</label>
            <input type="text" placeholder="France" required value={form.country} onChange={(e) => set('country', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Наличие</label>
          <select value={form.availability} onChange={(e) => set('availability', e.target.value as Availability)}>
            <option value="in-stock">In Stock</option>
            <option value="made-to-order">Made to Order</option>
          </select>
        </div>
        <div className="field">
          <label>Категория</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">— без категории —</option>
            {[...slugs].sort().map((slug) => (
              <option key={slug} value={slug}>
                {categoryLabel(labels, slug)}
              </option>
            ))}
          </select>
        </div>
        <ImageUploadField value={form.image} onChange={(url) => set('image', url)} />
        <div className="field">
          <label>Описание (EN)</label>
          <textarea required value={form.description.en} onChange={(e) => setLocalized('description', 'en', e.target.value)} />
        </div>
        <div className="field">
          <label>Описание (RU)</label>
          <textarea required value={form.description.ru} onChange={(e) => setLocalized('description', 'ru', e.target.value)} />
        </div>
        <div className="field">
          <label>Описание (HY) — необязательно, пока пусто → покажет EN</label>
          <textarea value={form.description.hy} onChange={(e) => setLocalized('description', 'hy', e.target.value)} />
        </div>
        <div className="field">
          <label>Ноты (EN)</label>
          <input type="text" placeholder="Oud · Rosewood · Amber" required value={form.notes.en} onChange={(e) => setLocalized('notes', 'en', e.target.value)} />
        </div>
        <div className="field">
          <label>Ноты (RU)</label>
          <input type="text" placeholder="Уд · Розовое дерево · Амбра" required value={form.notes.ru} onChange={(e) => setLocalized('notes', 'ru', e.target.value)} />
        </div>
        <div className="field">
          <label>Ноты (HY) — необязательно</label>
          <input type="text" value={form.notes.hy} onChange={(e) => setLocalized('notes', 'hy', e.target.value)} />
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

export default function ProductsTab({
  products,
  labels,
  onChange,
  askConfirm,
}: {
  products: Product[];
  labels: Labels;
  onChange: (products: Product[]) => void;
  askConfirm: (request: ConfirmRequest) => void;
}) {
  const [editing, setEditing] = useState<ProductForm | null>(null);

  const save = (form: ProductForm) => {
    const trim = (s: string | undefined) => (s || '').trim();
    const product: Product = {
      id: form.id ?? nextId(products),
      brand: trim(form.brand),
      name: trim(form.name),
      price: +form.price,
      size: trim(form.size),
      country: trim(form.country),
      availability: form.availability,
      category: trim(form.category),
      image: trim(form.image),
      description: { en: trim(form.description.en), ru: trim(form.description.ru), hy: trim(form.description.hy) },
      notes: { en: trim(form.notes.en), ru: trim(form.notes.ru), hy: trim(form.notes.hy) },
    };
    onChange(form.id ? products.map((p) => (p.id === product.id ? product : p)) : [...products, product]);
    setEditing(null);
  };

  const remove = (product: Product) =>
    askConfirm({
      text: `Удалить «${product.brand} ${product.name}»? (Удаление применится после публикации.)`,
      onConfirm: () => onChange(products.filter((p) => p.id !== product.id)),
    });

  return (
    <section className="admin-tab-panel">
      <div className="panel-header">
        <h2>
          Товары <span className="count-badge">({products.length})</span>
        </h2>
        <button className="btn-primary" onClick={() => setEditing(EMPTY_FORM)}>
          + Добавить товар
        </button>
      </div>
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>Бренд / Название</th>
              <th>Цена</th>
              <th>Объём</th>
              <th>Страна</th>
              <th>Категория</th>
              <th>Наличие</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img className="table-thumb" src={p.image} alt="" />
                </td>
                <td>
                  <div className="table-product-brand">{p.brand}</div>
                  <div className="table-product-name">{p.name}</div>
                </td>
                <td>{(+p.price).toLocaleString('ru-RU')} ֏</td>
                <td>{p.size}</td>
                <td>{p.country}</td>
                <td>{categoryLabel(labels, p.category)}</td>
                <td>
                  <span className={'status-pill ' + p.availability}>{p.availability === 'in-stock' ? 'In Stock' : 'Made to Order'}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-action-btn" onClick={() => setEditing(toForm(p))}>
                      Изменить
                    </button>
                    <button className="icon-action-btn danger" onClick={() => remove(p)}>
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProductFormModal initial={editing} labels={labels} onSave={save} onClose={() => setEditing(null)} />}
    </section>
  );
}
