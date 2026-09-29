'use client';

import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { HEART_PATH } from '@/components/layout/icons';
import { formatAMD } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { t, lang, pick, labels } = useI18n();
  const { favorites, toggleFavorite, addToCart } = useShop();
  const [hovered, setHovered] = useState(false);
  const isFav = favorites.includes(product.id);
  const { availabilityLabels } = labels;

  const availabilityText =
    availabilityLabels[lang]?.[product.availability] || availabilityLabels.en?.[product.availability] || '';

  return (
    <article
      className={'product-card' + (hovered ? ' hovered' : '')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <div key={pos} className={'corner-ornament ' + pos}></div>
      ))}

      <div className="product-image-area">
        <img className="product-image" src={product.image} alt={product.name} />
        <div className="product-glow"></div>
        <div className={'availability-badge' + (product.availability === 'in-stock' ? ' in-stock' : '')}>{availabilityText}</div>
        <button
          className={'fav-toggle-btn' + (isFav ? ' active' : '')}
          aria-label={isFav ? t('fav_remove', 'Remove') : t('aria_favorites', 'Favorites')}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
        >
          <svg
            width="12"
            height="12"
            fill={isFav ? '#E29D30' : 'none'}
            stroke={isFav ? '#E29D30' : 'rgba(245,240,232,0.6)'}
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d={HEART_PATH} />
          </svg>
        </button>
      </div>

      <div className="product-info">
        <div>
          <p className="product-brand">{product.brand}</p>
          <h3 className="product-name">{product.name}</h3>
        </div>
        <p className="product-description">{pick(product.description)}</p>
        <p className="product-notes">{pick(product.notes)}</p>

        <div className="product-bottom-row">
          <div>
            <span className="product-price">{formatAMD(product.price)}</span>
            <span className="product-size">{product.size}</span>
          </div>
          <button
            className="add-to-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              const { id, brand, name, price, size, image } = product;
              addToCart({ id, brand, name, price, size, image });
            }}
          >
            {t('add_to_cart', 'Add to Cart')}
          </button>
        </div>
      </div>
    </article>
  );
}
