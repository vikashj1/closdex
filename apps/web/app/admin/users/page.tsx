'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, AdminUser } from '@/lib/api';
import { rankFromEnum } from '@/lib/constants';

const ROLES = ['', 'SALESPERSON', 'COMPANY', 'ADMIN'] as const;
const ROLE_COLORS: Record<string, string> = {
  SALESPERSON: 'var(--gold)',
  COMPANY: 'var(--cool)',
  ADMIN: 'var(--d-expert)',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const perPage = 25;

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await api.admin.users({
        search: search || undefined,
        role: roleFilter || undefined,
        page: p,
        perPage,
      });
      setUsers(res.items);
      setTotal(res.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(1); }, [search, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRoleChange(userId: string, newRole: string) {
    setChangingRole(userId);
    try {
      await api.admin.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as AdminUser['role'] } : u));
    } finally {
      setChangingRole(null);
    }
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Users</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>
          {total} total users
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email…"
          style={{
            flex: '0 1 320px',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-2)',
            color: 'var(--text)',
            fontSize: 13,
          }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-2)',
            color: 'var(--text)',
            fontSize: 13,
          }}
        >
          <option value="">All roles</option>
          <option value="SALESPERSON">Salesperson</option>
          <option value="COMPANY">Company</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <Card padding={0}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px 130px 120px 100px',
          padding: '11px 18px',
          fontSize: 11,
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          fontWeight: 600,
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <div>User</div><div>Email</div><div>Role</div><div>Points / Rank</div><div>Joined</div>
        </div>

        {loading && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            Loading…
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            No users found.
          </div>
        )}

        {!loading && users.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 200px 130px 120px 100px',
              padding: '11px 18px',
              alignItems: 'center',
              borderBottom: i < users.length - 1 ? '1px solid var(--border-soft)' : 'none',
              background: 'transparent',
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href={`/admin/users/${u.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {u.name}
              </Link>
              {u.bannedAt && (
                <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, background: 'var(--d-expert)', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>
                  BANNED
                </span>
              )}
              {u.deletedAt && (
                <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, background: '#666', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>
                  DELETED
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.email}
            </div>
            <div>
              <select
                value={u.role}
                disabled={changingRole === u.id}
                onChange={e => handleRoleChange(u.id, e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid color-mix(in oklch, ${ROLE_COLORS[u.role] ?? 'var(--border)'} 40%, var(--border-soft))`,
                  background: `color-mix(in oklch, ${ROLE_COLORS[u.role] ?? 'var(--bg-2)'} 12%, var(--bg-2))`,
                  color: ROLE_COLORS[u.role] ?? 'var(--text)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {ROLES.filter(Boolean).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              {u.salesperson
                ? `${u.salesperson.totalPoints.toLocaleString()} · ${rankFromEnum(u.salesperson.rank)}`
                : '—'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
              {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
            </div>
          </div>
        ))}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <Btn kind="ghost" size="sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Prev</Btn>
          <span style={{ fontSize: 13, color: 'var(--text-mute)', alignSelf: 'center' }}>
            Page {page} of {totalPages}
          </span>
          <Btn kind="ghost" size="sm" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next →</Btn>
        </div>
      )}
    </div>
  );
}
