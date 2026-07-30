'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth, useRequireAuth } from '@/lib/auth';

interface NavItem {
  id: string;
  label: string;
  path: string;
  prefix?: string;
}

const NAV: NavItem[] = [
  { id: 'overview',     label: 'Overview',     path: '/admin',                  },
  { id: 'challenges',   label: 'Challenges',   path: '/admin/challenges',       prefix: '/admin/challenges' },
  { id: 'personas',     label: 'Personas',     path: '/admin/personas',         prefix: '/admin/personas' },
  { id: 'disputes',     label: 'Disputes',     path: '/admin/disputes',         prefix: '/admin/disputes' },
  { id: 'quarantine',   label: 'Quarantine',   path: '/admin/quarantine',       prefix: '/admin/quarantine' },
  { id: 'verification', label: 'Verification', path: '/admin/verification',     prefix: '/admin/verification' },
  { id: 'badges',       label: 'Badges',       path: '/admin/badges',           prefix: '/admin/badges' },
  { id: 'learning',     label: 'Learning',     path: '/admin/learning',         prefix: '/admin/learning' },
  { id: 'audit',        label: 'Audit Log',    path: '/admin/audit',            prefix: '/admin/audit' },
  { id: 'config',       label: 'Config',       path: '/admin/config',           prefix: '/admin/config' },
  { id: 'flags',        label: 'Feature flags',path: '/admin/feature-flags',    prefix: '/admin/feature-flags' },
  { id: 'llm-usage',    label: 'LLM usage',    path: '/admin/llm-usage',        prefix: '/admin/llm-usage' },
  { id: 'moderation',   label: 'Moderation',   path: '/admin/moderation',       prefix: '/admin/moderation' },
  { id: 'users',        label: 'Users',        path: '/admin/users',            prefix: '/admin/users' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  useRequireAuth('ADMIN');
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const isActive = (n: NavItem) => {
    if (n.prefix) return pathname.startsWith(n.prefix);
    return pathname === n.path;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', minHeight: '100vh' }}>
      <aside
        style={{
          background: 'var(--bg-2)',
          borderRight: '1px solid var(--border-soft)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '6px 8px 20px' }}>
          <Logo size={18} />
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
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: active
                  ? 'color-mix(in oklch, var(--gold) 15%, transparent)'
                  : 'transparent',
                color: active ? 'var(--gold)' : 'var(--text-dim)',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {n.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <div
          style={{
            margin: '8px 4px 0',
            padding: '6px 10px',
            borderRadius: 6,
            background: 'color-mix(in oklch, var(--gold) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--gold) 25%, transparent)',
            fontSize: 10.5,
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          ADMIN
        </div>
        <button
          onClick={() => logout('/login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            marginTop: 8,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-dim)',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'left',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </aside>

      <main data-resp="admin" style={{ overflow: 'auto' }}>{children}</main>
    </div>
  );
}
