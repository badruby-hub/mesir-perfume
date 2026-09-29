'use client';

import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { useSiteData } from '@/components/providers/SiteDataProvider';
import { HeartIcon } from '@/components/layout/icons';
import { formatAMD } from '@/lib/format';
import type { Product } from '@/lib/types';
import QtyStepper from './QtyStepper';
import SidePanel from './SidePanel';

function FavoriteRow({ item }: { item: Product }) {
  const { t } = useI18n();
  const { cart, addToCart, toggleFavorite, setOpenPanel } = useShop();
  const [selectedQty, setSelectedQty] = useState(1);
  const inCart = cart.some((c) => c.id === item.id);

  const onCartButton = () => {
    if (inCart) {
      // Already in the cart — this button's job is quick navigation, not
      // adding another copy (the cart's own +/- does that).
      setOpenPanel('cart');
    } else {
      const { id, brand, name, price, size, image } = item;
      addToCart({ id, brand, name, price, size, image }, selectedQty);
    }
  };

  return (
    <li className="cart-item">
      <img src={item.image} alt={item.name} className="cart-item-img" />
      <div className="cart-item-details">
        <p className="cart-item-brand">{item.brand}</p>
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-size">{item.size}</p>
        <p className="cart-item-price">{formatAMD(item.price)}</p>
        <div className="cart-item-actions">
          <button className="fav-remove-btn" type="button" onClick={() => toggleFavorite(item.id)}>
            {t('fav_remove', 'Remove')}
          </button>
          <QtyStepper
            className={'fav-qty-stepper' + (inCart ? ' hidden' : '')}
            value={selectedQty}
            onMinus={() => setSelectedQty((q) => Math.max(1, q - 1))}
            onPlus={() => setSelectedQty((q) => q + 1)}
          />
          <button className="fav-add-cart-btn" type="button" onClick={onCartButton}>
            {inCart ? t('go_to_cart', 'Go to cart') : t('fav_add_cart', 'Add to cart')}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function FavoritesPanel() {
  const { t } = useI18n();
  const { products } = useSiteData();
  const { favorites, openPanel, setOpenPanel } = useShop();
  const close = () => setOpenPanel(null);
  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <SidePanel open={openPanel === 'favorites'} onClose={close} title={t('fav_title', 'Your Favorites')} closeLabel="Close favorites">
      <ul className="cart-items">
        {favProducts.length === 0 ? (
          <li className="cart-empty">
            <HeartIcon size={32} stroke="rgba(226,157,48,0.3)" strokeWidth={1} />
            <p className="cart-empty-text">{t('fav_empty', 'No favorites yet')}</p>
          </li>
        ) : (
          favProducts.map((item) => <FavoriteRow key={item.id} item={item} />)
        )}
      </ul>
    </SidePanel>
  );
}
