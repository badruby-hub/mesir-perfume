'use client';

import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { BagIcon, CloseIcon } from '@/components/layout/icons';
import { formatAMD } from '@/lib/format';
import QtyStepper from './QtyStepper';
import SidePanel from './SidePanel';

export default function CartPanel() {
  const { t } = useI18n();
  const { cart, cartTotal, updateCartQuantity, removeFromCart, openPanel, setOpenPanel } = useShop();
  const close = () => setOpenPanel(null);

  return (
    <SidePanel open={openPanel === 'cart'} onClose={close} title={t('cart_title', 'Your Cart')} closeLabel="Close cart">
      <ul className="cart-items">
        {cart.length === 0 ? (
          <li className="cart-empty">
            <BagIcon size={32} stroke="rgba(226,157,48,0.3)" strokeWidth={1} />
            <p className="cart-empty-text">{t('cart_empty', 'Your cart is empty')}</p>
          </li>
        ) : (
          cart.map((item, index) => (
            <li key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div className="cart-item-details">
                <p className="cart-item-brand">{item.brand}</p>
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-size">{item.size}</p>
                <div className="cart-item-bottom-row">
                  <QtyStepper
                    value={item.quantity}
                    onMinus={() => updateCartQuantity(index, item.quantity - 1)}
                    onPlus={() => updateCartQuantity(index, item.quantity + 1)}
                  />
                  <p className="cart-item-price">{formatAMD(item.price * item.quantity)}</p>
                </div>
              </div>
              <button className="cart-remove-btn" aria-label={t('fav_remove', 'Remove')} onClick={() => removeFromCart(index)}>
                <CloseIcon size={14} />
              </button>
            </li>
          ))
        )}
      </ul>

      <div className={'cart-footer' + (cart.length === 0 ? ' hidden' : '')}>
        <div className="cart-total-row">
          <span>{t('cart_total', 'Total')}</span>
          <span>{formatAMD(cartTotal)}</span>
        </div>
        <button className="checkout-btn" onClick={() => cart.length > 0 && setOpenPanel('order')}>
          {t('checkout_btn', 'Checkout')}
        </button>
      </div>
    </SidePanel>
  );
}
