'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  prefix?: string;
  count?: number;
}

const BASE_NAV: NavItem[] = [
  { id: 'home',          label: 'Home',            icon: <Icon.home />,      path: '/company' },
  { id: 'talent',        label: 'Talent Search',   icon: <Icon.search />,    path: '/company/talent',        prefix: '/company/talent' },
  { id: 'jobs',          label: 'Job Postings',    icon: <Icon.briefcase />, path: '/company/jobs',          prefix: '/company/jobs' },
  { id: 'shortlist',     label: 'Shortlists',      icon: <Icon.target />,    path: '/company/shortlists' },
  { id: 'hires',         label: 'Hires & Billing', icon: <Icon.trophy />,    path: '/company/hires' },
  { id: 'notifications', label: 'Notifications',   icon: <Icon.bell />,      path: '/company/notifications', prefix: '/company/notifications' },
  { id: 'profile',       label: 'Company Profile', icon: <Icon.user />,      path: '/company/profile' },
  { id: 'settings',      label: 'Settings',        icon: <Icon.settings />,  path: '/company/settings' },
];

export function CompanyShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();

  // Anonymous visit to /company → let the marketing view render full-bleed without the company sidebar.
  if (!user && pathname === '/company') {
    return <>{children}</>;
  }

  const [unreadCount, setUnreadCount] = useState(0);
  const [topbarSearch, setTopbarSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    api.notifications.listMine(true).then((r) => setUnreadCount(r.items.length)).catch(() => {});
  }, [user]);

  const companyName = user?.companyMemberships?.[0]?.company?.name ?? '';
  const displayRole = user?.companyMemberships?.[0]?.companyRole
    ? (user.companyMemberships[0].companyRole.charAt(0) + user.companyMemberships[0].companyRole.slice(1).toLowerCase())
    : 'Member';

  const NAV: NavItem[] = BASE_NAV.map((n) =>
    n.id === 'notifications' && unreadCount > 0 ? { ...n, count: unreadCount } : n,
  );

  const isActive = (n: NavItem) =>
    n.prefix ? pathname.startsWith(n.prefix) : pathname === n.path;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside
        style={{
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border-soft)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '6px 8px 18px' }}>
          <Logo size={20} />
        </div>
        {/* Company switcher */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, oklch(0.55 0.15 240), oklch(0.45 0.12 200))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
              fontSize: 13,
            }}
          >
            {companyName
              ? companyName.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
              : 'CO'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {companyName || 'Your Company'}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{displayRole}</div>
          </div>
          <Icon.chevDown />
        </div>
        {NAV.map((n) => {
          const active = isActive(n);
          return (
            <button
              key={n.id}
              onClick={() => router.push(n.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'color-mix(in oklch, var(--cool) 18%, transparent)' : 'transparent',
                color: active ? 'var(--cool)' : 'var(--text-dim)',
                fontSize: 13.5,
                fontWeight: 500,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {n.icon}
              {n.label}
              {n.count ? (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    borderRadius: 999,
                    background: 'var(--d-expert)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    boxSizing: 'border-box',
                  }}
                >
                  {n.count > 9 ? '9+' : n.count}
                </span>
              ) : null}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ padding: 10, fontSize: 11, color: 'var(--text-mute)' }}>
          <div>Plan: <strong style={{ color: 'var(--text)' }}>Growth</strong></div>
          <div>5 / 5 active postings used</div>
          <a style={{ color: 'var(--cool)', fontSize: 11.5, marginTop: 4, display: 'inline-block', cursor: 'pointer' }}>Upgrade to Scale →</a>
        </div>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            marginTop: 4,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-dim)',
            fontSize: 13.5,
            fontWeight: 500,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </aside>
      <main style={{ overflow: 'auto' }}>
        {/* Topbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 32px',
            borderBottom: '1px solid var(--border-soft)',
            background: 'var(--bg)',
            position: 'sticky',
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ position: 'relative', flex: '0 1 420px' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)' }}>
              <Icon.search />
            </span>
            <input
              value={topbarSearch}
              onChange={(e) => setTopbarSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && topbarSearch.trim()) {
                  router.push(`/company/talent?q=${encodeURIComponent(topbarSearch.trim())}`);
                }
              }}
              placeholder="Search talent by name… (Enter)"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 9,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => router.push('/company/notifications')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', position: 'relative' }}
              title="Notifications"
            >
              <Icon.bell />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 999,
                  background: 'var(--d-expert)', color: 'white',
                  fontSize: 9, fontWeight: 700, lineHeight: '16px',
                  textAlign: 'center', padding: '0 3px',
                  boxSizing: 'border-box',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 4px 4px', background: 'var(--bg-2)', borderRadius: 999, border: '1px solid var(--border)' }}>
              <Avatar name={user?.name ?? companyName ?? 'Co'} size={28} color="oklch(0.55 0.14 220)" />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                {user?.name?.split(' ')[0] ?? 'User'} · {displayRole}
              </span>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
