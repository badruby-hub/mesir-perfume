'use client';

// Any <img> that fails to load (broken link, network hiccup) is swapped to
// a transparent 1x1 pixel instead of the browser's "broken image" icon —
// the gray pulse background on every <img> (see styles/base.css) then
// stays visible as a clean placeholder. 'error' doesn't bubble, so this
// listens in the capture phase.
import { useEffect } from 'react';

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIEAAAAAAAAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAgEAAEEBAA7';

export default function ImageFallback() {
  useEffect(() => {
    const onError = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el instanceof HTMLImageElement && !el.dataset.fallbackApplied) {
        el.dataset.fallbackApplied = 'true';
        el.src = TRANSPARENT_PIXEL;
      }
    };
    document.addEventListener('error', onError, true);
    return () => document.removeEventListener('error', onError, true);
  }, []);

  return null;
}
