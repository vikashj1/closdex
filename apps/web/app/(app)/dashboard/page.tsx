'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Stat } from '@/components/ui/Stat';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';
import { Icon } from '@/components/ui/Icon';
import { api, AttemptDetail, ChallengeSummary, LeaderboardEntry } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth';
import {
  currentRank,
  difficultyFromEnum,
  nextRank,
  rankFromEnum,
} from '@/lib/constants';

const RUBRIC_DIMS = [
  'discovery',
  'objectionHandling',
  'valueArticulation',
  'conversationalQuality',
  'goalExecution',
] as const;

const COACH_TIPS: Record<string, { label: string; tip: string }> = {
  discovery: {
    label: 'Discovery',
    tip: 'Open with discovery questions. Pitch only after you understand the pain.',
  },
  objectionHandling: {
    label: 'Objection handling',
    tip: 'Acknowledge the objection in your reply before you push back. Don\'t argue.',
  },
  valueArticulation: {
    label: 'Value articulation',
    tip: 'Tie features to business outcomes. Quantify wherever you can.',
  },
  conversationalQuality: {
    label: 'Conversational quality',
    tip: 'Vary your message length. Sound like a person, not a script.',
  },
  goalExecution: {
    label: 'Goal execution',
    tip: 'Be specific in your ask. Vague closes lose points.',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [recommended, setRecommended] = useState<ChallengeSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Refresh auth once on mount so totalPoints reflects the latest DB state.
  // This is intentionally separate from the data-fetch effect: refresh() creates
  // a new user object on every call, so putting it inside [user] would loop forever.
  useEffect(() => { void refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setDataLoading(true);

    Promise.allSettled([
      api.challenges.list({ perPage: 4 }),
      api.leaderboards.list({ period: 'all-time', limit: 5 }),
      api.attempts.listMine(),
    ]).then(([cRes, lRes, aRes]) => {
      if (cancelled) return;
      if (lRes.status === 'fulfilled') setLeaderboard(lRes.value.entries);
      const myAttempts = aRes.status === 'fulfilled' ? aRes.value : [];
      if (aRes.status === 'fulfilled') setAttempts(myAttempts);
      if (cRes.status === 'fulfilled') {
        const doneIds = new Set(
          myAttempts.filter((a) => a.status === 'COMPLETED').map((a) => a.challenge.id),
        );
        // Show uncompleted first; pad with completed if fewer than 4 remain
        const uncompleted = cRes.value.items.filter((c) => !doneIds.has(c.id));
        const completed = cRes.value.items.filter((c) => doneIds.has(c.id));
        setRecommended([...uncompleted, ...completed].slice(0, 4));
      }
      if (cRes.status === 'rejected' && lRes.status === 'rejected') {
        setDataError('Could not reach the API. Showing your profile only.');
      }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [userId]);

  const activityData = useMemo(() => {
    const counts = new Array(182).fill(0);
    const now = Date.now();
    attempts.forEach((a) => {
      if (a.completedAt) {
        const daysAgo = Math.floor((now - new Date(a.completedAt).getTime()) / 86400000);
        const idx = 181 - daysAgo;
        if (idx >= 0 && idx < 182) counts[idx]++;
      }
    });
    return counts;
  }, [attempts]);

  const weeklyPoints = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    return attempts
      .filter((a) => a.status === 'COMPLETED' && a.completedAt && new Date(a.completedAt).getTime() > cutoff)
      .reduce((sum, a) => sum + (a.pointsAwarded ?? 0), 0);
  }, [attempts]);

  const recentActivity = useMemo(() => {
    const now = Date.now();
    const timeAgo = (d: string) => {
      const diff = now - new Date(d).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    };
    return [...attempts]
      .filter((a) => a.status === 'COMPLETED' && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5)
      .map((a) => ({
        t: a.goalAchieved ? `Cleared '${a.challenge.title}'` : `Attempted '${a.challenge.title}'`,
        time: timeAgo(a.completedAt!),
        color: a.goalAchieved ? 'var(--emerald)' : 'var(--text-mute)',
        pts: a.pointsAwarded && a.pointsAwarded > 0 ? `+${a.pointsAwarded}` : null,
      }));
  }, [attempts]);

  // Daily quest: the first uncompleted recommended challenge of the day.
  // recommended is already sorted uncompleted-first, so recommended[0] works.
  const dailyQuest = recommended[0] ?? null;

  // Streak risk: streak > 0 AND no challenge completed today (local time).
  const completedToday = useMemo(() => {
    const todayKey = new Date().toDateString();
    return attempts.some(
      (a) => a.completedAt && new Date(a.completedAt).toDateString() === todayKey,
    );
  }, [attempts]);

  const hoursLeftToday = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return Math.max(0, Math.floor((endOfDay.getTime() - now.getTime()) / 3_600_000));
  }, []);

  // Weakest rubric dimension across completed attempts → coach tip.
  const weakestDim = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {};
    for (const dim of RUBRIC_DIMS) sums[dim] = { total: 0, count: 0 };
    for (const a of attempts) {
      if (!a.rubricScores) continue;
      for (const dim of RUBRIC_DIMS) {
        const v = a.rubricScores[dim];
        if (typeof v === 'number') {
          sums[dim].total += v;
          sums[dim].count += 1;
        }
      }
    }
    const scored = RUBRIC_DIMS.filter((d) => sums[d].count > 0);
    if (scored.length === 0) return null;
    return scored.reduce(
      (min, d) =>
        sums[d].total / sums[d].count < sums[min].total / sums[min].count ? d : min,
      scored[0],
    );
  }, [attempts]);

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading dashboard…</div>;
  }

  const profile = user.salesperson;
  const points = profile?.totalPoints ?? 0;
  const rank = profile ? rankFromEnum(profile.rank) : currentRank(points);
  const next = nextRank(points);
  const progressPct = next ? Math.min(100, Math.round((points / next.min) * 100)) : 100;
  const streak = profile?.currentStreakDays ?? 0;
  const streakAtRisk = streak > 0 && !completedToday;

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>
            Welcome back, {user.name.split(' ')[0]}.
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            {next ? (
              <>
                You&apos;re <strong style={{ color: 'var(--gold)' }}>{(next.min - points).toLocaleString()} points</strong>{' '}
                away from <RankBadge rank={next.name} size={14} /> {next.name}.
              </>
            ) : (
              <>You&apos;ve hit <RankBadge rank="Grandmaster" size={14} /> Grandmaster. Defend the throne.</>
            )}
          </p>
        </div>
        <Btn kind="primary" icon={<Icon.bolt />} onClick={() => router.push('/app/challenges')}>
          Take a challenge
        </Btn>
      </div>

      {/* Stats strip */}
      <Card padding={20}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={STAT_LBL}>Current rank</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RankBadge rank={rank} size={36} />
              <span className="display" style={{ fontSize: 22, fontWeight: 700, color: `var(--r-${rank.toLowerCase()})` }}>{rank}</span>
            </div>
          </div>
          <Stat label="Total points" value={points.toLocaleString()} accent="var(--text)" icon={<Icon.bolt />} />
          <Stat label="This week"    value={weeklyPoints > 0 ? `+${weeklyPoints.toLocaleString()}` : '—'} sub="last 7 days" accent="var(--emerald)" icon={<Icon.trend />} />
          <Stat label="Challenges"  value={String(attempts.filter(a => a.status === 'COMPLETED').length)} sub="completed" accent="var(--gold)" icon={<Icon.fire />} />
          <Stat
            label="Day streak"
            value={profile?.currentStreakDays ? `${profile.currentStreakDays}d` : '—'}
            sub={profile?.currentStreakDays ? 'keep it going' : 'complete a challenge'}
            accent={profile?.currentStreakDays ? 'var(--d-expert)' : 'var(--text-mute)'}
            icon={<Icon.fire />}
          />
        </div>
        {next && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--text-dim)' }}>Progress to {next.name}</span>
              <span className="mono" style={{ color: 'var(--text)' }}>{points.toLocaleString()} / {next.min.toLocaleString()}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--gold), var(--r-platinum))' }} />
            </div>
          </div>
        )}
      </Card>

      {/* Daily Quest · Streak Risk · Coach Tip · Rank Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {/* 1. Daily Quest */}
        <Card
          padding={16}
          style={{
            background: 'color-mix(in oklch, var(--gold) 8%, var(--surface))',
            borderColor: 'color-mix(in oklch, var(--gold) 30%, transparent)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            cursor: dailyQuest ? 'pointer' : 'default',
          }}
          onClick={() => dailyQuest && router.push(`/app/challenges/${dailyQuest.id}`)}
        >
          <div style={QUEST_LBL}>
            <Icon.bolt /> DAILY QUEST
          </div>
          {dailyQuest ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{dailyQuest.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <DifficultyTag level={difficultyFromEnum(dailyQuest.difficulty)} size="sm" />
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--gold)', fontWeight: 700 }}>
                  +{dailyQuest.basePoints}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 'auto' }}>
                Clear it today to keep your edge sharp.
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
              All caught up. Pick anything from the library.
            </div>
          )}
        </Card>

        {/* 2. Streak Risk */}
        <Card
          padding={16}
          style={{
            background: streakAtRisk
              ? 'color-mix(in oklch, var(--d-expert) 10%, var(--surface))'
              : 'var(--surface)',
            borderColor: streakAtRisk
              ? 'color-mix(in oklch, var(--d-expert) 35%, transparent)'
              : 'var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ ...QUEST_LBL, color: streakAtRisk ? 'var(--d-expert)' : 'var(--text-mute)' }}>
            <Icon.fire /> {streakAtRisk ? 'STREAK AT RISK' : 'STREAK'}
          </div>
          {streak > 0 ? (
            <>
              <div className="display" style={{ fontSize: 26, fontWeight: 700, color: streakAtRisk ? 'var(--d-expert)' : 'var(--text)' }}>
                {streak}d
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {streakAtRisk
                  ? `Ends in ~${hoursLeftToday}h. One quick challenge saves it.`
                  : 'You already cleared one today. Locked in.'}
              </div>
              {streakAtRisk && (
                <Btn kind="primary" size="sm" onClick={() => router.push('/app/challenges')}>
                  Save streak
                </Btn>
              )}
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
              Complete one challenge today to start a streak.
            </div>
          )}
        </Card>

        {/* 3. AI Coach Tip */}
        <Card
          padding={16}
          style={{
            background: 'color-mix(in oklch, var(--cool) 6%, var(--surface))',
            borderColor: 'color-mix(in oklch, var(--cool) 25%, transparent)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ ...QUEST_LBL, color: 'var(--cool)' }}>
            <Icon.target /> COACH TIP
          </div>
          {weakestDim ? (
            <>
              <div style={{ fontSize: 11.5, color: 'var(--cool)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Work on: {COACH_TIPS[weakestDim].label}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {COACH_TIPS[weakestDim].tip}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
              Complete a couple of challenges to unlock personalized coaching.
            </div>
          )}
        </Card>

        {/* 4. Rank Progress */}
        <Card
          padding={16}
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={QUEST_LBL}>
            <Icon.trophy /> NEXT RANK
          </div>
          {next ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RankBadge rank={next.name} size={26} />
                <span className="display" style={{ fontSize: 18, fontWeight: 700, color: `var(--r-${next.name.toLowerCase()})` }}>
                  {next.name}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                <strong style={{ color: 'var(--text)' }}>{(next.min - points).toLocaleString()} points</strong> away.
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden', marginTop: 'auto' }}>
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, var(--gold), var(--r-platinum))',
                  }}
                />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--gold)' }}>
              You&apos;ve hit Grandmaster. Defend the throne.
            </div>
          )}
        </Card>
      </div>

      <Card padding={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Your challenge activity</h3>
            <p style={{ fontSize: 12, color: 'var(--text-mute)', margin: '4px 0 0' }}>Last 26 weeks</p>
          </div>
        </div>
        <ActivityHeatmap weeks={26} activityData={activityData} />
      </Card>

      {/* Recommended / mini-leaderboard / recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 18 }}>
        <Card padding={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Recommended for you</h3>
            <a
              onClick={() => router.push('/app/challenges')}
              style={{ fontSize: 12, color: 'var(--gold)', cursor: 'pointer' }}
            >
              See all →
            </a>
          </div>
          {dataLoading ? (
            <div style={EMPTY_HINT}>Loading challenges…</div>
          ) : recommended.length === 0 ? (
            <div style={EMPTY_HINT}>{dataError ?? 'No published challenges yet.'}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommended.map((c) => {
                const level = difficultyFromEnum(c.difficulty);
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/app/challenges/${c.id}`)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-2)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.title}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <DifficultyTag level={level} size="sm" />
                        <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{c.category}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono display" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>+{c.basePoints}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{c.maxMessages} msgs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card padding={20}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Leaderboard</h3>
          {dataLoading ? (
            <div style={EMPTY_HINT}>Loading…</div>
          ) : leaderboard.length === 0 ? (
            <div style={EMPTY_HINT}>No leaderboard data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaderboard.map((row) => {
                const isMe = row.salesperson.publicSlug === user.salesperson?.publicSlug;
                return (
                  <div
                    key={row.salesperson.publicSlug}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr auto',
                      gap: 10,
                      alignItems: 'center',
                      padding: '7px 9px',
                      borderRadius: 8,
                      background: isMe ? 'color-mix(in oklch, var(--gold) 14%, transparent)' : 'transparent',
                    }}
                  >
                    <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: isMe ? 'var(--gold)' : 'var(--text-mute)' }}>
                      #{row.position}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={row.salesperson.name} size={22} />
                      <span style={{ fontSize: 12.5, fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold)' : 'var(--text)' }}>
                        {isMe ? `You (${row.salesperson.name})` : row.salesperson.name}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{row.salesperson.totalPoints.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card padding={20}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Recent activity</h3>
          {dataLoading ? (
            <div style={EMPTY_HINT}>Loading…</div>
          ) : recentActivity.length === 0 ? (
            <div style={EMPTY_HINT}>Complete a challenge to see activity here.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: a.color, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5 }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{a.time}</div>
                  </div>
                  {a.pts && (
                    <span className="mono" style={{ color: 'var(--emerald)', fontWeight: 700, fontSize: 12 }}>{a.pts}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

const STAT_LBL = {
  color: 'var(--text-mute)',
  fontSize: 11.5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontWeight: 500,
};

const QUEST_LBL = {
  color: 'var(--text-mute)',
  fontSize: 10.5,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontWeight: 700,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 6,
};

const EMPTY_HINT = {
  padding: '24px 12px',
  fontSize: 12.5,
  color: 'var(--text-mute)',
  textAlign: 'center' as const,
};
