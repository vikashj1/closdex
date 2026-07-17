'use client';

import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { AppShellController } from './AppShellController';

// ─── shared design tokens (kept inline to match Closdex's no-Tailwind rule) ─────
const COLOR = {
  ink: '#0B0B0F',
  paper: '#FFFFFF',
  hairline: '#E7E7EC',
  hover: '#FAFAF8',
  muted: '#7A7A86',
  mutedSoft: '#9A9AA4',
  textDim: '#3A3A44',
  violet: '#5B4BF5',
  violetDeep: '#3A2DC4',
  violetTint: 'rgba(91,75,245,0.08)',
  gold: '#F5A524',
  goldBg: '#FFFBF2',
  goldBorder: '#F4E4C4',
  goldText: '#8A6A1A',
} as const;

const FONT_DISPLAY = "'Space Grotesk', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

// ─── nav definition ────────────────────────────────────────────────────────────
type NavItem = {
  id: string;
  label: string;
  href: string;
  prefix?: string;
  icon: ReactNode;
  authOnly?: boolean;
  hasUnreadDot?: boolean;
};

const stroke = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const NAV: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard',
    icon: (
      <svg {...stroke}>
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
      </svg>
    ),
    authOnly: true,
  },
  {
    id: 'challenges',
    label: 'Challenges',
    href: '/app/challenges',
    prefix: '/app/challenges',
    icon: (
      <svg {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" />
      </svg>
    ),
  },
  {
    id: 'attempts',
    label: 'My Attempts',
    href: '/attempts',
    prefix: '/attempts',
    icon: (
      <svg {...stroke}>
        <path d="M3 3v5h5" />
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    authOnly: true,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    href: '/app/leaderboard',
    icon: (
      <svg {...stroke}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Learn',
    href: '/app/learn',
    prefix: '/app/learn',
    icon: (
      <svg {...stroke}>
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    id: 'disputes',
    label: 'My Disputes',
    href: '/disputes',
    prefix: '/disputes',
    icon: (
      <svg {...stroke}>
        <path d="M12 3v18" />
        <path d="M3.5 7h17" />
        <path d="m16 16 3-7.5 3 7.5c-.85.7-1.9 1-3 1s-2.15-.3-3-1Z" />
        <path d="m2 16 3-7.5 3 7.5c-.85.7-1.9 1-3 1s-2.15-.3-3-1Z" />
        <path d="M7 21h10" />
      </svg>
    ),
    authOnly: true,
  },
  // Applications still hidden for beta. Jobs is back — points to the
  // logged-in dashboard variant (status header + readiness score + sprint).
  {
    id: 'jobs',
    label: 'Jobs',
    href: '/app/jobs',
    prefix: '/app/jobs',
    icon: (
      <svg {...stroke}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 13h18" />
      </svg>
    ),
    authOnly: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    prefix: '/notifications',
    hasUnreadDot: true,
    icon: (
      <svg {...stroke}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
    authOnly: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: (
      <svg {...stroke}>
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a8 8 0 0 1 13 0" />
      </svg>
    ),
    authOnly: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg {...stroke}>
        <line x1="21" x2="14" y1="5" y2="5" />
        <line x1="10" x2="3" y1="5" y2="5" />
        <line x1="21" x2="12" y1="12" y2="12" />
        <line x1="8" x2="3" y1="12" y2="12" />
        <line x1="21" x2="16" y1="19" y2="19" />
        <line x1="12" x2="3" y1="19" y2="19" />
        <circle cx="12" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="14" cy="19" r="2" />
      </svg>
    ),
    authOnly: true,
  },
];

// Routes that render their own full-bleed marketing chrome when the visitor is
// anonymous. On these, AppShell should step aside entirely so the page can show
// its own header/footer instead of the salesperson sidebar.
const MARKETING_ROUTE_PREFIXES = ['/app/challenges', '/app/leaderboard', '/app/learn'];

// ─── individual nav link with hover state ──────────────────────────────────────
function NavLink({
  item,
  active,
  unreadCount,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  unreadCount: number;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const showDot = item.hasUnreadDot && unreadCount > 0;

  const base: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 12px',
    borderRadius: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'left',
    color: COLOR.textDim,
    fontWeight: 500,
  };
  const activeStyle: CSSProperties = active
    ? {
        color: COLOR.violetDeep,
        background: COLOR.violetTint,
        fontWeight: 600,
        boxShadow: `inset 2px 0 0 ${COLOR.violet}`,
      }
    : hover
      ? { background: COLOR.hover, color: COLOR.ink }
      : {};

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...activeStyle }}
    >
      {showDot ? (
        <span style={{ position: 'relative', display: 'flex' }}>
          {item.icon}
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: COLOR.violet,
              border: '1.5px solid #fff',
            }}
          />
        </span>
      ) : (
        item.icon
      )}
      {item.label}
      {item.id === 'notifications' && unreadCount > 0 && (
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: FONT_MONO,
            fontSize: 10,
            fontWeight: 700,
            color: COLOR.violetDeep,
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

// ─── ghost button (sidebar Sign out, search btn etc) ────────────────────────────
function HoverButton({
  children,
  style,
  hoverStyle,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  style: CSSProperties;
  hoverStyle: CSSProperties;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={ariaLabel}
      style={{ ...style, ...(hover ? hoverStyle : {}) }}
    >
      {children}
    </button>
  );
}

// ─── tier badge in topbar ──────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const t = tier.toLowerCase();
  const palette: Record<string, { bg: string; border: string; text: string; shield: string }> = {
    rookie: { bg: '#F3F3F6', border: '#E0E0E6', text: '#7A7A86', shield: '#9A9AA4' },
    bronze: { bg: '#FFFBF2', border: '#F4E4C4', text: '#8A6A1A', shield: '#F5A524' },
    silver: { bg: '#F4F5F8', border: '#D8DBE2', text: '#5A5E6A', shield: '#C0C0C8' },
    gold: { bg: '#FFFBF2', border: '#F4E4C4', text: '#8A6A1A', shield: '#F5A524' },
    platinum: { bg: '#F5F8FB', border: '#D8E1ED', text: '#3A5A7F', shield: '#7B9CC4' },
    diamond: { bg: '#EEF7FA', border: '#C5E0E9', text: '#1F6A7F', shield: '#3DA4BF' },
    master: { bg: '#F4F0FA', border: '#DFD2EE', text: '#523289', shield: '#7E5BB8' },
    grandmaster: { bg: '#F8F0FA', border: '#EBD2EE', text: '#7A1F89', shield: '#B83D9C' },
  };
  const c = palette[t] ?? palette.bronze;
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 9px 4px 5px',
        borderRadius: 100,
        background: c.bg,
        border: `1px solid ${c.border}`,
        marginLeft: 2,
      }}
    >
      <span
        style={{
          width: 14,
          height: 16,
          background: c.shield,
          display: 'inline-block',
          clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
        }}
      />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: c.text,
          textTransform: 'uppercase',
        }}
      >
        {tier}
      </span>
    </span>
  );
}

