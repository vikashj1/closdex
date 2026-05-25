'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
  prefix?: string;
  count?: number;
}

const NAV: NavItem[] = [
  { id: 'home',      label: 'Home',            icon: <Icon.home />,      path: '/company' },
  { id: 'talent',    label: 'Talent Search',   icon: <Icon.search />,    path: '/company/talent',     prefix: '/company/talent' },
  { id: 'jobs',      label: 'Job Postings',    icon: <Icon.briefcase />, path: '/company/jobs',       prefix: '/company/jobs' },
  { id: 'shortlist', label: 'Shortlists',      icon: <Icon.target />,    path: '/company/shortlists', count: 12 },
  { id: 'hires',     label: 'Hires & Billing', icon: <Icon.trophy />,    path: '/company/hires' },
  { id: 'profile',   label: 'Company Profile', icon: <Icon.user />,      path: '/company/profile' },
  { id: 'settings',  label: 'Settings',        icon: <Icon.settings />,  path: '/company/settings' },
];

export function CompanyShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user } = useAuth();

  const companyName = user?.companyMemberships?.[0]?.company?.name ?? '';
  const displayRole = user?.companyMemberships?.[0]?.companyRole
    ? (user.companyMemberships[0].companyRole.charAt(0) + user.companyMemberships[0].companyRole.slice(1).toLowerCase())
    : 'Member';

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
            RP
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Razorpay
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>Growth · ₹14,999/mo</div>
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
              {n.count && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'var(--surface-2)',
                    color: 'var(--text-dim)',
                  }}
                >
                  {n.count}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ padding: 10, fontSize: 11, color: 'var(--text-mute)' }}>
          <div>Plan: <strong style={{ color: 'var(--text)' }}>Growth</strong></div>
          <div>5 / 5 active postings used</div>
          <a style={{ color: 'var(--cool)', fontSize: 11.5, marginTop: 4, display: 'inline-block', cursor: 'pointer' }}>Upgrade to Scale →</a>
        </div>
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
              placeholder="Search talent by skill, rank, location…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 9,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--text)',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => router.push('/company/notifications')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              title="Notifications"
            >
              <Icon.bell />
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
