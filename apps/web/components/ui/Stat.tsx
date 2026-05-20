import { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
  icon?: ReactNode;
}

export function Stat({ label, value, sub, accent, icon }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-mute)',
          fontSize: 11.5,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 500,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        className="display mono"
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: accent || 'var(--text)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sub}</div>}
    </div>
  );
}
