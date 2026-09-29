'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';
import Reveal from '@/components/motion/Reveal';
import { MailIcon, PhoneIcon, PinIcon } from './icons';

const CONTACT_ICON_STROKE = 'rgba(226,157,48,0.6)';

export default function Footer() {
  const { t } = useI18n();
  const isHome = usePathname() === '/';

  return (
    <footer id="site-footer">
      <div className="gold-topline-shimmer"></div>

      <div className="footer-ornament-row">
        <div className="ornament-line-short-wide"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line-tiny"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line-tiny"></div>
        <div className="ornament-diamond"></div>
        <div className="ornament-line-short-wide reverse"></div>
      </div>

      <div className="footer-container">
        <div className="footer-grid">
          <Reveal className="footer-brand-col">
            <img src="/assets/logo.png" alt="MESIR" className="footer-logo" />
            <p className="footer-brand-text">
              {t(
                'footer_brand_text',
                'A curated house of exceptional perfumery and home fragrance, bridging the worlds of European luxury and Eastern heritage.'
              )}
            </p>
            <div className="social-row">
              <a href="#" className="social-btn" aria-label="Instagram">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="social-btn" aria-label="Facebook">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="social-btn" aria-label="Twitter">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
            </div>
          </Reveal>

          <Reveal className="footer-col" delay={0.12}>
            <h4 className="footer-col-title">{t('footer_nav_title', 'Navigation')}</h4>
            <div className="footer-col-underline"></div>
            <ul className="footer-link-list">
              <li>
                <Link href={isHome ? '#catalog' : '/#catalog'} className="footer-link">
                  {t('nav_catalog', 'Catalog')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="footer-link">
                  {t('nav_about', 'About')}
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="footer-link">
                  {t('nav_contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </Reveal>

          <Reveal className="footer-col" delay={0.24}>
            <h4 className="footer-col-title">{t('footer_customer_title', 'Customer')}</h4>
            <div className="footer-col-underline"></div>
            <ul className="footer-link-list">
              <li>
                <a href="#" className="footer-link">
                  {t('footer_shipping', 'Shipping')}
                </a>
              </li>
              <li>
                <Link href="/returns" className="footer-link">
                  {t('footer_returns', 'Returns & Exchanges')}
                </Link>
              </li>
              <li>
                <a href="#" className="footer-link">
                  {t('footer_faq', 'FAQ')}
                </a>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">
                  {t('footer_privacy', 'Privacy Policy')}
                </Link>
              </li>
            </ul>
          </Reveal>

          <Reveal className="footer-col" delay={0.36}>
            <h4 className="footer-col-title">{t('footer_contact_title', 'Contact')}</h4>
            <div className="footer-col-underline"></div>
            <address className="footer-contact-address">
              <ul className="footer-contact-list">
                <li className="footer-contact-item">
                  <MailIcon size={12} stroke={CONTACT_ICON_STROKE} />
                  <a href="mailto:hello@mesirfragrance.com">hello@mesirfragrance.com</a>
                </li>
                <li className="footer-contact-item">
                  <PhoneIcon size={12} stroke={CONTACT_ICON_STROKE} />
                  <a href="tel:+18006374700">+1 (800) 637-4700</a>
                </li>
                <li className="footer-contact-item">
                  <PinIcon size={12} stroke={CONTACT_ICON_STROKE} />
                  <span>
                    14 Rue du Faubourg,
                    <br />
                    Paris, France 75008
                  </span>
                </li>
              </ul>
            </address>
          </Reveal>
        </div>
      </div>

      <div className="footer-bottom">
        <Reveal className="footer-bottom-inner" fade>
          <p className="footer-copyright">
            {t('footer_copyright', '© 2026 MESIR Perfume & Home Fragrance. All Rights Reserved.')}
          </p>
          <div className="footer-dots">
            <div className="footer-dot"></div>
            <div className="footer-dot"></div>
            <div className="footer-dot"></div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
