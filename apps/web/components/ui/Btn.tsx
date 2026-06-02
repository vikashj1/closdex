'use client';

import { CSSProperties, ReactNode, useState } from 'react';

type Kind = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  kind?: Kind;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  full?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
}

const SIZES: Record<Size, { padY: number; padX: number; fs: number; gap: number }> = {
  sm: { padY: 7, padX: 12, fs: 12.5, gap: 6 },
  md: { padY: 11, padX: 16, fs: 13.5, gap: 8 },
  lg: { padY: 14, padX: 22, fs: 15, gap: 10 },
};

const VARIANTS: Record<Kind, { bg: string; color: string; border: string }> = {
  primary:   { bg: 'var(--gold)',      color: 'oklch(0.18 0.02 75)', border: '1px solid transparent' },
  secondary: { bg: 'var(--surface-2)', color: 'var(--text)',         border: '1px solid var(--border)' },
  ghost:     { bg: 'transparent',      color: 'var(--text)',         border: '1px solid var(--border)' },
  danger:    { bg: 'var(--d-expert)',  color: 'white',               border: '1px solid transparent' },
  success:   { bg: 'var(--emerald)',   color: 'oklch(0.18 0.02 75)', border: '1px solid transparent' },
};

export function Btn({
  kind = 'primary', size = 'md', icon, children, onClick, style = {}, full, type = 'button', disabled, loading,
}: Props) {
  const s = SIZES[size];
  const v = VARIANTS[kind];
  const isDisabled = disabled || loading;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const live = !isDisabled && hovered;
  const tinted = kind === 'primary' || kind === 'danger' || kind === 'success';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        padding: `${s.padY}px ${s.padX}px`,
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: 10,
        fontWeight: 600,
        fontSize: s.fs,
        width: full ? '100%' : 'auto',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transform: pressed && live ? 'translateY(0) scale(0.985)' : live ? 'translateY(-1px)' : 'translateY(0)',
        filter: live ? 'brightness(1.08) saturate(1.06)' : 'none',
        boxShadow: live
          ? tinted
            ? `0 8px 22px -10px color-mix(in oklch, ${v.bg} 70%, transparent), 0 0 0 1px color-mix(in oklch, ${v.bg} 50%, transparent)`
            : '0 6px 18px -10px rgba(0,0,0,0.45)'
          : 'none',
        transition: 'transform 0.14s ease, filter 0.18s ease, box-shadow 0.2s ease, opacity 0.15s ease',
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => { if (!isDisabled) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ animation: 'spin 0.8s linear infinite' }}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
}
