'use client';

// Filter sidebar. Rendered twice by the catalog (desktop sidebar and
// mobile drawer); both copies read and write the same filter state.
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
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

// Filter groups that fold behind a clickable header (accordion).
export type CollapsibleSection = ListKey;

interface Props {
  filters: CatalogFilters;
  onToggle: (key: ListKey, value: string) => void;
  onChange: (patch: Partial<CatalogFilters>) => void;
  onClear: () => void;
  // Which accordion sections are open. Kept by the catalog, so it is
  // shared by the desktop and mobile copies of the sidebar.
  openSections: Partial<Record<CollapsibleSection, boolean>>;
  onSectionToggle: (section: CollapsibleSection) => void;
}

// A filter group that collapses behind its header. The header shows how
// many options are selected, so a closed group never hides active filters.
function Collapsible({
  title,
  open,
  selectedCount,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  selectedCount: number;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className={'filter-section filter-section-collapsible' + (open ? ' open' : '')}>
      <button type="button" className="filter-section-title filter-section-toggle" aria-expanded={open} onClick={onToggle}>
        <span>
          {title}
          {selectedCount > 0 && <span className="filter-section-count">{selectedCount}</span>}
        </span>
        <CaretDownIcon className="filter-caret" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="filter-section-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxItems({
  items,
  selected,
  onToggle,
  labelFn,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  labelFn?: (item: string) => string;
}) {
  return (
    <div className="filter-section-items">
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

export default function FilterSidebar({ filters, onToggle, onChange, onClear, openSections, onSectionToggle }: Props) {
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

  const section = (id: CollapsibleSection) => ({
    open: !!openSections[id],
    selectedCount: filters[id].length,
    onToggle: () => onSectionToggle(id),
  });

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
        <Collapsible title={t('filter_category', 'Category')} {...section('categories')}>
          <CheckboxItems
            items={categoriesInUse}
            selected={filters.categories}
            onToggle={(c) => onToggle('categories', c)}
            labelFn={categoryLabel}
          />
        </Collapsible>
      )}

      <Collapsible title={t('filter_brand', 'Brand')} {...section('brands')}>
        <CheckboxItems items={lists.brands} selected={filters.brands} onToggle={(b) => onToggle('brands', b)} />
      </Collapsible>

      <Collapsible title={t('filter_size', 'Size')} {...section('sizes')}>
        <div className="size-pill-row">
          {lists.sizes.map((s) => (
            <button key={s} className={'size-pill' + (filters.sizes.includes(s) ? ' active' : '')} onClick={() => onToggle('sizes', s)}>
              {s}
            </button>
          ))}
        </div>
      </Collapsible>

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

      <Collapsible title={t('filter_country', 'Country')} {...section('countries')}>
        <CheckboxItems
          items={lists.countries}
          selected={filters.countries}
          onToggle={(c) => onToggle('countries', c)}
          labelFn={(c) => countryLabels[lang]?.[c] || c}
        />
      </Collapsible>

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
