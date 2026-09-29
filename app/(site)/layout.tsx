// Storefront shell: header, footer, cart / favorites / order panels and
// the toast, shared by every public page. Site data (products, slides,
// texts) is read from Supabase on the server for each request, so pages
// render with real content on first paint.
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { getSiteData } from '@/lib/supabase';
import { LANG_COOKIE, resolveLang } from '@/lib/i18n';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { ShopProvider } from '@/components/providers/ShopProvider';
import { SiteDataProvider } from '@/components/providers/SiteDataProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageFallback from '@/components/layout/ImageFallback';
import CartPanel from '@/components/cart/CartPanel';
import FavoritesPanel from '@/components/cart/FavoritesPanel';
import OrderModal from '@/components/cart/OrderModal';
import Toast from '@/components/cart/Toast';
import MotionProvider from '@/components/motion/MotionProvider';

import '@/styles/base.css';
import '@/styles/header.css';
import '@/styles/hero.css';
import '@/styles/catalog.css';
import '@/styles/pages.css';
import '@/styles/footer.css';
import '@/styles/cart.css';
import '@/styles/toast.css';
import '@/styles/testimonials.css';
import '@/styles/animations.css';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const data = await getSiteData();
  const lang = resolveLang((await cookies()).get(LANG_COOKIE)?.value, (await headers()).get('accept-language'));

  return (
    <MotionProvider>
      <I18nProvider initialLang={lang} translations={data.i18n} labels={data.labels}>
        <SiteDataProvider value={{ products: data.products, slides: data.slides, filters: data.filters }}>
          <ShopProvider>
            <div className="wrapper">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>
  
            <CartPanel />
            <FavoritesPanel />
            <OrderModal />
            <Toast />
            <ImageFallback />
          </ShopProvider>
        </SiteDataProvider>
      </I18nProvider>
    </MotionProvider>
  );
}
