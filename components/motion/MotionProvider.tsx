'use client';

// Site-wide framer-motion settings. reducedMotion="user": visitors who
// ask their OS for reduced motion get fades only — no slides or scaling.
import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
