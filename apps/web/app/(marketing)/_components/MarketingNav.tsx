'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/learn', label: 'Learn' },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="nav">
        <div className="container nav__inner">
          <Link className="wordmark" href="/" aria-label="Closdex home">
            Clos<span className="mk">dex</span>
          </Link>
          <nav className="nav__links" aria-label="Primary">
            {links.map((l) => {
              const isActive = pathname === l.href || pathname?.startsWith(l.href + '/');
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={isActive ? 'is-active' : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="nav__right">
            <Link className="login" href="/login">
              Log in
            </Link>
            <Link className="btn btn--primary btn--sm" href="/signup">
              Sign up
            </Link>
            <button
              type="button"
              className="btn btn--secondary btn--sm nav__toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="cmkt-mobile-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — only matters when nav__toggle is visible (<= 760px). */}
      <div
        id="cmkt-mobile-drawer"
        className={`nav__drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
      >
        <nav className="nav__drawer-links" aria-label="Mobile primary">
          {links.map((l) => {
            const isActive = pathname === l.href || pathname?.startsWith(l.href + '/');
            return (
              <Link
                key={l.href}
                href={l.href}
                className={isActive ? 'is-active' : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="nav__drawer-cta">
            <Link className="btn btn--secondary" href="/login" onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link className="btn btn--primary" href="/signup" onClick={() => setOpen(false)}>
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
