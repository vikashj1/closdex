'use client';

import { CSSProperties, ReactNode, useState } from 'react';

interface Props {
  children: ReactNode;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  padding?: number;
}

export function Card({ children, style = {}, hover = false, onClick, padding = 18 }: Props) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hover && h ? 'color-mix(in oklch, var(--gold) 35%, var(--border))' : 'var(--border-soft)'}`,
        borderRadius: 'var(--radius)',
        padding,
        cursor: onClick || hover ? 'pointer' : 'default',
        transform: hover && h ? 'translateY(-4px) scale(1.005)' : 'translateY(0)',
        transition: 'transform 0.22s cubic-bezier(0.2, 0.7, 0.2, 1), border-color 0.2s ease, box-shadow 0.25s ease',
        boxShadow:
          hover && h
            ? '0 18px 38px -22px color-mix(in oklch, var(--gold) 70%, transparent), 0 2px 6px rgba(0,0,0,0.15)'
            : 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
