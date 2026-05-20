'use client';

import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { TextInput } from '@/components/ui/TextInput';
import type { RankName } from '@/lib/constants';

interface Candidate {
  name: string;
  city: string;
  rank: RankName;
  pts: number;
  exp: number;
  win: number;
  top: string;
  ctc: string;
  open?: boolean;
}

const CANDIDATES: Candidate[] = [
  { name: 'Aarav Sharma',    city: 'Bangalore',  rank: 'Master',   pts: 38420, exp: 6, win: 81, top: 'Discovery, Closing',      ctc: '₹28-36 LPA' },
  { name: 'Priya Iyer',      city: 'Mumbai',     rank: 'Master',   pts: 36110, exp: 7, win: 76, top: 'Enterprise, MEDDIC',      ctc: '₹32-42 LPA' },
  { name: 'Karan Mehta',     city: 'Pune',       rank: 'Diamond',  pts: 28940, exp: 5, win: 72, top: 'Discovery, Objection',    ctc: '₹22-28 LPA', open: true },
  { name: 'Sneha Reddy',     city: 'Hyderabad',  rank: 'Diamond',  pts: 22180, exp: 4, win: 79, top: 'SaaS, Cold outbound',     ctc: '₹18-24 LPA', open: true },
  { name: 'Rohan Gupta',     city: 'Delhi NCR',  rank: 'Platinum', pts: 17850, exp: 5, win: 68, top: 'Negotiation, Closing',    ctc: '₹20-26 LPA' },
  { name: 'Anjali Nair',     city: 'Bangalore',  rank: 'Platinum', pts: 14210, exp: 3, win: 71, top: 'Cybersec, Mid-mkt',       ctc: '₹16-22 LPA', open: true },
  { name: 'Shashank Khare',  city: 'Bangalore',  rank: 'Gold',     pts: 8376,  exp: 4, win: 73, top: 'Discovery, IT Services',  ctc: '₹16-22 LPA', open: true },
  { name: 'Tanvi Joshi',     city: 'Pune',       rank: 'Gold',     pts: 8612,  exp: 3, win: 69, top: 'DevTools, SDR',           ctc: '₹12-16 LPA', open: true },
];

const RANK_OPTIONS: RankName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];

export default function TalentSearchPage() {
  const router = useRouter();
  const [minRank, setMinRank] = useState<RankName>('Gold');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
      {/* Filters */}
      <aside style={{ borderRight: '1px solid var(--border-soft)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 14, margin: 0, fontWeight: 700 }}>Filters</h3>
          <a style={{ fontSize: 11, color: 'var(--cool)', cursor: 'pointer' }}>Save search</a>
        </div>

        <div>
          <div style={FILTER_LBL}>Min rank</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {RANK_OPTIONS.map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '5px 8px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  background: minRank === r ? 'var(--surface-2)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  checked={minRank === r}
                  onChange={() => setMinRank(r)}
                  style={{ accentColor: 'var(--cool)' }}
                />
                <RankBadge rank={r} size={14} />
                <span style={{ fontSize: 12.5 }}>{r}+</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Win rate</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-mute)', marginTop: 10 }}>
            <span>0%</span>
            <span style={{ color: 'var(--cool)', fontWeight: 700 }}>≥ 60%</span>
            <span>100%</span>
          </div>
          <input type="range" min={0} max={100} defaultValue={60} style={{ width: '100%', accentColor: 'var(--cool)' }} />
        </div>

        <div>
          <div style={FILTER_LBL}>Location</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Remote'].map((l) => (
              <Chip key={l} active={l === 'Bangalore'} color="var(--cool)">{l}</Chip>
            ))}
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Experience</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <TextInput placeholder="Min" style={{ width: '100%' }} />
            <TextInput placeholder="Max" style={{ width: '100%' }} />
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Goal performance</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['Discovery', 'Book Call', 'Proposal', 'Close'].map((g) => (
              <Chip key={g} active={g === 'Discovery'} color="var(--cool)">{g}</Chip>
            ))}
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Availability</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginTop: 8 }}>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--cool)' }} /> Open to work only
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginTop: 6 }}>
            <input type="checkbox" style={{ accentColor: 'var(--cool)' }} /> Notice ≤ 30 days
          </label>
        </div>
      </aside>

      {/* Results */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <h1 className="display" style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>Talent search</h1>
            <p style={{ color: 'var(--text-mute)', fontSize: 12.5, margin: '4px 0 0' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{CANDIDATES.length}</strong> of 312 matching candidates · {minRank}+ · Bangalore · 60%+ win rate
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={SELECT_STYLE}>
              <option>Sort: Points (high → low)</option>
              <option>Sort: Win rate</option>
              <option>Sort: Recent activity</option>
            </select>
            <Btn kind="ghost" size="sm">Export CSV</Btn>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CANDIDATES.map((c) => (
            <Card
              key={c.name}
              hover
              onClick={() => router.push(`/company/talent/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`)}
              padding={18}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1.6fr 0.9fr 0.9fr 0.9fr auto', gap: 16, alignItems: 'center' }}>
                <Avatar name={c.name} size={48} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</span>
                    <RankBadge rank={c.rank} size={16} showLabel />
                    {c.open && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                          color: 'var(--emerald)',
                          fontWeight: 700,
                        }}
                      >
                        ● OPEN TO WORK
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {c.city} · {c.exp} yrs experience · expects {c.ctc}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 4 }}>
                    Strong in: <span style={{ color: 'var(--text-dim)' }}>{c.top}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>{c.pts.toLocaleString()}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>total pts</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: c.win >= 75 ? 'var(--emerald)' : 'var(--text)' }}>{c.win}%</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>win rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--cool)' }}>
                    #{Math.floor(2500 - c.pts / 16)}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>weekly rank</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Btn kind="primary" size="sm">View profile</Btn>
                  <Btn kind="ghost" size="sm">Save</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 22 }}>
          {[1, 2, 3, 4, 5, '…', 24].map((p, i) => (
            <button
              key={i}
              style={{
                padding: '6px 11px',
                borderRadius: 6,
                background: p === 1 ? 'var(--cool)' : 'var(--bg-2)',
                color: p === 1 ? 'white' : 'var(--text-dim)',
                border: '1px solid var(--border-soft)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {p}
            </button>
          ))}
        </div>
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
};

const SELECT_STYLE: CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12,
};
