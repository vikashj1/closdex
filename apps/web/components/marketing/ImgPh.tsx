import type { CSSProperties, ReactNode } from 'react';

/** Image placeholder used in marketing mocks. Drop-in for a real screenshot. */
export function ImgPh({
  label,
  height = 320,
  style,
  children,
}: {
  label: string;
  height?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        height,
        background:
          'linear-gradient(135deg, color-mix(in oklch, var(--gold) 6%, var(--bg-2)) 0%, var(--surface) 100%)',
        border: '1px dashed color-mix(in oklch, var(--gold) 35%, var(--border))',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-mute)',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
        textAlign: 'center',
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children ?? label}
    </div>
  );
}
