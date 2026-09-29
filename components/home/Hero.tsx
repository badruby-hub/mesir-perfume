'use client';

// Hero slider: showcase slides from the admin panel, auto-advancing every
// 6 seconds with an animated transition between slides.
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';
import { useShop } from '@/components/providers/ShopProvider';
import { useSiteData } from '@/components/providers/SiteDataProvider';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/layout/icons';
import { EASE_OUT } from '@/components/motion/Reveal';
import { formatAMD, parsePrice } from '@/lib/format';
import type { Slide } from '@/lib/types';

const AUTOPLAY_MS = 6000;

const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

// Hero slides are their own showcase items (not tied to a catalog
// product), so "Add to Cart" builds a cart line straight from the slide.
// The "slide-" id prefix keeps it from colliding with a product id.
function slideToCartItem(slide: Slide) {
  return {
    id: `slide-${slide.id}`,
    brand: slide.brand,
    name: slide.name,
    price: parsePrice(slide.price),
    size: slide.size || '100 ml',
    image: slide.image,
  };
}

// Slide-change animation: the outgoing text leaves in the direction of
// travel and the new one comes in from the other side; the bottle fades
// and scales. mode="wait" lets the old slide finish leaving first.
const textVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: 20 * dir }),
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  exit: (dir: number) => ({ opacity: 0, y: -20 * dir, transition: { duration: 0.35, ease: 'easeIn' } }),
};

const imageVariants: Variants = {
  enter: { opacity: 0, scale: 0.95 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.35, ease: 'easeIn' } },
};

export default function Hero() {
  const { t, pick } = useI18n();
  const { slides } = useSiteData();
  const { addToCart } = useShop();

  // direction: 1 = forward, -1 = back.
  const [[current, direction], setSlide] = useState<[number, number]>([0, 1]);

  const count = slides.length;
  const slide: Slide | undefined = slides[Math.min(current, count - 1)];

  const goToSlide = (index: number, dir: number) => {
    if (count === 0 || index === current) return;
    setSlide([index, dir]);
  };
  const nextSlide = () => goToSlide((current + 1) % count, 1);
  const prevSlide = () => goToSlide((current - 1 + count) % count, -1);

  // Autoplay. Restarting the timer on every slide change means a manual
  // click always gets a full 6 seconds before the next automatic step.
  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => setSlide(([c]) => [(c + 1) % count, 1]), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [current, count]);

  return (
    <section id="hero">
      <div className="hero-pattern"></div>
      <div className="hero-arc">
        <svg viewBox="0 0 600 900" fill="none" width="100%" height="100%">
          <circle cx="600" cy="450" r="500" stroke="#E29D30" strokeWidth="1" />
          <circle cx="600" cy="450" r="380" stroke="#E29D30" strokeWidth="0.5" />
          <circle cx="600" cy="450" r="260" stroke="#E29D30" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="hero-inner">
        <div className="hero-grid">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current}
              className="hero-text"
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="hero-ornament">
                <div className="ornament-line-short"></div>
                <span className="hero-brand-label">{slide ? slide.brand : 'MESIR'}</span>
                <div className="ornament-line-short"></div>
              </div>

              <div>
                <h2 className="hero-name">{slide ? slide.name : 'OUD ROYAL'}</h2>
                <p className="hero-tagline">{slide ? pick(slide.tagline) : 'An Ode to Ancient Luxury'}</p>
              </div>

              <p className="hero-description">
                {slide
                  ? pick(slide.description)
                  : 'An elegant composition built around rich oud, warm amber and subtle oriental spices. A fragrance that commands presence.'}
              </p>

              <div className="hero-notes">
                {slide &&
                  pick(slide.notes).map((note, i) => (
                    <div key={i} className="hero-note-item">
                      <div className="hero-note-dot"></div>
                      {note}
                    </div>
                  ))}
              </div>

              <div className="hero-cta-row">
                <span className="hero-price">{formatAMD(slide ? parsePrice(slide.price) : 144400)}</span>
                <button className="btn-outline-gold" onClick={() => slide && addToCart(slideToCartItem(slide))}>
                  {t('add_to_cart', 'Add to Cart')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current} className="hero-image-wrap" variants={imageVariants} initial="enter" animate="center" exit="exit">
              <div className="hero-glow"></div>
              <div className="hero-image-frame">
                <div className="corner-ornament tl"></div>
                <div className="corner-ornament tr"></div>
                <div className="corner-ornament bl"></div>
                <div className="corner-ornament br"></div>
                {slide && <img className="hero-image" src={slide.image} alt={slide.name} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hero-controls">
          <button className="slide-nav-btn" aria-label="Previous" onClick={prevSlide}>
            <ChevronLeftIcon />
          </button>

          <span className="hero-counter">
            <span className="hero-counter-current">{pad(current + 1)}</span>
            <span className="hero-counter-sep">/</span>
            <span>{pad(count)}</span>
          </span>

          <div className="hero-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={'hero-dot' + (i === current ? ' active' : '')}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goToSlide(i, i > current ? 1 : -1)}
              />
            ))}
          </div>

          <button className="slide-nav-btn" aria-label="Next" onClick={nextSlide}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="hero-bottom-fade"></div>
    </section>
  );
}
