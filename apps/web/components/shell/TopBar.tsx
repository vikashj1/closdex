'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/lib/auth';
import { api, NotificationItem } from '@/lib/api';
import { rankFromEnum } from '@/lib/constants';

const APP_NAV_ITEMS = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Challenges', href: '/challenges' },
  { label: 'My Attempts', href: '/attempts' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Learn', href: '/learn' },
  { label: 'My Disputes', href: '/disputes' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Applications', href: '/applications' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
];

const PUBLIC_APP_NAV_ITEMS = [
  { label: 'Challenges', href: '/challenges' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Learn', href: '/learn' },
  { label: 'Jobs', href: '/jobs' },
];

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [topbarSearch, setTopbarSearch] = useState('');
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api.notifications.listMine().then((r) => setNotifs(r.items)).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!notifOpen) return;
    function onOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [notifOpen]);

  const unread = notifs.filter((n) => !n.read).length;

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await api.notifications.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkOne(id: string) {
    await api.notifications.markRead(id).catch(() => {});
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  const sp = user?.salesperson;
  const rank = sp ? rankFromEnum(sp.rank) : 'Rookie';
  const displayName = user?.name?.split(' ')[0] ?? '—';

  return (
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
              router.push(`/challenges?q=${encodeURIComponent(topbarSearch.trim())}`);
              setTopbarSearch('');
            }
          }}
          placeholder="Search challenges… (Enter)"
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
        <MobileNav
          items={(user ? APP_NAV_ITEMS : PUBLIC_APP_NAV_ITEMS).map((i) => ({ ...i }))}
          primaryCtaLabel={!user ? 'Sign up' : undefined}
          primaryCtaHref={!user ? '/signup' : undefined}
          secondaryCtaLabel={!user ? 'Log in' : undefined}
          secondaryCtaHref={!user ? '/login' : undefined}
          go={(href) => router.push(href)}
          onLogout={user ? () => { logout(); router.push('/login'); } : undefined}
        />
        {!user ? (
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--cool)',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          </div>
        ) : (
          <>
        {/* Notification bell */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', position: 'relative', cursor: 'pointer', padding: 4 }}
          >
            <Icon.bell />
            {unread > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 999,
                  background: 'var(--d-expert)',
                  border: '2px solid var(--bg)',
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 340,
                background: 'var(--surface)',
                border: '1px solid var(--border-soft)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                overflow: 'hidden',
                zIndex: 99,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px', borderBottom: '1px solid var(--border-soft)' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>Notifications</span>
                {unread > 0 && (
                  <button
                    disabled={markingAll}
                    onClick={handleMarkAll}
                    style={{ background: 'none', border: 'none', fontSize: 11.5, color: 'var(--cool)', cursor: 'pointer', opacity: markingAll ? 0.5 : 1 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 12.5, color: 'var(--text-mute)' }}>
                    You're all caught up.
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkOne(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-soft)',
                        background: n.read ? 'transparent' : 'color-mix(in oklch, var(--cool) 5%, transparent)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--cool)', marginTop: 5, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.title}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 4 }}>
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          onClick={() => router.push('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 4px 4px',
            background: 'var(--bg-2)',
            borderRadius: 999,
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <Avatar name={user?.name ?? '?'} size={28} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{displayName}</span>
          <RankBadge rank={rank} size={16} />
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
