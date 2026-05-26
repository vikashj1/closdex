'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { AttemptDetail, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { difficultyFromEnum } from '@/lib/constants';

type StatusFilter = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',         label: 'All'         },
  { key: 'COMPLETED',   label: 'Completed'   },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'ABANDONED',   label: 'Abandoned'   },
];

const STATUS_COLOR: Record<string, string> = {
  COMPLETED:   'var(--emerald)',
  IN_PROGRESS: 'var(--cool)',
  ABANDONED:   'var(--text-mute)',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function AttemptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    api.attempts.listMine()
      .then((a) => { setAttempts(a); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let result = statusFilter === 'ALL' ? attempts : attempts.filter((a) => a.status === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    if (q) result = result.filter((a) => a.challenge.title.toLowerCase().includes(q));
    return result;
  }, [attempts, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: attempts.length,
    completed: attempts.filter((a) => a.status === 'COMPLETED').length,
    totalPts: attempts.reduce((s, a) => s + (a.pointsAwarded ?? 0), 0),
    avgScore: (() => {
      const scored = attempts.filter((a) => a.score != null && a.status === 'COMPLETED');
      return scored.length ? Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length) : 0;
    })(),
  }), [attempts]);

  if (authLoading || !user) return null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Attempts</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Full history of your challenge attempts
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total attempts', value: stats.total,     color: 'var(--text)' },
          { label: 'Completed',      value: stats.completed, color: 'var(--emerald)' },
          { label: 'Points earned',  value: stats.totalPts.toLocaleString(), color: 'var(--gold)' },
          { label: 'Avg score',      value: stats.avgScore ? `${stats.avgScore}/100` : '—', color: 'var(--cool)' },
        ].map((s) => (
          <Card key={s.label} padding={16}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {s.label}
            </div>
            <div className="display mono" style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search by challenge title…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '8px 30px 8px 12px', borderRadius: 8,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--text)', boxSizing: 'border-box',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 0 }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 18, borderBottom: '1px solid var(--border-soft)' }}>
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            style={{
              padding: '8px 18px', border: 'none',
              borderBottom: statusFilter === key ? '2px solid var(--gold)' : '2px solid transparent',
              background: 'transparent',
              color: statusFilter === key ? 'var(--gold)' : 'var(--text-dim)',
              fontSize: 13, fontWeight: statusFilter === key ? 700 : 500,
              cursor: 'pointer', marginBottom: -1,
            }}
          >
            {label}
            {key !== 'ALL' && (
              <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-mute)' }}>
                ({attempts.filter((a) => a.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-mute)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-mute)' }}>
          {searchQuery
            ? `No attempts match "${searchQuery}".`
            : statusFilter === 'ALL'
              ? 'No attempts yet. Start a challenge!'
              : `No ${statusFilter.toLowerCase().replace('_', ' ')} attempts.`}
        </div>
      ) : (
        <Card padding={0}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px 90px 80px',
            padding: '10px 18px', fontSize: 11, fontWeight: 600,
            color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em',
            borderBottom: '1px solid var(--border-soft)',
          }}>
            <div>Challenge</div><div>Difficulty</div><div>Status</div>
            <div>Points</div><div>Score</div><div>Date</div>
          </div>

          {filtered.map((a, i) => {
            const level = difficultyFromEnum(a.challenge.difficulty);
            const color = STATUS_COLOR[a.status] ?? 'var(--text-mute)';
            const isLast = i === filtered.length - 1;
            return (
              <div
                key={a.id}
                onClick={() => a.status === 'COMPLETED' && router.push(`/challenges/${a.challenge.id}/result?attempt=${a.id}`)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 80px 90px 90px 80px',
                  padding: '12px 18px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
                  cursor: a.status === 'COMPLETED' ? 'pointer' : 'default',
                  background: 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (a.status === 'COMPLETED') (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.challenge.title}
                </div>
                <div><DifficultyTag level={level} size="sm" /></div>
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    background: `color-mix(in oklch, ${color} 14%, transparent)`,
                    color, border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
                  }}>
                    {a.status === 'IN_PROGRESS' ? 'Active' : a.status === 'COMPLETED' ? 'Done' : 'Abandoned'}
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: (a.pointsAwarded ?? 0) > 0 ? 'var(--gold)' : 'var(--text-mute)' }}>
                  {(a.pointsAwarded ?? 0) > 0 ? `+${a.pointsAwarded}` : '—'}
                </div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                  {a.score != null ? `${a.score}/100` : '—'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                  {fmtDate(a.startedAt)}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
