'use client';

import { CSSProperties, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import type { RankName } from '@/lib/constants';

type Period = 'Daily' | 'Weekly' | 'Monthly' | 'All-time';
const PERIODS: Period[] = ['Daily', 'Weekly', 'Monthly', 'All-time'];

interface PodiumRow {
  r: 1 | 2 | 3;
  name: string;
  city: string;
  rank: RankName;
  pts: number;
}

// Order is [2nd, 1st, 3rd] so the centre column renders #1 on the tallest plinth.
const TOP3: PodiumRow[] = [
  { r: 2, name: 'Priya Iyer',    city: 'Mumbai',    rank: 'Master',  pts: 36110 },
  { r: 1, name: 'Aarav Sharma',  city: 'Bangalore', rank: 'Master',  pts: 38420 },
  { r: 3, name: 'Karan Mehta',   city: 'Pune',      rank: 'Diamond', pts: 28940 },
];

const NAMES = [
  'Sneha Reddy', 'Rohan Gupta', 'Anjali Nair', 'Vivaan Kapoor',
  'Tanvi Joshi', 'Vikram Singh', 'You (Shashank)', 'Arjun Pal',
  'Pooja Verma', 'Nikhil Rao', 'Aditi Bose', 'Ishaan Roy',
];
const CITIES = [
  'Hyderabad', 'Delhi NCR', 'Bangalore', 'Mumbai',
  'Pune', 'Bangalore', 'Bangalore', 'Delhi NCR',
  'Chennai', 'Bangalore', 'Kolkata', 'Mumbai',
];
const RANKS: RankName[] = [
  'Diamond', 'Platinum', 'Platinum', 'Platinum',
  'Gold', 'Gold', 'Gold', 'Gold',
  'Gold', 'Gold', 'Gold', 'Silver',
];
const PTS = [22180, 17850, 14210, 11340, 8612, 8488, 8376, 8201, 8095, 7842, 7560, 7320];

const REST = Array.from({ length: 12 }, (_, i) => ({
  r: i + 4,
  name: NAMES[i],
  city: CITIES[i],
  rank: RANKS[i],
  pts: PTS[i],
  you: i === 6,
}));

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('Weekly');

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
          <select style={SELECT_STYLE}>
            <option>All categories</option>
            <option>IT Sales</option>
          </select>
          <select style={SELECT_STYLE}>
            <option>All India</option>
            <option>Bangalore</option>
            <option>Mumbai</option>
          </select>
        </div>
      </div>

      {/* Period tabs */}
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
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '8px 16px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              background: period === p ? 'var(--gold)' : 'transparent',
              color: period === p ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
              border: 'none',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, alignItems: 'end', marginBottom: 24 }}>
        {TOP3.map((p) => (
          <PodiumCard key={p.r} {...p} height={p.r === 1 ? 240 : p.r === 2 ? 200 : 180} />
        ))}
      </div>

      {/* Table */}
      <Card padding={0}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 130px 100px 130px 80px',
            padding: '12px 18px',
            fontSize: 11,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div>Rank</div><div>Salesperson</div><div>City</div><div>Tier</div><div>Points</div><div>Trend</div>
        </div>
        {REST.map((row) => (
          <div
            key={row.r}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 130px 100px 130px 80px',
              padding: '12px 18px',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-soft)',
              background: row.you ? 'color-mix(in oklch, var(--gold) 10%, transparent)' : 'transparent',
            }}
          >
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: row.you ? 'var(--gold)' : 'var(--text-mute)' }}>
              #{row.r}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={row.name} size={32} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: row.you ? 700 : 500, color: row.you ? 'var(--gold)' : 'var(--text)' }}>
                  {row.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{row.r === 11 ? 'Open to work' : ''}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>{row.city}</div>
            <RankBadge rank={row.rank} size={18} showLabel />
            <div className="mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{row.pts.toLocaleString()}</div>
            <div className="mono" style={{ fontSize: 11.5, color: row.r % 4 === 0 ? 'var(--d-expert)' : 'var(--emerald)' }}>
              {row.r % 4 === 0 ? '↓ -2' : '↑ +' + (3 + (row.r % 5))}
            </div>
          </div>
        ))}
      </Card>

      {/* Sticky "your row" */}
      <div style={{ position: 'sticky', bottom: 16, marginTop: 16 }}>
        <Card
          padding={14}
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 130px 100px 130px 80px',
            alignItems: 'center',
            borderColor: 'var(--gold)',
            background: 'color-mix(in oklch, var(--gold) 14%, var(--surface))',
          }}
        >
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>#27</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name="Shashank Khare" size={32} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>You · Shashank Khare</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>624 pts to Platinum</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Bangalore</div>
          <RankBadge rank="Gold" size={18} showLabel />
          <div className="mono" style={{ fontSize: 13.5, fontWeight: 700 }}>8,376</div>
          <div className="mono" style={{ fontSize: 11.5, color: 'var(--emerald)' }}>↑ +7</div>
        </Card>
      </div>
    </div>
  );
}

function PodiumCard({ r, name, city, rank, pts, height }: PodiumRow & { height: number }) {
  const colors: Record<1 | 2 | 3, string> = {
    1: 'var(--r-gold)',
    2: 'var(--r-silver)',
    3: 'var(--r-bronze)',
  };
  const medal: Record<1 | 2 | 3, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return (
    <Card
      padding={20}
      style={{
        borderColor: `color-mix(in oklch, ${colors[r]} 40%, var(--border))`,
        background: `linear-gradient(180deg, color-mix(in oklch, ${colors[r]} 12%, var(--surface)) 0%, var(--surface) 70%)`,
        textAlign: 'center',
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 32 }}>{medal[r]}</div>
      <Avatar name={name} size={56} />
      <div>
        <div className="display" style={{ fontSize: 17, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{city}</div>
      </div>
      <RankBadge rank={rank} size={22} showLabel />
      <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: colors[r] }}>{pts.toLocaleString()}</div>
    </Card>
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
