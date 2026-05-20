import { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}

export function Field({ label, children, hint, required }: Props) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-dim)' }}>
        {label}
        {required && <span style={{ color: 'var(--d-expert)' }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{hint}</span>}
    </label>
  );
}
