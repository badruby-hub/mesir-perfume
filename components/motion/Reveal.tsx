'use client';

// Scroll reveal: the element fades and slides in the first time it enters
// the viewport. Children that use the same "hidden"/"visible" variant
// names (e.g. <RevealLine>) animate together with it.
import { motion, type Variants } from 'framer-motion';
import type { ComponentProps } from 'react';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const slideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT, delay } }),
};

// Fade only, no slide — for elements at the very bottom of the page,
// where a translateY would add scroll height that vanishes mid-animation.
const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({ opacity: 1, transition: { duration: 1.2, ease: 'easeOut', delay } }),
};

type RevealProps = ComponentProps<typeof motion.div> & {
  delay?: number;
  fade?: boolean;
};

export default function Reveal({ delay = 0, fade = false, ...rest }: RevealProps) {
  return (
    <motion.div
      variants={fade ? fadeOnly : slideUp}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      // Page-end elements can never get 10% above the viewport bottom, so
      // they trigger as soon as they touch it.
      viewport={{ once: true, margin: fade ? '0px' : '0px 0px -10% 0px' }}
      {...rest}
    />
  );
}

// Section-header ornament line that draws outward once its header is
// revealed. `from` is the side it grows from.
const drawLine: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1, ease: 'easeOut', delay: 0.3 } },
};

export function RevealLine({ className, from }: { className: string; from: 'left' | 'right' }) {
  return <motion.div className={className} variants={drawLine} style={{ transformOrigin: from }} />;
}
