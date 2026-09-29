import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { LANG_COOKIE, resolveLang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'MESIR — Perfume',
  icons: { icon: '/assets/logo.png' },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = resolveLang((await cookies()).get(LANG_COOKIE)?.value, (await headers()).get('accept-language'));

  return (
    // data-scroll-behavior: lets Next.js switch off the CSS smooth scroll
    // during page navigation, so a new page opens at the top instead of
    // visibly scrolling up from where the previous page was.
    <html lang={lang} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
