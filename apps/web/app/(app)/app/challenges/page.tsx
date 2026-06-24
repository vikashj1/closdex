'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';
import { ApiError, api, type AttemptDetail, type ChallengeSummary } from '@/lib/api';

// Challenges - Vikash dashboard redesign 2026-06-16, wired 2026-06-18.
// Visual prototype preserved exactly; data is now fetched from the API.

type DiffFilter = 'All' | 'Rookie' | 'Easy' | 'Medium' | 'Hard' | 'Expert';

const DIFFICULTIES: { label: DiffFilter; enumValue: string | null; color: string }[] = [
  { label: 'All',    enumValue: null,      color: '#C2C2CC' },
  { label: 'Rookie', enumValue: 'ROOKIE',  color: '#4F9D6C' },
  { label: 'Easy',   enumValue: 'EASY',    color: '#6D9A4E' },
  { label: 'Medium', enumValue: 'MEDIUM',  color: '#CC7E55' },
  { label: 'Hard',   enumValue: 'HARD',    color: '#C2604A' },
  { label: 'Expert', enumValue: 'EXPERT',  color: '#A93F37' },
];

const DIFFICULTY_META: Record<ChallengeSummary['difficulty'], { label: DiffFilter; color: string }> = {
  ROOKIE: { label: 'Rookie', color: '#4F9D6C' },
  EASY:   { label: 'Easy',   color: '#6D9A4E' },
  MEDIUM: { label: 'Medium', color: '#CC7E55' },
  HARD:   { label: 'Hard',   color: '#C2604A' },
  EXPERT: { label: 'Expert', color: '#A93F37' },
};

const GOALS: { label: string; value: string }[] = [
  { label: 'Qualify',        value: 'QUALIFY_LEAD' },
  { label: 'Book call',      value: 'BOOK_DISCOVERY_CALL' },
  { label: 'Proposal',       value: 'SEND_PROPOSAL' },
  { label: 'Decision-maker', value: 'REACH_DECISION_MAKER' },
  { label: 'Close',          value: 'CLOSE_DEAL' },
  { label: 'Win-back',       value: 'WIN_BACK' },
];

