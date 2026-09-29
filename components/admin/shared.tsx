'use client';

// Building blocks shared by the admin tabs: modal shell, confirm dialog,
// photo upload field and the calls to /api/admin/*.
import { useState, type ReactNode } from 'react';

export type DirtyKey = 'products' | 'slides' | 'i18n' | 'labels';

export function Modal({
  title,
  onClose,
  small = false,
  children,
}: {
  title: string;
  onClose: () => void;
  small?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className={'modal-panel' + (small ? ' modal-panel-small' : '')}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" type="button" onClick={onClose}>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface ConfirmRequest {
  text: string;
  onConfirm: () => void;
}

export function ConfirmModal({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  if (!request) return null;
  return (
    <Modal title="Удалить?" onClose={onClose} small>
      <p className="confirm-text">{request.text}</p>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>
          Отмена
        </button>
        <button
          className="btn-danger"
          onClick={() => {
            onClose();
            request.onConfirm();
          }}
        >
          Удалить
        </button>
      </div>
    </Modal>
  );
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // reader.result is "data:image/jpeg;base64,AAAA..." — strip the prefix.
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Uploads are the one exception to "nothing happens until Publish": the
// file goes to Supabase Storage immediately so the preview works right
// away. It stays an unused file until a published product/slide uses it.
export function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [status, setStatus] = useState<{ text: string; kind: '' | 'uploading' | 'success' | 'error' }>({ text: '', kind: '' });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus({ text: 'Загрузка...', kind: 'uploading' });
    try {
      const contentBase64 = await readFileAsBase64(file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentBase64 }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || body.error || 'Upload failed');
      onChange(body.path);
      setStatus({ text: `Загружено: ${body.path}`, kind: 'success' });
    } catch (err) {
      setStatus({ text: `Ошибка загрузки: ${(err as Error).message}`, kind: 'error' });
    }
  };

  return (
    <>
      <div className="field">
        <label>Фото с компьютера</label>
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        <p className={('upload-status ' + status.kind).trim()}>{status.text}</p>
      </div>
      <div className="field">
        <label>Ссылка на изображение (заполнится сама после загрузки, или вставь свою)</label>
        <input type="text" placeholder="https://... или /assets/uploads/..." required value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </>
  );
}

export async function saveType(type: DirtyKey, data: unknown): Promise<void> {
  const res = await fetch('/api/admin/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.detail || body.error || 'Save failed');
}

export function nextId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}
