import type { CSSProperties } from 'react';

/** "Marketing pill" — pillbox eyebrow used across all public screens. */
export const mp = (color = 'var(--gold)'): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 999,
  background: `color-mix(in oklch, ${color} 14%, transparent)`,
  border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
  color,
  fontSize: 12,
  fontWeight: 600,
});

export const mSectionHead: CSSProperties = {
  fontSize: 44,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  margin: '16px 0 8px',
  lineHeight: 1.05,
};

export const mLede: CSSProperties = {
  color: 'var(--text-dim)',
  fontSize: 15.5,
  lineHeight: 1.55,
  maxWidth: 640,
  margin: 0,
};