function formatGoalLabel(goalType: string): string {
  // SEND_PROPOSAL -> "Send proposal"
  const lower = goalType.replace(/_/g, ' ').toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function ChallengesPage() {
  const { loading: authLoading } = useRequireAuth('SALESPERSON');
  const router = useRouter();

  const [items, setItems] = useState<ChallengeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [inProgressMap, setInProgressMap] = useState<Map<string, string>>(new Map());

  const [diff, setDiff] = useState<DiffFilter>('All');
  const [goalFilter, setGoalFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  // Filter rail is driven by AppShellController on mobile via the global
  // html.sheet-open class (toggled by data-sheet-toggle / data-sheet-close).

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.challenges.list({ perPage: 50 }),
      api.attempts.listMine().catch(() => [] as AttemptDetail[]),
    ])
      .then(([challengesRes, attempts]) => {
        if (cancelled) return;
        setItems(challengesRes.items);
        setTotal(challengesRes.total);
        const done = new Set<string>();
        const ipMap = new Map<string, string>();
        attempts.forEach((a) => {
          if (a.status === 'COMPLETED') done.add(a.challenge.id);
          if (a.status === 'IN_PROGRESS') ipMap.set(a.challenge.id, a.id);
        });
        setCompletedIds(done);
        setInProgressMap(ipMap);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load challenges.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((c) => {
      if (diff !== 'All') {
        const enumValue = DIFFICULTIES.find((d) => d.label === diff)?.enumValue;
        if (enumValue && c.difficulty !== enumValue) return false;
      }
      if (goalFilter && c.goalType !== goalFilter) return false;
      if (q && !(c.title.toLowerCase().includes(q) || c.brief.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, diff, goalFilter, searchQuery]);

  return (
    <div>
      <div className="r-sheet-scrim" data-sheet-close />
      <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '100%' }}>
        <aside className="r-sheet" style={{ width: '236px', flexShrink: 0, borderRight: '1px solid #E7E7EC', padding: '36px 26px 40px 40px' }}>
          <div className="r-sheet-head">
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0B0B0F' }}>Filters</span>
            <button
              type="button"
              data-sheet-close
              aria-label="Close filters"
              style={{ width: 32, height: 32, border: '1px solid #E7E7EC', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86', marginBottom: '14px' }}>Difficulty</div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '34px' }}>
            {DIFFICULTIES.map((d) => {
              const active = diff === d.label;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDiff(d.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#0B0B0F' : '#3A3A44',
                    background: active ? '#FAFAF8' : 'transparent',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                  {d.label}
                </button>
              );
            })}
          </nav>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86', marginBottom: '14px' }}>Goal type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {GOALS.map((g) => {
              const active = goalFilter === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoalFilter(active ? '' : g.value)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    border: '1px solid #E7E7EC',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '12.5px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#0B0B0F' : '#3A3A44',
                    background: active ? 'rgba(91,75,245,0.08)' : 'transparent',
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="r-page" style={{ flex: 1, minWidth: 0, padding: '36px 40px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <div>
              <h1 className="r-title" style={{ margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '30px', letterSpacing: '-0.03em', lineHeight: 1.05, color: '#0B0B0F' }}>Challenge library</h1>
              <p style={{ margin: '9px 0 0', fontFamily: "'Space Mono',monospace", fontSize: '11.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                {loading ? 'Loading…' : `Showing ${filtered.length} of ${total} challenges`}
              </p>
              <button
                type="button"
                className="r-filters-btn"
                data-sheet-toggle
                style={{ marginTop: 12, height: 38, padding: '0 16px', border: '1px solid #E7E7EC', borderRadius: 10, background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: 600, color: '#3A3A44' }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M7 12h10" />
                  <path d="M11 18h2" />
                </svg>
                Filters
              </button>
            </div>
            <div className="challenges-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="challenges-search" style={{ position: 'relative', width: '230px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords…"
                  style={{ width: '100%', height: '36px', padding: '0 12px 0 35px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#FAFAF8', fontFamily: 'Inter,sans-serif', fontSize: '13px', color: '#0B0B0F', outline: 'none' }}
                />
              </div>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 14px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, color: '#3A3A44', cursor: 'pointer' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Sort</span>
                Trending
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '26px' }}>
            {error && (
              <div style={{ padding: '14px 16px', borderRadius: '10px', border: '1px solid #F2C4C0', background: '#FCEFED', color: '#A93F37', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                Loading challenges…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC' }}>
                {searchQuery || diff !== 'All' || goalFilter ? 'No challenges match these filters.' : 'No challenges available yet.'}
              </div>
            ) : (
              filtered.map((c, idx) => {
                const meta = DIFFICULTY_META[c.difficulty];
                const done = completedIds.has(c.id);
                const inProgressId = inProgressMap.get(c.id);
                const isLast = idx === filtered.length - 1;
                const personaName = c.persona?.name ?? '—';
                const personaInitial = personaName.charAt(0).toUpperCase();

                const goToDetail = () => router.push(`/app/challenges/${c.id}`);
                const onButtonClick = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (inProgressId && !done) {
                    router.push(`/play/${inProgressId}`);
                  } else {
                    router.push(`/app/challenges/${c.id}`);
                  }
                };

                return (
                  <div
                    key={c.id}
                    onClick={goToDetail}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '32px',
                      alignItems: 'center',
                      padding: '24px 4px',
                      borderTop: '1px solid #E7E7EC',
                      borderBottom: isLast ? '1px solid #E7E7EC' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#3A3A44' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                          {meta.label}
                        </span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                          {c.category}
                        </span>
                        {done ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px 3px 7px', borderRadius: '100px', background: 'rgba(91,75,245,0.08)', color: '#3A2DC4', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            Completed
                          </span>
                        ) : inProgressId ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px 3px 7px', borderRadius: '100px', background: 'rgba(91,75,245,0.08)', color: '#3A2DC4', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3A2DC4', display: 'inline-block' }} />
                            In progress
                          </span>
                        ) : (
                          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                            Not started
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '19px', letterSpacing: '-0.02em', color: '#0B0B0F', marginBottom: '7px' }}>{c.title}</div>
                      <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: '#7A7A86', maxWidth: '560px', marginBottom: '15px' }}>{c.brief}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '26px' }}>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: '4px' }}>Goal</div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#0B0B0F' }}>{formatGoalLabel(c.goalType)}</div>
                        </div>
                        <div style={{ width: '1px', height: '26px', background: '#E7E7EC' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#EFEFF3', color: '#3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '11px' }}>
                            {personaInitial}
                          </span>
                          <div>
                            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: '3px' }}>Persona</div>
                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#0B0B0F' }}>{personaName}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '24px', letterSpacing: '-0.02em', color: '#F5A524' }}>+{c.basePoints}</span>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '1px' }}>Base points</div>
                      </div>
                      {done ? (
                        <button
                          type="button"
                          onClick={onButtonClick}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#3A3A44', border: '1px solid #E7E7EC', borderRadius: '10px', padding: '9px 16px', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          Done
                        </button>
                      ) : inProgressId ? (
                        <button
                          type="button"
                          onClick={onButtonClick}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#0B0B0F', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Continue
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onButtonClick}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#0B0B0F', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Start
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
