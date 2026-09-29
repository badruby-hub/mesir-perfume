'use client';

// Brief feedback for add-to-cart / add-to-favorites: rises in, fades out.
import { AnimatePresence, motion } from 'framer-motion';
import { useShop } from '@/components/providers/ShopProvider';

export default function Toast() {
  const { toast } = useShop();
  return (
    <div className="mesir-toast" role="status" aria-live="polite">
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            className="mesir-toast-body"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
