import { CSSProperties } from 'react';

/** Section-header eyebrow used across the landing — translucent fill + accent border. */
export const pill = (color: string): CSSProperties => ({
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
