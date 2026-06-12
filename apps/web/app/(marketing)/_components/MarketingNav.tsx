'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/for-companies', label: 'For Companies' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/learn', label: 'Learn' },
];

export function MarketingNav() {
  const pathname = usePathname();
  return (
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
          <button className="btn btn--secondary btn--sm nav__toggle" aria-label="Menu">
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
