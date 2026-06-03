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
          display: 'none',
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
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 998,
              animation: 'fadeUp 0.18s ease both',
            }}
          />
          <nav
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(84vw, 320px)',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border-soft)',
              zIndex: 999,
              padding: '20px 18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflowY: 'auto',
              boxShadow: '-12px 0 32px rgba(30,22,10,0.18)',
              animation: 'fadeInUp 0.25s cubic-bezier(0.2, 0.7, 0.2, 1) both',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {items.map((it) => (
              <a
                key={it.href + it.label}
                onClick={() => handleNav(it.href)}
                style={{
                  display: 'block',
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: it.active ? 700 : 500,
                  color: it.active ? 'var(--gold)' : 'var(--text)',
                  background: it.active
                    ? 'color-mix(in oklch, var(--gold) 12%, transparent)'
                    : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {it.label}
              </a>
            ))}

            {(primaryCtaLabel || secondaryCtaLabel || onLogout) && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {secondaryCtaLabel && secondaryCtaHref && (
                  <button
                    type="button"
                    onClick={() => handleNav(secondaryCtaHref)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text)',
                      fontSize: 14,
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
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'var(--gold)',
                      color: 'oklch(0.18 0.02 75)',
                      fontSize: 14,
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
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      fontSize: 14,
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
        </>
      )}
    </>
  );
}
