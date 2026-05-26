'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { api, ApiError, LeaderboardEntry } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { rankFromEnum } from '@/lib/constants';

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily',    label: 'Daily'    },
  { key: 'weekly',   label: 'Weekly'   },
  { key: 'monthly',  label: 'Monthly'  },
  { key: 'all-time', label: 'All-time' },
];

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [period, setPeriod] = useState<Period>('weekly');
  const [category, setCategory] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.leaderboards.list({ period, limit: 50, category: category || undefined })
      .then(res => { if (!cancelled) { setEntries(res.entries); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err instanceof ApiError ? err.message : 'Failed to load leaderboard.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [user, period, category]);

  if (authLoading) return null;

  const top3Raw = entries.filter(e => e.position <= 3);
  const podium: LeaderboardEntry[] = [
    top3Raw.find(e => e.position === 2),
    top3Raw.find(e => e.position === 1),
    top3Raw.find(e => e.position === 3),
  ].filter((e): e is LeaderboardEntry => !!e);
  const rest = entries.filter(e => e.position > 3);
  const mySlug = user?.salesperson?.publicSlug;
  const myEntry = entries.find(e => e.salesperson.publicSlug === mySlug);
  const displayScore = (e: LeaderboardEntry) =>
    period === 'all-time' ? e.salesperson.totalPoints : e.score;

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
            IT Sales · India · weekly resets every Monday 00:00 IST
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select style={SELECT_STYLE} value={category} onChange={(e) => { setCategory(e.target.value); }}>
            <option value="">All categories</option>
            <option value="IT Sales">IT Sales</option>
            <option value="Cloud">Cloud</option>
            <option value="SaaS">SaaS</option>
            <option value="DevTools">DevTools</option>
            <option value="Cybersec">Cybersec</option>
            <option value="FinTech">FinTech</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>
      </div>

      <div
        style={{
          display: 'inline-flex',
          background: 'var(--bg-2)',
          padding: 4,
          borderRadius: 10,
          gap: 4,
          marginBottom: 24,
          border: '1px solid var(--border)',
        }}
      >
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              background: period === p.key ? 'var(--gold)' : 'transparent',
              color: period === p.key ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-mute)', fontSize: 14 }}>
          Loading leaderboard…
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--d-expert)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {podium.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, alignItems: 'end', marginBottom: 24 }}>
              {podium.map((e) => (
                <PodiumCard
                  key={e.salesperson.publicSlug}
                  entry={e}
                  score={displayScore(e)}
                  height={e.position === 1 ? 240 : e.position === 2 ? 200 : 180}
                  isMe={e.salesperson.publicSlug === mySlug}
                />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <Card padding={0}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 130px 80px',
                  padding: '12px 18px',
                  fontSize: 11,
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  borderBottom: '1px solid var(--border-soft)',
                }}
              >
                <div>Rank</div><div>Salesperson</div><div>Tier</div><div>Points</div><div>Change</div>
              </div>
              {rest.map((entry) => {
                const isMe = entry.salesperson.publicSlug === mySlug;
                return (
                  <div
                    key={entry.salesperson.publicSlug}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 100px 130px 80px',
                      padding: '12px 18px',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-soft)',
                      background: isMe ? 'color-mix(in oklch, var(--gold) 10%, transparent)' : 'transparent',
                    }}
                  >
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text-mute)' }}>
                      #{entry.position}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={entry.salesperson.name} size={32} />
                      <div style={{ fontSize: 13.5, fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold)' : 'var(--text)' }}>
                        {entry.salesperson.name}
                      </div>
                    </div>
                    <RankBadge rank={rankFromEnum(entry.salesperson.rank)} size={18} showLabel />
                    <div className="mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{displayScore(entry).toLocaleString()}</div>
                    <div />
                  </div>
                );
              })}
            </Card>
          )}

          {myEntry && myEntry.position > 3 && (
            <div style={{ position: 'sticky', bottom: 16, marginTop: 16 }}>
              <Card
                padding={14}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 130px 80px',
                  alignItems: 'center',
                  borderColor: 'var(--gold)',
                  background: 'color-mix(in oklch, var(--gold) 14%, var(--surface))',
                }}
              >
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>#{myEntry.position}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={myEntry.salesperson.name} size={32} />
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>You · {myEntry.salesperson.name}</div>
                </div>
                <RankBadge rank={rankFromEnum(myEntry.salesperson.rank)} size={18} showLabel />
                <div className="mono" style={{ fontSize: 13.5, fontWeight: 700 }}>{displayScore(myEntry).toLocaleString()}</div>
                <div />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PodiumCard({ entry, score, height, isMe }: { entry: LeaderboardEntry; score: number; height: number; isMe: boolean }) {
  const r = entry.position as 1 | 2 | 3;
  const colors: Record<1 | 2 | 3, string> = {
    1: 'var(--r-gold)',
    2: 'var(--r-silver)',
    3: 'var(--r-bronze)',
  };
  const medal: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Medal sits above the card, same distance for all positions */}
      <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 10 }}>{medal[r]}</div>
      <Card
        padding={20}
        style={{
          borderColor: `color-mix(in oklch, ${colors[r]} 40%, var(--border))`,
          background: `linear-gradient(180deg, color-mix(in oklch, ${colors[r]} ${isMe ? 20 : 12}%, var(--surface)) 0%, var(--surface) 70%)`,
          textAlign: 'center',
          height,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxSizing: 'border-box',
        }}
      >
        <Avatar name={entry.salesperson.name} size={52} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div className="display" style={{ fontSize: 15, fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)', lineHeight: 1.2 }}>
            {entry.salesperson.name}
          </div>
          <RankBadge rank={rankFromEnum(entry.salesperson.rank)} size={18} showLabel />
        </div>
        <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: colors[r], lineHeight: 1 }}>
          {score.toLocaleString()}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', marginLeft: 4 }}>pts</span>
        </div>
      </Card>
    </div>
  );
}

const SELECT_STYLE: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12.5,
};
