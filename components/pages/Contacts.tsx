'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { ConsentCheckbox } from '@/components/cart/OrderModal';
import { MailIcon, PhoneIcon, PinIcon } from '@/components/layout/icons';
import PageBanner from './PageBanner';

// Blocks repeat submissions from this browser for 2 hours via
// localStorage — a simple abuse guard, no server-side tracking needed.
const COOLDOWN_MS = 2 * 60 * 60 * 1000;
const COOLDOWN_KEY = 'mesir_contact_last_sent';

function cooldownRemaining(): number {
  try {
    const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  } catch {
    return 0;
  }
}

function formatRemaining(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
}

const cooldownMessage = (ms: number) => `Вы уже отправляли сообщение. Попробуйте снова через ${formatRemaining(ms)}.`;

function ContactForm() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);

  // Reflect a cooldown left over from a previous visit right away.
  useEffect(() => {
    const remaining = cooldownRemaining();
    if (remaining > 0) {
      setBlocked(true);
      setError(cooldownMessage(remaining));
    }
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const remaining = cooldownRemaining();
    if (remaining > 0) {
      setBlocked(true);
      setError(cooldownMessage(remaining));
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/request/send-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Request failed');

      try {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      } catch {
        /* ignore storage errors (private browsing, etc.) */
      }
      setSent(true);
    } catch {
      setError('Что-то пошло не так. Попробуйте ещё раз позже, или напишите нам напрямую в Telegram.');
    } finally {
      setSending(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      {!sent && (
        <>
          <div className="form-row two-col">
            <div className="form-field">
              <label className="form-label" htmlFor="cf-name">
                {t('form_name_label', 'Full Name')}
              </label>
              <input className="form-input" type="text" id="cf-name" name="name" placeholder={t('form_name_placeholder', 'Jane Doe')} required {...field('name')} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-email">
                {t('form_email_label', 'Email')}
              </label>
              <input className="form-input" type="email" id="cf-email" name="email" placeholder={t('form_email_placeholder', 'jane@example.com')} required {...field('email')} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cf-subject">
              {t('form_subject_label', 'Subject')}
            </label>
            <input
              className="form-input"
              type="text"
              id="cf-subject"
              name="subject"
              placeholder={t('form_subject_placeholder', 'Order inquiry, private consultation...')}
              {...field('subject')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="cf-message">
              {t('form_message_label', 'Message')}
            </label>
            <textarea
              className="form-textarea"
              id="cf-message"
              name="message"
              placeholder={t('form_message_placeholder', 'Tell us how we can help...')}
              required
              {...field('message')}
            />
          </div>

          <ConsentCheckbox id="cf-consent" />

          <button type="submit" className="form-submit-btn" disabled={sending || blocked}>
            {sending ? '...' : t('form_submit_btn', 'Send Message')}
          </button>
        </>
      )}
      <p className={'form-note' + (sent ? '' : ' hidden')}>
        {t('form_success_note', "Thank you — your message has been noted. We'll be in touch shortly.")}
      </p>
      <p className={'form-note-error' + (error ? '' : ' hidden')}>{error}</p>
    </form>
  );
}

function InfoItem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="contact-info-item">
      <div className="contact-info-icon">{icon}</div>
      <div>
        <p className="contact-info-title">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default function Contacts() {
  const { t } = useI18n();
  const html = (key: string, fallback: string) => ({ __html: t(key, fallback) });

  return (
    <>
      <PageBanner
        eyebrow={['contact_eyebrow', 'Get In Touch']}
        title={['contact_title', 'Contact Us']}
        subtitle={['contact_subtitle', 'Questions about an order, a fragrance, or a private consultation — our atelier is happy to help.']}
      />

      <section className="page-content">
        <div className="contact-grid">
          <address className="contact-info-list">
            <InfoItem icon={<MailIcon size={16} />} title={t('contact_email_title', 'Email')}>
              <p className="contact-info-text" dangerouslySetInnerHTML={html('contact_email_text', 'hello@mesirfragrance.com<br>We reply within one business day.')} />
            </InfoItem>
            <InfoItem icon={<PhoneIcon size={16} />} title={t('contact_phone_title', 'Phone')}>
              <p className="contact-info-text" dangerouslySetInnerHTML={html('contact_phone_text', '+1 (800) 637-4700<br>Mon – Fri, 9:00 – 18:00 CET')} />
            </InfoItem>
            <InfoItem icon={<PinIcon size={16} />} title={t('contact_atelier_title', 'Atelier')}>
              <p className="contact-info-text" dangerouslySetInnerHTML={html('contact_atelier_text', '14 Rue du Faubourg Saint-Honoré<br>Paris, France 75008')} />
            </InfoItem>
            <InfoItem
              icon={
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              title={t('contact_hours_title', 'Hours')}
            >
              <p className="contact-info-text">{t('contact_hours_text', 'By appointment, Tuesday – Saturday')}</p>
            </InfoItem>
          </address>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
