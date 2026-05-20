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
        border: `1px solid ${hover && h ? 'var(--surface-3)' : 'var(--border-soft)'}`,
        borderRadius: 'var(--radius)',
        padding,
        cursor: onClick || hover ? 'pointer' : 'default',
        transform: hover && h ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.12s ease, border-color 0.15s',
        boxShadow: hover && h ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
