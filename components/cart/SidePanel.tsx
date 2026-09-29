'use client';

// Right-hand slide-over panel used by the cart, favorites and order form.
// Opening fades in the backdrop and slides the panel in from the right;
// closing plays the same in reverse before the overlay unmounts.
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from '@/components/layout/icons';
import { EASE_OUT } from '@/components/motion/Reveal';

const overlayVariants: Variants = {
  open: {},
  // Stay mounted until the backdrop and panel have finished closing.
  closed: { transition: { when: 'afterChildren' } },
};

const backdropVariants: Variants = {
  open: { opacity: 1, transition: { duration: 0.3 } },
  closed: { opacity: 0, transition: { duration: 0.25 } },
};

const panelVariants: Variants = {
  open: { x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
  closed: { x: '100%', transition: { duration: 0.3, ease: 'easeIn' } },
};

export default function SidePanel({
  open,
  onClose,
  title,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cart-overlay" variants={overlayVariants} initial="closed" animate="open" exit="closed">
          <motion.div className="cart-backdrop" variants={backdropVariants} onClick={onClose} />
          <motion.div className="cart-panel" variants={panelVariants} role="dialog" aria-modal="true" aria-label={title}>
            <div className="cart-header">
              <h2 className="cart-title">{title}</h2>
              <button className="cart-close-btn" aria-label={closeLabel} onClick={onClose}>
                <CloseIcon />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
