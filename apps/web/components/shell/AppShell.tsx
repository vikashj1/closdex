'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { TopBar } from './TopBar';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  /** Active when the URL starts with this prefix. Defaults to exact `path` match. */
  prefix?: string;
  soon?: boolean;
  count?: number;
}

const BASE_NAV: NavItem[] = [
  { id: 'home',          label: 'Home',          icon: <Icon.home />,      path: '/dashboard' },
  { id: 'challenges',    label: 'Challenges',    icon: <Icon.bolt />,      path: '/challenges',    prefix: '/challenges' },
  { id: 'attempts',      label: 'My Attempts',   icon: <Icon.clock />,     path: '/attempts',      prefix: '/attempts' },
  { id: 'leaderboard',   label: 'Leaderboard',   icon: <Icon.trophy />,    path: '/leaderboard' },
  { id: 'learn',         label: 'Learn',         icon: <Icon.book />,      path: '/learn',         prefix: '/learn' },
  { id: 'disputes',      label: 'My Disputes',   icon: <Icon.flag />,      path: '/disputes',      prefix: '/disputes' },
  { id: 'jobs',          label: 'Jobs',          icon: <Icon.briefcase />, path: '/jobs' },
  { id: 'applications',  label: 'Applications',  icon: <Icon.fileText />,  path: '/applications' },
  { id: 'notifications', label: 'Notifications', icon: <Icon.bell />,      path: '/notifications', prefix: '/notifications' },
  { id: 'profile',       label: 'Profile',       icon: <Icon.user />,      path: '/profile' },
  { id: 'settings',      label: 'Settings',      icon: <Icon.settings />,  path: '/settings' },
];

/** Sidebar + topbar shell for authenticated salesperson screens. Lives in
 *  app/(app)/layout.tsx so every route under `(app)` inherits it. */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user, logout } = useAuth();
  const streak = user?.salesperson?.currentStreakDays ?? 0;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    api.notifications.listMine(true).then((r) => setUnreadCount(r.items.length)).catch(() => {});
  }, [user]);

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
        {NAV.map((n) => {
          const active = isActive(n);
          return (
            <button
              key={n.id}
              onClick={() => !n.soon && router.push(n.path)}
              disabled={n.soon}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active ? 'color-mix(in oklch, var(--gold) 15%, transparent)' : 'transparent',
                color: active ? 'var(--gold)' : n.soon ? 'var(--text-mute)' : 'var(--text-dim)',
                fontSize: 13.5,
                fontWeight: 500,
                textAlign: 'left',
                cursor: n.soon ? 'not-allowed' : 'pointer',
                opacity: n.soon ? 0.55 : 1,
              }}
            >
              {n.icon}
              {n.label}
              {n.soon && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: 'var(--surface-2)',
                  }}
                >
                  SOON
                </span>
              )}
              {!n.soon && n.count ? (
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
        <Card
          padding={14}
          style={{
            background: 'color-mix(in oklch, var(--gold) 10%, var(--surface))',
            borderColor: 'color-mix(in oklch, var(--gold) 30%, transparent)',
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--gold)',
              fontWeight: 600,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon.fire /> {streak > 0 ? `${streak}-day streak` : 'Start a streak'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.45 }}>
            {streak > 0
              ? 'Complete 1 challenge today to keep your streak alive.'
              : 'Complete a challenge today to start your streak.'}
          </div>
        </Card>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 12px',
            marginTop: 8,
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
        <TopBar />
        {children}
      </main>
    </div>
  );
}
