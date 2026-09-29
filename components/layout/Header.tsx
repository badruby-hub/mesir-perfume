'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { BagIcon, CaretDownIcon, HeartIcon, SearchIcon } from './icons';
import type { Lang } from '@/lib/types';

const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN — English' },
  { code: 'ru', label: 'RU — Русский' },
  { code: 'hy', label: 'HY — Հայերեն' },
];

function LanguageDropdown() {
  const { lang, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className={'lang-dropdown' + (open ? ' open' : '')} ref={ref}>
      <button
        className="lang-dropdown-toggle"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="lang-current">{lang.toUpperCase()}</span>
        <CaretDownIcon className="lang-caret" />
      </button>
      <div className={'lang-dropdown-menu' + (open ? '' : ' hidden')}>
        {LANG_OPTIONS.map((opt) => (
          <button
            key={opt.code}
            className={'lang-btn' + (opt.code === lang ? ' active' : '')}
            type="button"
            onClick={() => {
              setLanguage(opt.code);
              setOpen(false);
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const { t } = useI18n();
  const { cart, favorites, searchQuery, setSearchQuery, setOpenPanel } = useShop();
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Search filters the catalog on the home page; on other pages Enter
  // jumps back to the catalog.
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const catalog = document.getElementById('catalog');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
    else router.push('/#catalog');
  };

  const cartQty = cart.reduce((s, p) => s + p.quantity, 0);
  const catalogHref = isHome ? '#catalog' : '/#catalog';
  const navLinks = [
    { href: catalogHref, key: 'nav_catalog', label: 'Catalog' },
    { href: '/about', key: 'nav_about', label: 'About' },
    { href: '/contacts', key: 'nav_contact', label: 'Contact' },
  ];

  return (
    <header id="site-header" className={scrolled ? 'scrolled' : undefined}>
      <div className="gold-topline"></div>
      <div className="header-inner">
        <Link href="/" className="logo-link">
          <img src="/assets/logo.png" alt="MESIR Perfume & Home Fragrance" className="logo-img" />
          {isHome && <h1 className="visually-hidden">MESIR — Niche Perfume &amp; Home Fragrance</h1>}
        </Link>

        <nav className="main-nav">
          {navLinks.map((l) => (
            <Link key={l.key} href={l.href} className="nav-link">
              {t(l.key, l.label)}
            </Link>
          ))}
        </nav>

        <div className="header-icons">
          <LanguageDropdown />

          <button
            className={'icon-btn' + (searchOpen ? ' active' : '')}
            aria-label={t('aria_search', 'Search')}
            onClick={() => setSearchOpen((o) => !o)}
          >
            <SearchIcon />
          </button>

          <button className="icon-btn" aria-label={t('aria_favorites', 'Favorites')} onClick={() => setOpenPanel('favorites')}>
            <HeartIcon />
            <span className={'badge' + (favorites.length === 0 ? ' hidden' : '')}>{favorites.length}</span>
          </button>

          <button className="icon-btn" aria-label={t('aria_cart', 'Cart')} onClick={() => setOpenPanel('cart')}>
            <BagIcon />
            <span className={'badge' + (cartQty === 0 ? ' hidden' : '')}>{cartQty}</span>
          </button>

          <button className="icon-btn mobile-only" aria-label={t('aria_menu', 'Menu')} onClick={() => setMenuOpen((o) => !o)}>
            {menuOpen ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={'search-bar' + (searchOpen ? '' : ' hidden')}>
        <div className="search-inner">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={t('search_placeholder', 'Search perfumes, brands...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
          />
          <SearchIcon size={16} stroke="#E29D30" className="search-icon" />
        </div>
      </div>

      <nav className={'mobile-menu' + (menuOpen ? '' : ' hidden')}>
        {navLinks.map((l) => (
          <Link key={l.key} href={l.href} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            {t(l.key, l.label)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
