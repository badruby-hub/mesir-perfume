'use client';

// Section heading with gold ornament lines: eyebrow, title, subtitle.
// Fades in on scroll while the lines draw outward from the eyebrow.
import Reveal, { RevealLine } from '@/components/motion/Reveal';

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  titleId,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  titleId?: string;
}) {
  return (
    <Reveal className="section-header">
      <div className="section-header-row">
        <RevealLine className="ornament-line-fade-right" from="right" />
        <span className="section-eyebrow">{eyebrow}</span>
        <RevealLine className="ornament-line-fade-left" from="left" />
      </div>
      <h2 className="section-title" id={titleId}>
        {title}
      </h2>
      <p className="section-subtitle">{subtitle}</p>
    </Reveal>
  );
}
