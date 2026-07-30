'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, AdminUserDetail, AdminUserAttemptRow, ApiError, tokenStore } from '@/lib/api';

const ROLE_COLORS: Record<string, string> = {
  SALESPERSON: 'var(--gold)',
  COMPANY: 'var(--cool)',
  ADMIN: 'var(--d-expert)',
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [attempts, setAttempts] = useState<AdminUserAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [u, a] = await Promise.all([
        api.admin.userDetail(id),
        api.admin.userAttempts(id, 1, 20),
      ]);
      setUser(u);
      setAttempts(a.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function guarded(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  }

  async function handleBan() {
    const reason = window.prompt('Reason for ban (optional):') ?? undefined;
    await guarded('ban', () => api.admin.banUser(id, reason || undefined));
  }

  async function handleUnban() {
    await guarded('unban', () => api.admin.unbanUser(id));
  }

  async function handleDelete() {
    if (!window.confirm(`Soft-delete ${user?.email}? Their account will be locked and email anonymized. This cannot be undone from the UI.`)) return;
    await guarded('delete', () => api.admin.softDeleteUser(id));
  }

  async function handleAdjustPoints() {
    const raw = window.prompt('Points delta (positive = grant, negative = clawback):');
    if (!raw) return;
    const delta = parseInt(raw, 10);
    if (!Number.isInteger(delta) || delta === 0) {
      setError('Delta must be a non-zero integer.');
      return;
    }
    const reason = window.prompt('Reason (shown in audit log):') ?? undefined;
    await guarded('points', () => api.admin.adjustUserPoints(id, delta, reason || undefined));
  }

  async function handleImpersonate() {
    if (!window.confirm(`Log in as ${user?.name} (${user?.email})? Your admin session will be paused — use "Exit impersonation" to return.`)) return;
    setBusy('impersonate');
    setError(null);
    try {
      const res = await api.admin.impersonateUser(id);
      // Stash the admin token so the impersonation banner can offer an exit.
      const originalToken = tokenStore.get();
      if (originalToken) localStorage.setItem('closdex.token.orig', originalToken);
      tokenStore.set(res.accessToken);
      // Full page nav — same reason as logout: nuke React tree + Next.js
      // client cache so nothing leaks from admin state into the impersonated
      // session.
      window.location.href = res.user.role === 'COMPANY' ? '/company' : '/dashboard';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impersonate failed.');
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 36px', color: 'var(--text-mute)' }}>Loading user…</div>
    );
  }
  if (!user) {
    return (
      <div style={{ padding: '32px 36px', color: 'var(--d-expert)' }}>
        {error ?? 'User not found.'}
      </div>
    );
  }

  const isBanned = !!user.bannedAt;
  const isDeleted = !!user.deletedAt;
  const roleColor = ROLE_COLORS[user.role] ?? 'var(--text-dim)';

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1180 }}>
      {/* Back link */}
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/users" style={{ color: 'var(--text-mute)', fontSize: 12.5, textDecoration: 'none' }}>
          ← All users
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, marginBottom: 24 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
          {(user.name?.[0] ?? '?').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{user.name}</h1>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: roleColor, color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>
              {user.role}
            </span>
            {isBanned && (
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--d-expert)', color: '#fff', fontWeight: 700 }}>
                BANNED
              </span>
            )}
            {isDeleted && (
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#666', color: '#fff', fontWeight: 700 }}>
                DELETED
              </span>
            )}
          </div>
          <div style={{ marginTop: 4, color: 'var(--text-dim)', fontSize: 13 }}>
            {user.email} · id {user.id} · joined {new Date(user.createdAt).toLocaleDateString()}
          </div>
          {user.bannedReason && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(var(--d-expert-rgb, 169,63,55),0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
              Ban reason: {user.bannedReason}
            </div>
          )}
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        {!isBanned && !isDeleted && (
          <Btn onClick={handleBan} kind="secondary" disabled={busy !== null}>
            {busy === 'ban' ? 'Banning…' : 'Ban user'}
          </Btn>
        )}
        {isBanned && (
          <Btn onClick={handleUnban} kind="secondary" disabled={busy !== null}>
            {busy === 'unban' ? 'Unbanning…' : 'Unban'}
          </Btn>
        )}
        <Btn onClick={handleImpersonate} kind="secondary" disabled={busy !== null || isBanned || isDeleted || user.role === 'ADMIN'}>
          {busy === 'impersonate' ? 'Switching…' : 'Impersonate'}
        </Btn>
        {user.salesperson && (
          <Btn onClick={handleAdjustPoints} kind="secondary" disabled={busy !== null}>
            {busy === 'points' ? 'Adjusting…' : 'Adjust points'}
          </Btn>
        )}
        {!isDeleted && (
          <Btn onClick={handleDelete} kind="secondary" disabled={busy !== null}>
            {busy === 'delete' ? 'Deleting…' : 'Soft-delete'}
          </Btn>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(200,50,50,0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      {user.salesperson && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, padding: '20px 24px' }}>
            <Stat label="Total points" value={user.salesperson.totalPoints.toLocaleString()} />
            <Stat label="Rank" value={user.salesperson.rank} />
            <Stat label="Streak" value={`${user.salesperson.currentStreakDays}d`} />
            <Stat label="Attempts" value={user.attemptsCount.toString()} />
          </div>
        </Card>
      )}

      {/* Companies (if applicable) */}
      {user.companyMemberships && user.companyMemberships.length > 0 && (
        <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-mute)', textTransform: 'uppercase', marginBottom: 10 }}>
            Company memberships
          </div>
          {user.companyMemberships.map((m) => (
            <div key={m.id} style={{ fontSize: 13, padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.company.name}</span>
              <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>{m.companyRole}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Attempts timeline */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Attempts</div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{attempts.length} shown</div>
        </div>
        {attempts.length === 0 ? (
          <div style={{ padding: '18px 0', color: 'var(--text-mute)', fontSize: 12.5 }}>
            No attempts yet.
          </div>
        ) : (
          <div>
            {attempts.map((a) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 14, padding: '10px 0', borderTop: '1px solid var(--border-soft)', alignItems: 'center', fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{a.challenge.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                    {a.challenge.difficulty.toLowerCase()} · {a.messagesUsed} msgs · started {new Date(a.startedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: a.status === 'COMPLETED' ? 'rgba(31,138,91,0.15)' : a.status === 'ABANDONED' ? 'rgba(150,150,150,0.15)' : 'rgba(91,75,245,0.15)', color: a.status === 'COMPLETED' ? '#1F8A5B' : a.status === 'ABANDONED' ? '#666' : '#5B4BF5' }}>
                  {a.status}
                </div>
                <div style={{ fontSize: 11, color: a.goalAchieved ? '#1F8A5B' : 'var(--text-mute)' }}>
                  {a.goalAchieved ? '✓ goal' : '—'}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: a.quarantined ? 'var(--d-expert)' : 'var(--gold)', minWidth: 60, textAlign: 'right' }}>
                  {a.quarantined ? 'QUAR' : a.finalScore ?? '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--text-mute)', textTransform: 'uppercase', marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
