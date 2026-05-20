'use client';

import { CSSProperties } from 'react';

interface Props {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  style?: CSSProperties;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TextInput({
  value, onChange, placeholder, type = 'text', style, autoComplete, name, required, disabled,
}: Props) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      name={name}
      required={required}
      disabled={disabled}
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
