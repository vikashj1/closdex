'use client';

import { CSSProperties } from 'react';

interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
}

export function TextInput({ value, onChange, placeholder, type = 'text', style }: Props) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 12px',
        fontSize: 13.5,
        color: 'var(--text)',
        ...style,
      }}
    />
  );
}
