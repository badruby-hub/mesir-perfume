// =======================================================
// SCROLL REVEAL
// Elements fade and slide in the first time they enter the viewport.
// The .reveal class is added from JS (not written in the HTML), so
// with JS disabled or on a failed load everything stays visible.
// Skipped entirely for users who ask for reduced motion.
// =======================================================
(function initScrollReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  // [selector, stagger step in ms between siblings of the same group,
  //  atPageEnd — element sits at the very bottom of the page]
  const groups = [
    ['.section-header', 0],
    ['#catalog .catalog-container', 0],
    ['#testimonials .testimonials-columns', 0],
    ['.footer-grid > *', 120],
    ['.footer-bottom-inner', 0, true],
  ];

  const onIntersect = (entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  };

  // threshold 0, not a percentage: on phones the catalog is several
  // screens tall, so a ratio like 0.15 can never be reached and the
  // catalog would stay invisible. The negative bottom margin still
  // waits until the element is a little way into the viewport.
  const observer = new IntersectionObserver(onIntersect, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

  // Elements at the page end can never get 10% above the viewport
  // bottom, so they use no margin and fade only (.reveal-fade): a
  // translateY there adds scroll height that vanishes mid-animation
  // and makes the page jump.
  const endObserver = new IntersectionObserver(onIntersect, { threshold: 0 });

  groups.forEach(([selector, step, atPageEnd]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (atPageEnd) el.classList.add('reveal-fade');
      if (step) el.style.transitionDelay = (i * step) + 'ms';
      (atPageEnd ? endObserver : observer).observe(el);
    });
  });
})();
