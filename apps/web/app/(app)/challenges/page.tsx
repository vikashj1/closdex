'use client';

import { CSSProperties, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import { ApiError, ChallengeSummary, api, AttemptDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DIFFICULTY, type DifficultyLevel, difficultyFromEnum } from '@/lib/constants';

type DiffFilter = 'All' | DifficultyLevel;

const DIFFICULTIES: DiffFilter[] = ['All', 'Rookie', 'Easy', 'Medium', 'Hard', 'Expert'];

const GOALS: { label: string; value: string }[] = [
  { label: 'Qualify',          value: 'QUALIFY_LEAD'          },
  { label: 'Book call',        value: 'BOOK_DISCOVERY_CALL'    },
  { label: 'Proposal',         value: 'SEND_PROPOSAL'          },
  { label: 'Decision-maker',   value: 'REACH_DECISION_MAKER'   },
  { label: 'Close',            value: 'CLOSE_DEAL'             },
  { label: 'Win-back',         value: 'WIN_BACK'               },
];

const UI_TO_ENUM: Record<DifficultyLevel, string> = {
  Rookie: 'ROOKIE',
  Easy: 'EASY',
  Medium: 'MEDIUM',
  Hard: 'HARD',
  Expert: 'EXPERT',
};

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>}>
      <ChallengesPageInner />
    </Suspense>
  );
}

function ChallengesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [diff, setDiff] = useState<DiffFilter>('All');
  const [goalFilter, setGoalFilter] = useState('');
  const [items, setItems] = useState<ChallengeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [inProgressMap, setInProgressMap] = useState<Map<string, string>>(new Map()); // challengeId → attemptId
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') ?? '');
  const [pageLoaded, setPageLoaded] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load attempt state once on mount (independent of diff filter)
  useEffect(() => {
    if (!user) return;
    api.attempts.listMine().then((attempts: AttemptDetail[]) => {
      const done = new Set(
        attempts.filter((a) => a.status === 'COMPLETED').map((a) => a.challenge.id),
      );
      setCompletedIds(done);
      const ipMap = new Map<string, string>();
      attempts
        .filter((a) => a.status === 'IN_PROGRESS')
        .forEach((a) => ipMap.set(a.challenge.id, a.id));
      setInProgressMap(ipMap);
    }).catch(() => {}); // non-critical
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPageLoaded(1);
    api.challenges
      .list({
        difficulty: diff === 'All' ? undefined : UI_TO_ENUM[diff],
        goalType: goalFilter || undefined,
        perPage: 30,
        page: 1,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load challenges.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, diff, goalFilter]);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = pageLoaded + 1;
    try {
      const res = await api.challenges.list({
        difficulty: diff === 'All' ? undefined : UI_TO_ENUM[diff],
        goalType: goalFilter || undefined,
        perPage: 30,
        page: nextPage,
      });
      setItems((prev) => [...prev, ...res.items]);
      setPageLoaded(nextPage);
    } catch {
      // non-critical — user can retry
    } finally {
      setLoadingMore(false);
    }
  }

  const displayed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.brief.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  if (authLoading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, minHeight: 'calc(100vh - 60px)' }}>
      {/* Filter sidebar */}
      <aside
        style={{
          borderRight: '1px solid var(--border-soft)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          background: 'var(--bg)',
        }}
      >
        <div>
          <div style={FILTER_LBL}><Icon.filter /> Difficulty</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: diff === d ? 'var(--surface-2)' : 'transparent',
                  color: 'var(--text)',
                  fontSize: 12.5,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d !== 'All' && (
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: DIFFICULTY[d as DifficultyLevel].color }} />
                  )}
                  {d}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={FILTER_LBL}>Goal type</div>
            {goalFilter && (
              <button
                onClick={() => setGoalFilter('')}
                style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-mute)', cursor: 'pointer', padding: 0 }}
              >
                clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoalFilter(goalFilter === g.value ? '' : g.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: goalFilter === g.value
                    ? '1px solid var(--gold)'
                    : '1px solid var(--border)',
                  background: goalFilter === g.value
                    ? 'color-mix(in oklch, var(--gold) 18%, transparent)'
                    : 'transparent',
                  color: goalFilter === g.value ? 'var(--gold)' : 'var(--text-dim)',
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Challenge library</h1>
            <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
              {loading ? 'Loading…' : `Showing ${displayed.length}${searchQuery ? '' : ` of ${total}`} challenges`}
              {diff !== 'All' && ` · ${diff}`}
              {goalFilter && ` · ${GOALS.find(g => g.value === goalFilter)?.label}`}
              {searchQuery && ` · "${searchQuery}"`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Sort by</span>
            <button style={SORT_BTN}>Trending <Icon.chevDown /></button>
          </div>
        </div>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)', pointerEvents: 'none' }}>
            <Icon.search />
          </span>
          <input
            type="text"
            placeholder="Search by title, keyword, or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 36px',
              borderRadius: 9,
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              fontSize: 13,
              color: 'var(--text)',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 2,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
              border: '1px solid color-mix(in oklch, var(--d-expert) 35%, transparent)',
              color: 'var(--d-expert)',
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Loading challenges…</div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>
            {searchQuery ? `No challenges match "${searchQuery}".` : 'No challenges match these filters.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {displayed.map((c) => {
              const level = difficultyFromEnum(c.difficulty);
              const done = completedIds.has(c.id);
              const inProgressId = inProgressMap.get(c.id);
              return (
                <Card
                  key={c.id}
                  hover
                  onClick={() => router.push(`/challenges/${c.id}`)}
                  padding={0}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', opacity: done && !inProgressId ? 0.82 : 1 }}
                >
                  <div style={{ height: 4, background: inProgressId ? 'var(--cool)' : done ? 'var(--emerald)' : DIFFICULTY[level].color }} />
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <DifficultyTag level={level} size="sm" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {inProgressId && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 10.5, fontWeight: 700, color: 'var(--cool)',
                            background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                            border: '1px solid color-mix(in oklch, var(--cool) 35%, transparent)',
                            padding: '3px 8px', borderRadius: 999,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--cool)' }} />
                            Active
                          </span>
                        )}
                        {done && !inProgressId && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 10.5, fontWeight: 700, color: 'var(--emerald)',
                            background: 'color-mix(in oklch, var(--emerald) 14%, transparent)',
                            border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                            padding: '3px 8px', borderRadius: 999,
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Completed
                          </span>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: '0.06em' }}>
                          {c.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="display" style={{ fontSize: 17, margin: '0 0 6px', fontWeight: 600, letterSpacing: '-0.01em' }}>{c.title}</h3>
                      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>{c.brief}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-mute)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.target /> Goal</span>
                        <span style={{ color: 'var(--text-dim)' }}>{c.goalType.replace(/_/g, ' ').toLowerCase()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-mute)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.clock /> Persona</span>
                        <span style={{ color: 'var(--text-dim)' }}>{c.persona?.name ?? '—'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        <div className="display mono" style={{ fontWeight: 700, color: inProgressId ? 'var(--cool)' : done ? 'var(--emerald)' : 'var(--gold)', fontSize: 22 }}>+{c.basePoints}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>base points</div>
                      </div>
                      {inProgressId ? (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); router.push(`/play/${inProgressId}`); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 10,
                            background: 'color-mix(in oklch, var(--cool) 18%, transparent)',
                            border: '1px solid color-mix(in oklch, var(--cool) 40%, transparent)',
                            color: 'var(--cool)', fontSize: 12.5, fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Resume
                        </span>
                      ) : done ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 10,
                          background: 'color-mix(in oklch, var(--emerald) 14%, transparent)',
                          border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                          color: 'var(--emerald)', fontSize: 12.5, fontWeight: 600,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Done
                        </span>
                      ) : (
                        <Btn kind="secondary" size="sm" icon={<Icon.arrow />}>Start</Btn>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && !searchQuery && items.length < total && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Btn
              kind="secondary"
              size="md"
              onClick={loadMore}
            >
              {loadingMore ? 'Loading…' : `Load more (${total - items.length} remaining)`}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTER_LBL: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const SORT_BTN: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12.5,
  fontWeight: 600,
};
