'use client';

import { useEffect, useState } from 'react';

export interface MobileNavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface Props {
  items: MobileNavItem[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  go: (href: string) => void;
  onLogout?: () => void;
}

/** Hamburger button + slide-down drawer. Only visible on viewports <768px —
 *  desktop layouts continue to use their own nav and hide this component via
 *  the `hide-desktop` utility. */
export function MobileNav({
  items,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  go,
  onLogout,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function handleNav(href: string) {
    setOpen(false);
    go(href);
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="show-mobile-only"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          padding: 0,
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 10,
          color: 'var(--text)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          className="show-mobile-only"
          style={{
            position: 'fixed',
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg)',
            zIndex: 50,
            flexDirection: 'column',
            padding: '24px 20px',
            gap: 8,
            borderTop: '1px solid var(--border-soft)',
            overflowY: 'auto',
            animation: 'fadeInUp 0.22s ease both',
          }}
        >
          {items.map((it) => (
            <a
              key={it.href + it.label}
              onClick={() => handleNav(it.href)}
              style={{
                padding: '14px 12px',
                fontSize: 17,
                fontWeight: it.active ? 700 : 600,
                color: it.active ? 'var(--gold)' : 'var(--text)',
                borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer',
              }}
            >
              {it.label}
            </a>
          ))}

          {(primaryCtaLabel || secondaryCtaLabel || onLogout) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {secondaryCtaLabel && secondaryCtaHref && (
                <button
                  type="button"
                  onClick={() => handleNav(secondaryCtaHref)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {secondaryCtaLabel}
                </button>
              )}
              {primaryCtaLabel && primaryCtaHref && (
                <button
                  type="button"
                  onClick={() => handleNav(primaryCtaHref)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--gold)',
                    color: 'oklch(0.18 0.02 75)',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {primaryCtaLabel}
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-dim)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          )}
        </nav>
      )}
    </>
  );
}
