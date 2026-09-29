'use client';

// Catalog: filter sidebar (desktop) / drawer (mobile), product grid with
// pagination. The header search box also filters this grid.
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { useSiteData } from '@/components/providers/SiteDataProvider';
import SectionHeader from '@/components/layout/SectionHeader';
import Reveal, { EASE_OUT } from '@/components/motion/Reveal';
import { itemsCountLabel } from '@/lib/i18n';
import FilterSidebar, { EMPTY_FILTERS, type CatalogFilters } from './FilterSidebar';
import Pagination from './Pagination';
import ProductCard from './ProductCard';

const PRODUCTS_PER_PAGE = 9;

export default function Catalog() {
  const { t, lang } = useI18n();
  const { products } = useSiteData();
  const { searchQuery, setSearchQuery } = useShop();

  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // Any change to what's being filtered goes back to page 1.
  useEffect(() => setCurrentPage(1), [searchQuery]);

  const updateFilters = (patch: Partial<CatalogFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setCurrentPage(1);
  };

  const toggleInList = (key: 'brands' | 'sizes' | 'countries' | 'categories', value: string) => {
    const list = filters[key];
    updateFilters({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const query = searchQuery.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const f = filters;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.sizes.length && !f.sizes.includes(p.size)) return false;
    if (f.countries.length && !f.countries.includes(p.country)) return false;
    if (f.categories.length && !f.categories.includes(p.category || '')) return false;
    if (p.price < f.priceRange[0] || p.price > f.priceRange[1]) return false;
    if (f.availability !== 'all' && p.availability !== f.availability) return false;
    if (query && !`${p.brand} ${p.name}`.toLowerCase().includes(query)) return false;
    return true;
  });

  // If a filter change shrank the results below the current page, show
  // the last valid page instead of an empty grid.
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(currentPage, 1), totalPages);
  const pageItems = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const goToPage = (p: number) => {
    setCurrentPage(p);
    // Jump back to the top of the catalog so the new page is visible.
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sidebarProps = {
    filters,
    onToggle: toggleInList,
    onChange: updateFilters,
    onClear: clearFilters,
    categoryOpen,
    onCategoryOpenChange: setCategoryOpen,
  };
  const countLabel = itemsCountLabel(filtered.length, lang);

  return (
    <section id="catalog">
      <SectionHeader
        eyebrow={t('catalog_eyebrow', 'Collection')}
        title={t('catalog_title', 'The Catalog')}
        subtitle={t('catalog_subtitle', "Curated fragrances from the world's finest houses")}
      />

      <Reveal className="catalog-container">
        <div className="mobile-filter-bar">
          <button className="filter-toggle-btn" onClick={() => setMobileFiltersOpen((o) => !o)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            <span>{t('filters_btn', 'Filters')}</span>
          </button>
          <span className="item-count-label">{countLabel}</span>
        </div>

        <div className={'mobile-filter-drawer' + (mobileFiltersOpen ? '' : ' hidden')}>
          <div className="sidebar-content">
            <FilterSidebar {...sidebarProps} />
          </div>
        </div>

        <div className="catalog-body">
          <aside className="desktop-sidebar">
            <div className="sidebar-sticky">
              <div className="sidebar-content">
                <FilterSidebar {...sidebarProps} />
              </div>
            </div>
          </aside>

          <div className="catalog-main">
            <div className="desktop-item-count-row">
              <span className="item-count-label">{countLabel}</span>
            </div>

            <div className="catalog-results-area">
              {/* Cards rise in one after another when they first scroll into
                  view or appear after a filter/page change, fade out when
                  filtered away, and the rest glide to their new grid spot.
                  Cards that stay on screen keep their element, so a favorite
                  toggle or language switch doesn't replay anything. */}
              <ul className={'product-grid' + (filtered.length === 0 ? ' hidden' : '')} aria-label="Product list" style={{ position: 'relative' }}>
                <AnimatePresence mode="popLayout">
                  {pageItems.map((p, i) => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 28, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                      viewport={{ once: true, margin: '0px 0px -5% 0px' }}
                      transition={{
                        duration: 0.6,
                        ease: EASE_OUT,
                        delay: Math.min(i % 3, 2) * 0.08,
                        layout: { duration: 0.45, ease: EASE_OUT },
                      }}
                    >
                      <ProductCard product={p} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <div className={'no-results' + (filtered.length === 0 ? '' : ' hidden')}>
                <p className="no-results-text">{t('no_results_title', 'No fragrances found')}</p>
                <button className="no-results-clear-btn" onClick={clearFilters}>
                  {t('no_results_clear', 'Clear filters')}
                </button>
              </div>
            </div>

            <Pagination current={page} total={totalPages} onChange={goToPage} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
