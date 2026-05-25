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

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading dashboard…</div>;
  }

  const profile = user.salesperson;
  const points = profile?.totalPoints ?? 0;
  const rank = profile ? rankFromEnum(profile.rank) : currentRank(points);
  const next = nextRank(points);
  const progressPct = next ? Math.min(100, Math.round((points / next.min) * 100)) : 100;

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
        <Btn kind="primary" icon={<Icon.bolt />} onClick={() => router.push('/challenges')}>
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
          <Stat label="Open to work" value={profile?.openToWork ? 'Yes' : 'No'} icon={<Icon.trophy />} />
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
              onClick={() => router.push('/challenges')}
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
                    onClick={() => router.push(`/challenges/${c.id}`)}
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

const EMPTY_HINT = {
  padding: '24px 12px',
  fontSize: 12.5,
  color: 'var(--text-mute)',
  textAlign: 'center' as const,
};
