'use client';

// Filter sidebar. Rendered twice by the catalog (desktop sidebar and
// mobile drawer); both copies read and write the same filter state.
import { useI18n } from '@/components/providers/I18nProvider';
import { useSiteData } from '@/components/providers/SiteDataProvider';
import { CaretDownIcon, CheckIcon } from '@/components/layout/icons';
import { formatAMD } from '@/lib/format';
import type { Availability } from '@/lib/types';

export const PRICE_MIN = 15000;
export const PRICE_MAX = 200000;
const PRICE_STEP = 5000;

export interface CatalogFilters {
  brands: string[];
  sizes: string[];
  countries: string[];
  categories: string[];
  priceRange: [number, number];
  availability: 'all' | Availability;
}

export const EMPTY_FILTERS: CatalogFilters = {
  brands: [],
  sizes: [],
  countries: [],
  categories: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  availability: 'all',
};

type ListKey = 'brands' | 'sizes' | 'countries' | 'categories';

interface Props {
  filters: CatalogFilters;
  onToggle: (key: ListKey, value: string) => void;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onClear: () => void;
  categoryOpen: boolean;
  onCategoryOpenChange: (open: boolean) => void;
}

function CheckboxItems({
  items,
  selected,
  onToggle,
  labelFn,
  hidden = false,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  labelFn?: (item: string) => string;
  hidden?: boolean;
}) {
  return (
    <div className={'filter-section-items' + (hidden ? ' hidden' : '')}>
      {items.map((item) => {
        const checked = selected.includes(item);
        return (
          <label key={item} className="checkbox-row" onClick={() => onToggle(item)}>
            <div className={'checkbox-box' + (checked ? ' checked' : '')}>{checked && <CheckIcon />}</div>
            <span className={'checkbox-label' + (checked ? ' checked' : '')}>{labelFn ? labelFn(item) : item}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function FilterSidebar({ filters, onToggle, onChange, onClear, categoryOpen, onCategoryOpenChange }: Props) {
  const { t, lang, labels } = useI18n();
  const { products, filters: lists } = useSiteData();
  const { countryLabels, availabilityLabels, categoryLabels } = labels;

  // Each product stores a stable category KEY; its displayed name per
  // language lives in categoryLabels (admin "Категории" tab).
  const categoriesInUse = [...new Set(products.map((p) => p.category).filter((c): c is string => !!c))].sort();

  // Current language first, then whichever other language has text filled
  // in, so a category typed only in Russian doesn't show its raw key.
  const categoryLabel = (c: string) => {
    const byLang = categoryLabels[lang]?.[c];
    if (byLang) return byLang;
    for (const l of ['ru', 'en', 'hy'] as const) {
      if (categoryLabels[l]?.[c]) return categoryLabels[l]![c];
    }
    return c;
  };

  const [min, max] = filters.priceRange;
  const leftPct = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const rightPct = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const availabilityOptions = [
    { key: 'all' as const, label: t('avail_all', 'All') },
    { key: 'in-stock' as const, label: t('avail_in_stock', availabilityLabels.en?.['in-stock'] || 'In Stock') },
    { key: 'made-to-order' as const, label: t('avail_made_to_order', availabilityLabels.en?.['made-to-order'] || 'Made to Order') },
  ];

  return (
    <>
      <div className="sidebar-title-block">
        <h2>{t('filters_title', 'Filters')}</h2>
        <div className="sidebar-title-underline"></div>
      </div>

      {categoriesInUse.length > 0 && (
        <div className={'filter-section filter-section-collapsible' + (categoryOpen ? ' open' : '')}>
          <button type="button" className="filter-section-title filter-section-toggle" onClick={() => onCategoryOpenChange(!categoryOpen)}>
            <span>{t('filter_category', 'Category')}</span>
            <CaretDownIcon className="filter-caret" />
          </button>
          <CheckboxItems
            items={categoriesInUse}
            selected={filters.categories}
            onToggle={(c) => onToggle('categories', c)}
            labelFn={categoryLabel}
            hidden={!categoryOpen}
          />
        </div>
      )}

      <div className="filter-section">
        <h3 className="filter-section-title">{t('filter_brand', 'Brand')}</h3>
        <CheckboxItems items={lists.brands} selected={filters.brands} onToggle={(b) => onToggle('brands', b)} />
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t('filter_size', 'Size')}</h3>
        <div className="size-pill-row">
          {lists.sizes.map((s) => (
            <button key={s} className={'size-pill' + (filters.sizes.includes(s) ? ' active' : '')} onClick={() => onToggle('sizes', s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t('filter_price', 'Price')}</h3>
        <div className="price-range-values">
          <span className="price-label-min">{formatAMD(min)}</span>
          <span className="price-label-max">{formatAMD(max)}</span>
        </div>
        <div className="price-slider-track-wrap">
          <div className="price-slider-track-bg"></div>
          <div className="price-slider-track-fill" style={{ left: leftPct + '%', width: rightPct - leftPct + '%' }}></div>
        </div>
        <div className="price-range-inputs">
          <input
            type="range"
            className="price-min-input"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={min}
            onChange={(e) => onChange({ priceRange: [Math.min(+e.target.value, max - PRICE_STEP), max] })}
          />
          <input
            type="range"
            className="price-max-input"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={max}
            onChange={(e) => onChange({ priceRange: [min, Math.max(+e.target.value, min + PRICE_STEP)] })}
          />
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t('filter_country', 'Country')}</h3>
        <CheckboxItems
          items={lists.countries}
          selected={filters.countries}
          onToggle={(c) => onToggle('countries', c)}
          labelFn={(c) => countryLabels[lang]?.[c] || c}
        />
      </div>

      <div className="filter-section">
        <h3 className="filter-section-title">{t('filter_availability', 'Availability')}</h3>
        <div className="filter-section-items">
          {availabilityOptions.map((opt) => {
            const active = filters.availability === opt.key;
            return (
              <label key={opt.key} className="radio-row" onClick={() => onChange({ availability: opt.key })}>
                <div className={'radio-dot' + (active ? ' active' : '')}></div>
                <span className={'radio-label' + (active ? ' active' : '')}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button className="clear-filters-btn" onClick={onClear}>
        {t('clear_filters', 'Clear filters')}
      </button>
    </>
  );
}