// ─── main shell ────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();
  const streak = user?.salesperson?.currentStreakDays ?? 0;
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');
  // Drawer / sheet / search-overlay state is managed by AppShellController
  // (mounted below) via DOM classes on <html> — no React state here.

  useEffect(() => {
    if (!user) return;
    api.notifications
      .listMine(true)
      .then((r) => setUnreadCount(r.items.length))
      .catch(() => {});
  }, [user]);

  // Anonymous + marketing route: pass children through unwrapped so the page's
  // own marketing chrome owns the layout.
  if (
    !user &&
    MARKETING_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return <>{children}</>;
  }

  const visibleNav = NAV.filter((n) => user || !n.authOnly);
  const isActive = (n: NavItem) => (n.prefix ? pathname.startsWith(n.prefix) : pathname === n.href);

  const userName = user?.name ?? user?.email?.split('@')[0] ?? 'Guest';
  const avatarInitial = (userName[0] || 'g').toUpperCase();
  // user.salesperson.rank comes back as an enum-style string ("BRONZE",
  // "SILVER", "GRANDMASTER"). Title-case it for the badge label.
  const rankRaw = user?.salesperson?.rank ?? 'BRONZE';
  const tier =
    rankRaw.length > 0 ? rankRaw[0].toUpperCase() + rankRaw.slice(1).toLowerCase() : 'Bronze';
  const streakLabel =
    streak >= 2 ? `${streak}-day streak` : streak === 1 ? '1-day streak' : 'Start a streak';

  function onSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/app/challenges?q=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        background: COLOR.paper,
        color: COLOR.ink,
        fontFamily: "Inter, -apple-system, sans-serif",
        overflow: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <AppShellController />

      {/* Drawer scrim — class-driven, opacity flips with html.drawer-open. */}
      <div className="app-scrim" data-drawer-close />

      {/* Search overlay — slides down from the top on phones via html.search-open. */}
      <div className="search-overlay">
        <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx={11} cy={11} r={7} />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          placeholder="Search challenges… (Enter)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onSearch}
          style={{ flex: 1, height: 40, border: 'none', background: 'transparent', fontFamily: 'Inter,sans-serif', fontSize: 15, color: '#0B0B0F', outline: 'none' }}
        />
        <button
          type="button"
          data-search-close
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7A7A86', padding: 8 }}
        >
          Cancel
        </button>
      </div>

      {/* Mobile bottom-nav — 5 tabs. Visible only ≤767px. */}
      <nav className="bottom-nav" aria-label="Primary">
        {[
          { href: '/dashboard', label: 'Home', match: (p: string) => p === '/dashboard',
            d: 'M3 9.5 12 3l9 6.5 M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5' },
          { href: '/app/challenges', label: 'Challenges', match: (p: string) => p.startsWith('/app/challenges'),
            paths: [{ d: 'M0 0', _: null }] },
          { href: '/app/leaderboard', label: 'Ranks', match: (p: string) => p.startsWith('/app/leaderboard') },
          { href: '/app/learn', label: 'Learn', match: (p: string) => p.startsWith('/app/learn') },
          { href: '/profile', label: 'Profile', match: (p: string) => p.startsWith('/profile') },
        ].map((tab) => {
          const active = tab.match(pathname);
          return (
            <a key={tab.href} href={tab.href} {...(active ? { 'data-active': '' } : {})}>
              {tab.label === 'Home' && (
                <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5 12 3l9 6.5" />
                  <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
                </svg>
              )}
              {tab.label === 'Challenges' && (
                <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={12} cy={12} r={9} />
                  <circle cx={12} cy={12} r={5} />
                  <circle cx={12} cy={12} r={1.4} />
                </svg>
              )}
              {tab.label === 'Ranks' && (
                <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              )}
              {tab.label === 'Learn' && (
                <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              )}
              {tab.label === 'Profile' && (
                <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx={12} cy={8} r={4} />
                  <path d="M5.5 21a8 8 0 0 1 13 0" />
                </svg>
              )}
              <span>{tab.label}</span>
            </a>
          );
        })}
      </nav>

      {/* ───── Sidebar ───── */}
      <aside
        className="app-sidebar"
        id="closdex-mobile-nav"
        aria-label="Navigation"
        style={{
          width: 248,
          flexShrink: 0,
          borderRight: `1px solid ${COLOR.hairline}`,
          background: COLOR.paper,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Logo */}
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{
            padding: '22px 22px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
            <path d="M12 2.5 22 20.5H2L12 2.5Z" fill={COLOR.ink} />
            <path d="M12 12.2 16.8 20.5H7.2L12 12.2Z" fill={COLOR.violet} />
          </svg>
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: '-0.03em',
              color: COLOR.ink,
            }}
          >
            Closdex
          </span>
        </button>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '6px 12px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {visibleNav.map((n) => (
            <NavLink
              key={n.id}
              item={n}
              active={isActive(n)}
              unreadCount={unreadCount}
              onClick={() => router.push(n.href)}
            />
          ))}
        </nav>

        {/* Streak widget + sign out */}
        <div
          style={{
            padding: 12,
            borderTop: `1px solid ${COLOR.hairline}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {user && (
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '11px 12px' }}>
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLOR.gold}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5" />
              </svg>
              <div>
                <div
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    color: COLOR.ink,
                  }}
                >
                  {streakLabel}
                </div>
                <div style={{ fontSize: 11.5, lineHeight: 1.45, color: COLOR.muted, marginTop: 3 }}>
                  Complete 1 challenge today to keep your streak alive.
                </div>
              </div>
            </div>
          )}
          {user ? (
            <HoverButton
              onClick={() => {
                logout();
                router.push('/');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: COLOR.muted,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              hoverStyle={{ background: COLOR.hover, color: COLOR.ink }}
            >
              <svg {...stroke}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Sign out
            </HoverButton>
          ) : (
            <HoverButton
              onClick={() => router.push('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                color: COLOR.violetDeep,
                background: COLOR.violetTint,
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
              hoverStyle={{ background: COLOR.violetTint }}
            >
              Sign in
            </HoverButton>
          )}
        </div>
      </aside>

      {/* ───── Main column ───── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
        }}
      >
        {/* Top bar */}
        <header
          className="app-topbar"
          style={{
            height: 64,
            flexShrink: 0,
            borderBottom: `1px solid ${COLOR.hairline}`,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '0 28px',
            background: COLOR.paper,
          }}
        >
          {/* Mobile-only left cluster: hamburger + Closdex logo. */}
          <div className="r-topbar-left">
            <button className="r-icon-btn" data-drawer-toggle aria-label="Open menu">
              <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <line x1={3} x2={21} y1={6} y2={6} />
                <line x1={3} x2={21} y1={12} y2={12} />
                <line x1={3} x2={21} y1={18} y2={18} />
              </svg>
            </button>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }} aria-hidden>
              <path d="M12 2.5 22 20.5H2L12 2.5Z" fill={COLOR.ink} />
              <path d="M12 12.2 16.8 20.5H7.2L12 12.2Z" fill={COLOR.violet} />
            </svg>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', color: COLOR.ink }}>
              Closdex
            </span>
          </div>
          {/* Desktop search field — hidden ≤767 (the r-search-btn opens overlay). */}
          <div className="app-search-field" style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLOR.mutedSoft}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <circle cx={11} cy={11} r={7} />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onSearch}
              placeholder="Search challenges… (Enter)"
              style={{
                width: '100%',
                height: 38,
                padding: '0 14px 0 38px',
                border: `1px solid ${COLOR.hairline}`,
                borderRadius: 10,
                background: COLOR.hover,
                fontFamily: 'inherit',
                fontSize: 13.5,
                color: COLOR.ink,
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }} />

          {/* Mobile-only search icon — opens the search-overlay. */}
          <button
            className="r-icon-btn r-search-btn"
            data-search-toggle
            aria-label="Search"
            type="button"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={11} cy={11} r={7} />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Notifications */}
          <HoverButton
            onClick={() => router.push('/notifications')}
            ariaLabel="Notifications"
            style={{
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 10,
              border: `1px solid ${COLOR.hairline}`,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: COLOR.textDim,
            }}
            hoverStyle={{ background: COLOR.hover }}
          >
            <svg {...stroke}>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  minWidth: 17,
                  height: 17,
                  padding: '0 4px',
                  borderRadius: 9,
                  background: COLOR.violet,
                  color: '#fff',
                  fontFamily: FONT_MONO,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </HoverButton>

          {/* User chip */}
          {user ? (
            <button
              type="button"
              className="app-acct"
              onClick={() => router.push('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingLeft: 18,
                borderLeft: `1px solid ${COLOR.hairline}`,
                height: 38,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: COLOR.ink,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {avatarInitial}
              </div>
              <div className="app-acct-name" style={{ lineHeight: 1.1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLOR.ink }}>{userName}</div>
              </div>
              <span className="app-tier-chip"><TierBadge tier={tier} /></span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/login')}
              style={{
                height: 38,
                padding: '0 18px',
                border: 'none',
                borderRadius: 10,
                background: COLOR.ink,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
          )}
        </header>

        {/* Scroll content */}
        <main style={{ flex: 1, overflowY: 'auto', background: COLOR.paper }}>{children}</main>
      </div>
    </div>
  );
}
