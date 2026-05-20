'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}

export function Chip({ children, active, onClick, color }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px',
        borderRadius: 999,
        background: active ? (color || 'var(--gold)') : 'var(--bg-2)',
        color: active ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
        border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}
