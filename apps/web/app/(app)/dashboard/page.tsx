'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { api, AttemptDetail, ChallengeSummary, LeaderboardEntry } from '@/lib/api';
import { RANKS, RankName, currentRank, nextRank } from '@/lib/constants';

// Heatmap colour ramp (light → violet) — matches Vikash's prototype.
const HEAT_RAMP = ['#EFEFF3', '#D8D4FB', '#B0A8F6', '#7E72F1', '#5B4BF5'] as const;
// Difficulty dot colours used in the recommended-challenges list.
const DIFF_DOT: Record<string, string> = {
  ROOKIE: '#4F9D6C',
  EASY: '#6D9A4E',
  MEDIUM: '#CC7E55',
  HARD: '#C2604A',
  EXPERT: '#A93F37',
};

const MS_DAY = 24 * 60 * 60 * 1000;

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'just now';
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

/** Build a 26-week × 7-day heatmap from the user's attempts. Each cell's bg is
 *  picked from HEAT_RAMP based on how many attempts started that day. */
function buildHeatmap(attempts: AttemptDetail[]): { days: { bg: string; count: number }[] }[] {
  const counts = new Map<string, number>();
  for (const a of attempts) {
    if (!a.startedAt) continue;
    const day = a.startedAt.slice(0, 10); // YYYY-MM-DD
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Anchor on the Sunday at or before today so columns align by week.
  const dow = today.getDay();
  const lastDay = new Date(today.getTime() - dow * MS_DAY);
  const weeks: { days: { bg: string; count: number }[] }[] = [];
  for (let w = 25; w >= 0; w--) {
    const days: { bg: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(lastDay.getTime() - (w * 7 + (6 - d)) * MS_DAY);
      const key = date.toISOString().slice(0, 10);
      const c = counts.get(key) ?? 0;
      const lvl = c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : c <= 6 ? 3 : 4;
      days.push({ bg: HEAT_RAMP[lvl], count: c });
    }
    weeks.push({ days });
  }
  return weeks;
}

function tierLabel(rank: RankName): string {
  return rank;
}

export default function DashboardPage() {
  useRequireAuth('SALESPERSON');
  const router = useRouter();
  const { user } = useAuth();

  const [attempts, setAttempts] = useState<AttemptDetail[] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);

  useEffect(() => {
    if (!user) return;
    api.attempts.listMine().then(setAttempts).catch(() => setAttempts([]));
    api.leaderboards.list({ period: 'all-time', limit: 5 })
      .then((r) => setLeaderboard(r.entries))
      .catch(() => setLeaderboard([]));
    api.challenges.list({ perPage: 20 })
      .then((r) => setChallenges(r.items))
      .catch(() => setChallenges([]));
  }, [user]);

  // Derived stats (default to 0 when data still loading or missing).
  const totalPoints = user?.salesperson?.totalPoints ?? 0;
  const streak = user?.salesperson?.currentStreakDays ?? 0;
  const userName = user?.name ?? 'there';
  const userInitial = (userName[0] || 't').toLowerCase();

  const rank = currentRank(totalPoints);
  const nextR = nextRank(totalPoints);
  const targetMin = nextR ? nextR.min : totalPoints;
  const targetName: RankName | null = nextR ? nextR.name : null;
  const previousMin = RANKS[rank].min;
  const span = Math.max(1, targetMin - previousMin);
  const progressInTier = Math.min(span, Math.max(0, totalPoints - previousMin));
  const progressPct = Math.round((progressInTier / span) * 100);
  const pointsToGo = targetName ? Math.max(0, targetMin - totalPoints) : 0;

  // Completed attempts excluding quarantined ones (those don't count toward
  // points or progress).
  const completedAttempts = (attempts ?? []).filter(
    (a) => a.status === 'COMPLETED' && !a.quarantined,
  );
  const completedCount = completedAttempts.length;
  const weekCutoff = Date.now() - 7 * MS_DAY;
  const weekPoints = completedAttempts
    .filter((a) => a.completedAt && new Date(a.completedAt).getTime() >= weekCutoff)
    .reduce((sum, a) => sum + (a.pointsAwarded ?? 0), 0);

  const heatmapWeeks = buildHeatmap(attempts ?? []);
  const totalHeatmapAttempts = heatmapWeeks.reduce(
    (s, w) => s + w.days.reduce((ss, d) => ss + d.count, 0),
    0,
  );

  // Pick a daily quest = highest-points challenge the user hasn't completed yet.
  const completedIds = new Set(completedAttempts.map((a) => a.challenge.id));
  const dailyQuest = challenges
    .filter((c) => !completedIds.has(c.id))
    .sort((a, b) => (b.basePoints ?? 0) - (a.basePoints ?? 0))[0];

  // Recommended challenges = next 4 not-completed by points.
  const recommended = challenges
    .filter((c) => !completedIds.has(c.id) && c.id !== dailyQuest?.id)
    .sort((a, b) => (b.basePoints ?? 0) - (a.basePoints ?? 0))
    .slice(0, 4);

  // Recent activity = last 3 completed attempts.
  const recentActivity = [...completedAttempts]
    .sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 3);

  // Leaderboard top 3 with user position if known.
  const topThree = leaderboard.slice(0, 3);
  const mySlug = user?.salesperson?.publicSlug;
  const myEntry = leaderboard.find((e) => e.salesperson.publicSlug === mySlug);

  function goPlay(challengeId: string) {
    api.attempts
      .start(challengeId)
      .then((a) => router.push(`/play/${a.id}`))
      .catch(() => {});
  }

  return (
    <div>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 40px 72px' }}>
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 30,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize: 33,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                color: '#0B0B0F',
              }}
            >
              Welcome back, {userName}.
            </h1>
            <p style={{ margin: '9px 0 0', fontSize: 15, color: '#7A7A86' }}>
              {targetName ? (
                <>
                  You're{' '}
                  <span style={{ color: '#0B0B0F', fontWeight: 600 }}>
                    {formatNumber(pointsToGo)} points
                  </span>{' '}
                  away from {targetName}.
                </>
              ) : (
                <>You've reached the top of the ladder.</>
              )}
            </p>
          </div>
          <button
            onClick={() => router.push('/app/challenges')}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#0B0B0F',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 18px',
              fontFamily: 'Inter,sans-serif',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={12} cy={12} r={9} />
              <circle cx={12} cy={12} r={5} />
              <circle cx={12} cy={12} r={1.4} />
            </svg>
            Take a challenge
          </button>
        </div>

        {/* ===== RANK HERO ===== */}
        <section
          style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background:
              'radial-gradient(130% 150% at 0% 0%, #4A3AD9 0%, #2C2256 40%, #14101F 72%, #0B0B0F 100%)',
            padding: '32px 36px',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 340,
              height: 340,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(91,75,245,0.32) 0%, rgba(91,75,245,0) 68%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 40,
              alignItems: 'flex-end',
            }}
          >
            {/* Tier + points */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    width: 13,
                    height: 15,
                    background: '#F5A524',
                    display: 'inline-block',
                    clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#F5A524',
                  }}
                >
                  {tierLabel(rank)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 78,
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    color: '#F5A524',
                  }}
                >
                  {formatNumber(totalPoints)}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 12,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                    paddingBottom: 8,
                  }}
                >
                  points
                </span>
              </div>
            </div>

            {/* Inline stats */}
            <div style={{ display: 'flex', gap: 34, paddingBottom: 6 }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 600,
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: weekPoints > 0 ? '#F5A524' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {weekPoints > 0 ? '+' : ''}
                  {formatNumber(weekPoints)}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 4,
                  }}
                >
                  This week · 7d
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)' }} />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 600,
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                  }}
                >
                  {completedCount}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 4,
                  }}
                >
                  Challenges
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.12)' }} />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 600,
                    fontSize: 26,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                  }}
                >
                  {streak}d
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10.5,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 4,
                  }}
                >
                  Day streak
                </div>
              </div>
            </div>

            {/* Climb bar */}
            <div style={{ flex: 1, minWidth: 240, paddingBottom: 4 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 9,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {targetName ? `Progress to ${targetName}` : 'Top of the ladder'}
                </span>
                {targetName && (
                  <span
                    style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: '#F5A524' }}
                  >
                    <span style={{ fontWeight: 700 }}>{formatNumber(totalPoints)}</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {' '}
                      / {formatNumber(targetMin)}
                    </span>
                  </span>
                )}
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    borderRadius: 100,
                    background: 'linear-gradient(90deg,#F5A524,#F7B948)',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10.5,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 9,
                }}
              >
                {targetName ? `${formatNumber(pointsToGo)} points to go` : 'Grandmaster'}
              </div>
            </div>
          </div>
        </section>

        {/* ===== UTILITY STRIP ===== */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 0,
            borderTop: '1px solid #E7E7EC',
            borderBottom: '1px solid #E7E7EC',
            marginBottom: 42,
          }}
        >
          {/* Daily quest */}
          <div
            style={{
              padding: '20px 24px 20px 0',
              borderRight: '1px solid #E7E7EC',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
                marginBottom: 12,
              }}
            >
              Daily quest
            </div>
            {dailyQuest ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#0B0B0F', marginBottom: 6 }}>
                  {dailyQuest.title}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#3A3A44',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: DIFF_DOT[dailyQuest.difficulty] || '#7A7A86',
                      }}
                    />
                    {dailyQuest.difficulty[0] +
                      dailyQuest.difficulty.slice(1).toLowerCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#F5A524',
                    }}
                  >
                    +{formatNumber(dailyQuest.basePoints ?? 0)}
                  </span>
                </div>
                <button
                  onClick={() => goPlay(dailyQuest.id)}
                  style={{
                    marginTop: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#3A2DC4',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                    fontFamily: 'inherit',
                  }}
                >
                  Start
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#9A9AA4' }}>
                All caught up — every challenge cleared.
              </div>
            )}
          </div>

          {/* Streak status */}
          <div
            style={{
              padding: '20px 24px',
              borderRight: '1px solid #E7E7EC',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F5A524"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5" />
              </svg>
              {streak > 0 ? 'Streak at risk' : 'Start a streak'}
            </div>
            {streak > 0 ? (
              <>
                <div
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.4,
                    color: '#0B0B0F',
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>
                    {streak}d
                  </span>{' '}
                  · Keep it alive today.
                </div>
                <div
                  style={{ fontSize: 12.5, lineHeight: 1.4, color: '#7A7A86', marginBottom: 14 }}
                >
                  One quick challenge saves it.
                </div>
              </>
            ) : (
              <div
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  color: '#7A7A86',
                  marginBottom: 14,
                }}
              >
                Clear one challenge today to start a streak.
              </div>
            )}
            <button
              onClick={() => router.push('/app/challenges')}
              style={{
                marginTop: 'auto',
                alignSelf: 'flex-start',
                background: '#0B0B0F',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '8px 14px',
                fontFamily: 'Inter,sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {streak > 0 ? 'Save streak' : 'Start now'}
            </button>
          </div>

          {/* Coach tip — generic coaching content, not personal data, stays static */}
          <div
            style={{
              padding: '20px 24px',
              borderRight: '1px solid #E7E7EC',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
                marginBottom: 12,
              }}
            >
              Coach tip
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#0B0B0F', marginBottom: 7 }}>
              Work on: objection handling
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#7A7A86' }}>
              Lead with a question before you pitch — let the buyer name the pain first.
            </div>
          </div>

          {/* Next rank */}
          <div style={{ padding: '20px 0 20px 24px', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
                marginBottom: 12,
              }}
            >
              Next rank
            </div>
            {targetName ? (
              <>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
                >
                  <span
                    style={{
                      width: 13,
                      height: 15,
                      background: '#C0C0C8',
                      display: 'inline-block',
                      clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                    }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0B0B0F' }}>
                    {targetName}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#7A7A86' }}>
                  {formatNumber(pointsToGo)} points away
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13.5, color: '#7A7A86' }}>
                You've reached the top of the ladder.
              </div>
            )}
          </div>
        </section>

        {/* ===== HEATMAP ===== */}
        <section style={{ marginBottom: 42 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
              }}
            >
              Challenge activity
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Last 26 weeks · {totalHeatmapAttempts} attempts
            </div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {heatmapWeeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {week.days.map((d, di) => (
                  <div
                    key={di}
                    title={`${d.count} attempts`}
                    style={{ width: 13, height: 13, borderRadius: 3, background: d.bg }}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ===== THREE PANELS ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 50 }}>
          {/* Recommended challenges */}
          <section>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#7A7A86',
                marginBottom: 4,
              }}
            >
              Recommended for you
            </div>
            {recommended.length === 0 ? (
              <div
                style={{
                  borderTop: '1px solid #E7E7EC',
                  borderBottom: '1px solid #E7E7EC',
                  padding: '40px 0',
                  textAlign: 'center',
                  fontSize: 13.5,
                  color: '#9A9AA4',
                }}
              >
                No new challenges to recommend right now.
              </div>
            ) : (
              recommended.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => goPlay(c.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '15px 4px',
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: i === recommended.length - 1 ? '1px solid #E7E7EC' : 'none',
                    width: '100%',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: '#0B0B0F',
                        marginBottom: 7,
                      }}
                    >
                      {c.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 10.5,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: '#7A7A86',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          color: '#3A3A44',
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: DIFF_DOT[c.difficulty] || '#7A7A86',
                          }}
                        />
                        {c.difficulty[0] + c.difficulty.slice(1).toLowerCase()}
                      </span>
                      {c.goalType && <span>{c.goalType.replace(/_/g, ' ')}</span>}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#F5A524',
                      flexShrink: 0,
                    }}
                  >
                    +{formatNumber(c.basePoints ?? 0)}
                  </span>
                </button>
              ))
            )}
          </section>

          {/* Right column: Leaderboard + Recent activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Leaderboard */}
            <section>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  marginBottom: 4,
                }}
              >
                Leaderboard
              </div>
              {topThree.length === 0 ? (
                <div
                  style={{
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: '1px solid #E7E7EC',
                    padding: '24px 0',
                    fontSize: 13,
                    color: '#9A9AA4',
                    textAlign: 'center',
                  }}
                >
                  Leaderboard loading…
                </div>
              ) : (
                topThree.map((entry, i) => {
                  const isMe = entry.salesperson.publicSlug === mySlug;
                  return (
                    <div
                      key={entry.salesperson.publicSlug}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 13,
                        padding: '13px 12px',
                        borderTop: '1px solid #E7E7EC',
                        borderBottom: i === topThree.length - 1 ? '1px solid #E7E7EC' : 'none',
                        borderRadius: i === 0 ? '8px 8px 0 0' : 0,
                        background: isMe ? 'rgba(91,75,245,0.07)' : 'transparent',
                        boxShadow: isMe ? 'inset 2px 0 0 #5B4BF5' : 'none',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          color: isMe ? '#3A2DC4' : '#9A9AA4',
                          width: 20,
                        }}
                      >
                        {String(entry.position).padStart(2, '0')}
                      </span>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isMe ? '#0B0B0F' : '#EFEFF3',
                          color: isMe ? '#fff' : '#3A3A44',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: "'Space Grotesk',sans-serif",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {(entry.salesperson.name[0] || '?').toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: isMe ? 600 : 500,
                            color: '#0B0B0F',
                          }}
                        >
                          {isMe ? 'You' : entry.salesperson.name}
                        </div>
                        {isMe && (
                          <div
                            style={{
                              fontFamily: "'Space Mono',monospace",
                              fontSize: 10,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: '#7A7A86',
                            }}
                          >
                            {userName}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: isMe ? '#F5A524' : '#0B0B0F',
                        }}
                      >
                        {formatNumber(entry.salesperson.totalPoints)}
                      </span>
                    </div>
                  );
                })
              )}
              {myEntry && myEntry.position > 3 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    padding: '13px 12px',
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: '1px solid #E7E7EC',
                    background: 'rgba(91,75,245,0.07)',
                    boxShadow: 'inset 2px 0 0 #5B4BF5',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#3A2DC4',
                      width: 20,
                    }}
                  >
                    {String(myEntry.position).padStart(2, '0')}
                  </span>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#0B0B0F',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  >
                    {userInitial.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600 }}>You</div>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#F5A524',
                    }}
                  >
                    {formatNumber(totalPoints)}
                  </span>
                </div>
              )}
            </section>

            {/* Recent activity */}
            <section>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  marginBottom: 4,
                }}
              >
                Recent activity
              </div>
              {recentActivity.length === 0 ? (
                <div
                  style={{
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: '1px solid #E7E7EC',
                    padding: '24px 0',
                    fontSize: 13,
                    color: '#9A9AA4',
                    textAlign: 'center',
                  }}
                >
                  Nothing here yet. Take a challenge to get started.
                </div>
              ) : (
                recentActivity.map((a, i) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 13,
                      padding: '14px 4px',
                      borderTop: '1px solid #E7E7EC',
                      borderBottom: i === recentActivity.length - 1 ? '1px solid #E7E7EC' : 'none',
                    }}
                  >
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5B4BF5"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: '#0B0B0F' }}>
                        Cleared{' '}
                        <span style={{ fontWeight: 600 }}>'{a.challenge.title}'</span>
                      </div>
                      <div
                        style={{
                          fontFamily: "'Space Mono',monospace",
                          fontSize: 10,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#9A9AA4',
                          marginTop: 3,
                        }}
                      >
                        {a.completedAt ? relativeTime(a.completedAt) : ''}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#F5A524',
                      }}
                    >
                      +{formatNumber(a.pointsAwarded ?? 0)}
                    </span>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
