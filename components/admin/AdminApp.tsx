'use client';

// Admin panel. All data is loaded fresh from Supabase (via
// /api/admin/data) on login and kept in memory. Adding, editing and
// deleting only change this copy and mark the section "dirty" — nothing
// is saved until "Опубликовать" in the header saves every dirty section.
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import ImageFallback from '@/components/layout/ImageFallback';
import type { SiteData } from '@/lib/types';
import CategoriesTab from './CategoriesTab';
import ProductsTab from './ProductsTab';
import SlidesTab from './SlidesTab';
import TextsTab from './TextsTab';
import { ConfirmModal, saveType, type ConfirmRequest, type DirtyKey } from './shared';

type Tab = 'products' | 'slides' | 'categories' | 'texts';
type StatusKind = 'loading' | 'success' | 'error';

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Товары' },
  { id: 'slides', label: 'Hero-слайды' },
  { id: 'categories', label: 'Категории' },
  { id: 'texts', label: 'Тексты сайта' },
];

const CLEAN: Record<DirtyKey, boolean> = { products: false, slides: false, i18n: false, labels: false };

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Неверный пароль');
        return;
      }
      onLogin();
    } catch {
      setError('Ошибка соединения. Попробуйте снова.');
    }
  };

  return (
    <div className="login-screen">
      <form className="login-form" onSubmit={onSubmit}>
        <h1 className="login-title">MESIR Admin</h1>
        <input
          type="password"
          className="login-input"
          placeholder="Пароль"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-btn">
          Войти
        </button>
        <p className={'login-error' + (error ? '' : ' hidden')}>{error}</p>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<SiteData | null>(null);
  const [dirty, setDirty] = useState(CLEAN);
  const [tab, setTab] = useState<Tab>('products');
  const [status, setStatus] = useState<{ message: string; kind: StatusKind } | null>(null);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anyDirty = Object.values(dirty).some(Boolean);

  const showStatus = useCallback((message: string, kind: StatusKind) => {
    if (statusTimer.current) clearTimeout(statusTimer.current);
    setStatus({ message, kind });
    if (kind !== 'loading') statusTimer.current = setTimeout(() => setStatus(null), 4000);
  }, []);

  const loadAllData = useCallback(async () => {
    showStatus('Загрузка данных из Supabase...', 'loading');
    try {
      const res = await fetch('/api/admin/data');
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
      setDirty(CLEAN);
      setStatus(null);
    } catch {
      showStatus('Не удалось загрузить данные из Supabase. Проверьте настройки SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY.', 'error');
    }
  }, [showStatus]);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((body) => setAuthed(!!body.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) loadAllData();
  }, [authed, loadAllData]);

  // Warn before leaving the page with unpublished changes.
  useEffect(() => {
    if (!anyDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [anyDirty]);

  const update = <K extends DirtyKey>(key: K, value: SiteData[K]) => {
    setData((d) => (d ? { ...d, [key]: value } : d));
    setDirty((d) => ({ ...d, [key]: true }));
  };

  const publish = async () => {
    if (!data) return;
    const toPublish = (Object.keys(dirty) as DirtyKey[]).filter((k) => dirty[k]);
    if (toPublish.length === 0) {
      showStatus('Нет несохранённых изменений.', 'success');
      return;
    }

    showStatus(`Публикация (${toPublish.length})...`, 'loading');
    try {
      for (const type of toPublish) {
        await saveType(type, data[type]);
        setDirty((d) => ({ ...d, [type]: false }));
      }
      showStatus('Опубликовано — изменения уже на сайте.', 'success');
    } catch (err) {
      showStatus(
        `Ошибка публикации: ${(err as Error).message}. Уже сохранённые разделы отмечены, остальное можно опубликовать повторно.`,
        'error'
      );
    }
  };

  const logout = async () => {
    if (anyDirty && !confirm('Есть неопубликованные изменения — они будут потеряны. Выйти всё равно?')) return;
    // Clear the flag first so the beforeunload warning doesn't fire too.
    setDirty(CLEAN);
    await fetch('/api/admin/logout', { method: 'POST' });
    location.href = '/';
  };

  if (authed === null) return null;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <>
      <ImageFallback />
      <div className="admin-app">
        <header className="admin-header">
          <h1 className="admin-logo">
            MESIR <span>Admin</span>
          </h1>
          <nav className="admin-tabs">
            {TABS.map((t) => (
              <button key={t.id} className={'admin-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <span className={'dirty-indicator' + (anyDirty ? '' : ' hidden')}>● Есть несохранённые изменения</span>
            <button className="btn-primary" onClick={publish}>
              Опубликовать
            </button>
            <button className="logout-btn" onClick={logout}>
              Выйти
            </button>
          </div>
        </header>

        <main className="admin-main">
          {status && <div className={'global-status ' + status.kind}>{status.message}</div>}

          {data && tab === 'products' && (
            <ProductsTab products={data.products} labels={data.labels} onChange={(v) => update('products', v)} askConfirm={setConfirmRequest} />
          )}
          {data && tab === 'slides' && <SlidesTab slides={data.slides} onChange={(v) => update('slides', v)} askConfirm={setConfirmRequest} />}
          {data && tab === 'categories' && (
            <CategoriesTab labels={data.labels} onChange={(v) => update('labels', v)} askConfirm={setConfirmRequest} />
          )}
          {data && tab === 'texts' && <TextsTab i18n={data.i18n} onChange={(v) => update('i18n', v)} />}
        </main>
      </div>

      <ConfirmModal request={confirmRequest} onClose={() => setConfirmRequest(null)} />
    </>
  );
}
