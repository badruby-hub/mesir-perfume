import { getSiteData } from '@/lib/supabase';
import Hero from '@/components/home/Hero';
import Catalog from '@/components/catalog/Catalog';
import Testimonials from '@/components/home/Testimonials';

// Schema.org ItemList of Products, so search engines can show price and
// availability directly in results.
function productStructuredData(products: Awaited<ReturnType<typeof getSiteData>>['products']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: `${p.brand} ${p.name}`,
        image: p.image,
        description: p.description?.en || p.description?.ru || '',
        brand: { '@type': 'Brand', name: p.brand },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'AMD',
          price: p.price,
          availability: p.availability === 'in-stock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        },
      },
    })),
  };
}

export default async function HomePage() {
  const { products } = await getSiteData();

  return (
    <>
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData(products)).replace(/</g, '\\u003c') }}
        />
      )}
      <Hero />
      <Catalog />
      <Testimonials />
    </>
  );
}
