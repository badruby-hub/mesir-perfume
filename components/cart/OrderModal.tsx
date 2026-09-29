'use client';

// "Send Request" form shown instead of online payment: the order and the
// buyer's contacts go to the seller's Telegram via /api/request/send-order.
import { useEffect, useState, type FormEvent } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { formatAMD } from '@/lib/format';
import QtyStepper from './QtyStepper';
import SidePanel from './SidePanel';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function OrderModal() {
  const { t } = useI18n();
  const { cart, cartTotal, updateCartQuantity, clearCart, openPanel, setOpenPanel } = useShop();
  const isOpen = openPanel === 'order';
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', telegram: '', phone: '' });

  // Every fresh opening starts with the form visible and no notes.
  useEffect(() => {
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  // Removing the last item from the summary closes the modal — unless
  // the cart is empty because the request was just sent.
  useEffect(() => {
    if (isOpen && cart.length === 0 && status !== 'success') setOpenPanel(null);
  }, [isOpen, cart.length, status, setOpenPanel]);

  const close = () => setOpenPanel(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/request/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          telegram: form.telegram.trim(),
          phone: form.phone.trim(),
          items: cart,
          total: cartTotal,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      clearCart();
    } catch {
      setStatus('error');
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <SidePanel open={isOpen} onClose={close} title={t('order_modal_title', 'Send Request')} closeLabel="Close">
      <form className={'order-form' + (status === 'success' ? ' hidden' : '')} onSubmit={onSubmit}>
        <div className="order-summary">
          {cart.map((item, index) => (
            <div key={item.id} className="order-summary-item">
              <span className="order-summary-item-name">
                {item.brand} {item.name} ({item.size})
              </span>
              <QtyStepper
                className="order-qty-stepper"
                value={item.quantity}
                onMinus={() => updateCartQuantity(index, item.quantity - 1)}
                onPlus={() => updateCartQuantity(index, item.quantity + 1)}
              />
              <span className="order-summary-item-price">{formatAMD(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="order-summary-total">
            <span>{t('cart_total', 'Total')}</span>
            <span>{formatAMD(cartTotal)}</span>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="order-name">
            {t('order_name_label', 'Full Name')}
          </label>
          <input className="form-input" type="text" id="order-name" name="name" placeholder={t('order_name_placeholder', 'Jane Doe')} required {...field('name')} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="order-telegram">
            {t('order_telegram_label', 'Telegram')}
          </label>
          <input className="form-input" type="text" id="order-telegram" name="telegram" placeholder={t('order_telegram_placeholder', '@username')} required {...field('telegram')} />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="order-phone">
            {t('order_phone_label', 'Phone')}
          </label>
          <input className="form-input" type="tel" id="order-phone" name="phone" placeholder={t('order_phone_placeholder', '+1 234 567 8900')} required {...field('phone')} />
        </div>

        <ConsentCheckbox id="order-consent" />

        <button type="submit" className="form-submit-btn" disabled={status === 'sending'}>
          {status === 'sending' ? t('order_submitting_btn', 'Sending...') : t('order_submit_btn', 'Submit Request')}
        </button>
      </form>
      <p className={'form-note' + (status === 'success' ? '' : ' hidden')}>
        {t('order_success_note', "Thank you! We've received your request and will contact you on Telegram or by phone shortly.")}
      </p>
      <p className={'form-note-error' + (status === 'error' ? '' : ' hidden')}>
        {t('order_error_note', 'Something went wrong. Please try again, or message us directly on Telegram.')}
      </p>
    </SidePanel>
  );
}

// Consent text comes from the admin as HTML (it contains a link to the
// Privacy Policy), same as on the old static site.
export function ConsentCheckbox({ id }: { id: string }) {
  const { t } = useI18n();
  return (
    <label className="form-consent-row">
      <input type="checkbox" id={id} required />
      <span
        dangerouslySetInnerHTML={{
          __html: t(
            'order_consent_text',
            'I agree to the processing of my personal data as described in the <a href="/privacy" target="_blank">Privacy Policy</a>.'
          ),
        }}
      />
    </label>
  );
}
