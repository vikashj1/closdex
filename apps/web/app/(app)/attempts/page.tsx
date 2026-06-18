'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttemptDetail, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

// My Attempts — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML wired to real data (slice 24 redux).

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'QUARANTINED';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL',         label: 'All'         },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED',   label: 'Completed'   },
  { key: 'ABANDONED',   label: 'Abandoned'   },
  { key: 'QUARANTINED', label: 'Quarantined' },
];

const DIFFICULTY_DOT: Record<string, { color: string; label: string }> = {
  ROOKIE: { color: '#6D9A4E', label: 'Rookie' },
  EASY:   { color: '#6D9A4E', label: 'Easy'   },
  MEDIUM: { color: '#CC7E55', label: 'Medium' },
  HARD:   { color: '#C2604A', label: 'Hard'   },
  EXPERT: { color: '#A93F37', label: 'Expert' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function matchesFilter(a: AttemptDetail, f: StatusFilter): boolean {
  if (f === 'ALL') return true;
  if (f === 'QUARANTINED') return Boolean(a.quarantined);
  // Quarantined attempts are surfaced under the QUARANTINED filter only — keep
  // them out of the COMPLETED bucket so points don't appear to "leak".
  if (a.quarantined) return false;
  return a.status === f;
}

const GRID = '1fr 120px 150px 100px 96px 90px';

export default function AttemptsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.attempts.listMine()
      .then((rows) => {
        if (cancelled) return;
        const sorted = [...rows].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
        );
        setAttempts(sorted);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load attempts.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const counts = useMemo(() => ({
    ALL:         attempts.length,
    IN_PROGRESS: attempts.filter((a) => matchesFilter(a, 'IN_PROGRESS')).length,
    COMPLETED:   attempts.filter((a) => matchesFilter(a, 'COMPLETED')).length,
    ABANDONED:   attempts.filter((a) => matchesFilter(a, 'ABANDONED')).length,
    QUARANTINED: attempts.filter((a) => matchesFilter(a, 'QUARANTINED')).length,
  }), [attempts]);

  const filtered = useMemo(() => {
    let rows = attempts.filter((a) => matchesFilter(a, statusFilter));
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter((a) => a.challenge.title.toLowerCase().includes(q));
    return rows;
  }, [attempts, statusFilter, search]);

  const stats = useMemo(() => {
    const completed = attempts.filter(
      (a) => a.status === 'COMPLETED' && !a.quarantined,
    );
    const totalPts = completed.reduce((s, a) => s + (a.pointsAwarded ?? 0), 0);
    const scored = completed.filter((a) => a.score != null);
    const avg = scored.length
      ? Math.round(scored.reduce((s, a) => s + (a.score ?? 0), 0) / scored.length)
      : null;
    return {
      total:     attempts.length,
      completed: completed.length,
      totalPts,
      avgScore:  avg,
    };
  }, [attempts]);

  function handleRowClick(a: AttemptDetail) {
    if (a.quarantined) {
      router.push(`/app/challenges/${a.challenge.id}/result?attempt=${a.id}`);
      return;
    }
    if (a.status === 'IN_PROGRESS') {
      router.push(`/play/${a.id}`);
    } else if (a.status === 'COMPLETED') {
      router.push(`/app/challenges/${a.challenge.id}/result?attempt=${a.id}`);
    } else {
      router.push(`/app/challenges/${a.challenge.id}`);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>

        <div style={{ marginBottom: '34px' }}>
          <h1 style={{ margin: '0', fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '33px', letterSpacing: '-0.03em', lineHeight: '1.05', color: '#0B0B0F' }}>My Attempts</h1>
          <p style={{ margin: '9px 0 0', fontSize: '15px', color: '#7A7A86' }}>Full history of your challenge attempts.</p>
        </div>

        <section style={{ display: 'flex', alignItems: 'stretch', gap: '34px', padding: '24px 0 30px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', marginBottom: '34px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '34px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '42px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>{stats.total}</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '9px' }}>Total attempts</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '34px' }}>
            <div style={{ width: '1px', background: '#E7E7EC' }}></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '42px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>{stats.completed}</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '9px' }}>Completed</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '34px' }}>
            <div style={{ width: '1px', background: '#E7E7EC' }}></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '42px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#F5A524' }}>{stats.totalPts.toLocaleString()}</span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '9px' }}>Points earned</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '34px' }}>
            <div style={{ width: '1px', background: '#E7E7EC' }}></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '42px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>{stats.avgScore ?? '—'}</span>
                {stats.avgScore != null && (
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '600', fontSize: '18px', color: '#B6B6C0' }}>/100</span>
                )}
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '9px' }}>Avg score</div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
            {STATUS_FILTERS.map(({ key, label }) => {
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '10px 2px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: active ? '#0B0B0F' : '#7A7A86',
                    boxShadow: active ? 'inset 0 -2px 0 #0B0B0F' : 'none',
                  }}
                >
                  {label}
                  {key !== 'ALL' && (
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: '700', color: '#B6B6C0' }}>
                      {counts[key]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div style={{ position: 'relative', width: '250px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attempts…"
              style={{ width: '100%', height: '36px', padding: '0 12px 0 35px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#FAFAF8', fontFamily: 'Inter,sans-serif', fontSize: '13px', color: '#0B0B0F', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: '20px', alignItems: 'center', padding: '0 4px 12px', borderBottom: '1px solid #E7E7EC' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Challenge</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Difficulty</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Status</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4', textAlign: 'right' }}>Points</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4', textAlign: 'right' }}>Score</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4', textAlign: 'right' }}>Date</div>
          </div>

          {loading ? (
            <div style={{ padding: '56px 4px', textAlign: 'center', fontSize: '14px', color: '#7A7A86' }}>
              Loading attempts…
            </div>
          ) : error ? (
            <div style={{ padding: '56px 4px', textAlign: 'center', fontSize: '14px', color: '#A93F37' }}>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '56px 4px', textAlign: 'center', fontSize: '14px', color: '#7A7A86' }}>
              {attempts.length === 0
                ? 'No attempts yet — start a challenge to see it here.'
                : search.trim()
                  ? `No attempts match "${search.trim()}".`
                  : 'No attempts match this filter.'}
            </div>
          ) : (
            filtered.map((a, i) => {
              const isLast = i === filtered.length - 1;
              const diff = DIFFICULTY_DOT[a.challenge.difficulty] ?? DIFFICULTY_DOT.EASY;
              const isQuarantined = Boolean(a.quarantined);
              const isInProgress = a.status === 'IN_PROGRESS';
              const isCompleted = a.status === 'COMPLETED' && !isQuarantined;
              const isAbandoned = a.status === 'ABANDONED';
              const points = a.pointsAwarded ?? 0;
              return (
                <div
                  key={a.id}
                  onClick={() => handleRowClick(a)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(a);
                    }
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    gap: '20px',
                    alignItems: 'center',
                    padding: '17px 4px',
                    borderBottom: isLast ? 'none' : '1px solid #E7E7EC',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0F', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.challenge.title}
                    <span style={{ marginLeft: '8px', fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', color: '#B6B6C0' }}>
                      #{a.attemptNumber} · {a.messagesUsed}/{a.challenge.maxMessages} msgs
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#3A3A44' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: diff.color, display: 'inline-block' }}></span>
                    {diff.label}
                  </div>
                  <div>
                    {isQuarantined ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#A93F37' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A93F37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>
                        Quarantined
                      </span>
                    ) : isCompleted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#0B0B0F' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        Done
                      </span>
                    ) : isInProgress ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#F5A524' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5A524" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        In progress
                      </span>
                    ) : isAbandoned ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#9A9AA4' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        Abandoned
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: '#9A9AA4' }}>
                        {a.status}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: "'Space Mono',monospace", fontSize: '13px', fontWeight: '700', color: points > 0 ? '#F5A524' : '#C2C2CC' }}>
                    {points > 0 ? `+${points}` : '—'}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: "'Space Mono',monospace", fontSize: '13px', color: '#0B0B0F' }}>
                    {a.score != null ? (
                      <>
                        <span style={{ fontWeight: '700' }}>{a.score}</span>
                        <span style={{ color: '#B6B6C0' }}>/100</span>
                      </>
                    ) : (
                      <span style={{ color: '#C2C2CC' }}>—</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: "'Space Mono',monospace", fontSize: '12px', color: '#7A7A86' }}>
                    {fmtDate(a.completedAt ?? a.startedAt)}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
