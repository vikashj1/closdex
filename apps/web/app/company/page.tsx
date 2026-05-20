'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';

const KPIS = [
  { l: 'Active job postings',  v: '5',  sub: 'of 5 in Growth plan',  c: 'var(--text)' },
  { l: 'New applications',     v: '47', sub: 'this week',            c: 'var(--cool)' },
  { l: 'Shortlisted candidates', v: '12', sub: 'across all roles',   c: 'var(--gold)' },
  { l: 'Hires this quarter',   v: '2',  sub: '₹1.5L commission paid', c: 'var(--emerald)' },
];

interface Candidate {
  name: string;
  city: string;
  rank: RankName;
  pts: number;
  win: number;
  fit: number;
  open?: boolean;
}

const TOP_CANDIDATES: Candidate[] = [
  { name: 'Aarav Sharma',    city: 'Bangalore',  rank: 'Master',  pts: 38420, win: 81, fit: 96 },
  { name: 'Priya Iyer',      city: 'Mumbai',     rank: 'Master',  pts: 36110, win: 76, fit: 91 },
  { name: 'Karan Mehta',     city: 'Pune',       rank: 'Diamond', pts: 28940, win: 72, fit: 88, open: true },
  { name: 'Sneha Reddy',     city: 'Hyderabad',  rank: 'Diamond', pts: 22180, win: 79, fit: 82, open: true },
  { name: 'Shashank Khare',  city: 'Bangalore',  rank: 'Gold',    pts: 8376,  win: 73, fit: 78, open: true },
];

const ACTIVITY = [
  { t: 'Karan Mehta applied',              role: 'Senior AE — IT Sales',           time: '23m ago', c: 'var(--cool)' },
  { t: 'You shortlisted Priya Iyer',       role: 'Enterprise AE',                  time: '2h ago',  c: 'var(--gold)' },
  { t: 'Interview scheduled with Aarav',   role: 'Senior AE — IT Sales · Fri 4pm', time: '5h ago',  c: 'var(--emerald)' },
  { t: 'Sneha Reddy declined offer',       role: 'Mid-Market AE',                  time: '1d ago',  c: 'var(--d-expert)' },
  { t: 'Job posted: SDR Manager',          role: '₹2,499/wk Featured tier',        time: '2d ago',  c: 'var(--text-dim)' },
];

export default function CompanyDashboardPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>Razorpay · Talent Hub</h1>
          <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 13.5 }}>
            5 active roles · 312 applicants this month · 2 placements YTD
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="secondary" size="md">Browse leaderboard</Btn>
          <Btn kind="primary" size="md" icon={<Icon.briefcase />} onClick={() => router.push('/company/jobs/new')}>
            Post a job
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {KPIS.map((k) => (
          <Card key={k.l} padding={18}>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {k.l}
            </div>
            <div className="display mono" style={{ fontSize: 30, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Recommended candidates */}
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Top recommended candidates</h3>
            <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>Matched to &quot;Senior AE — IT Sales&quot;</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOP_CANDIDATES.map((c) => (
              <div
                key={c.name}
                onClick={() => router.push(`/company/talent/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1.5fr 80px auto auto 100px',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                }}
              >
                <Avatar name={c.name} size={36} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                    {c.open && (
                      <span
                        style={{
                          fontSize: 9.5,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                          color: 'var(--emerald)',
                          fontWeight: 700,
                        }}
                      >
                        OPEN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{c.city}</div>
                </div>
                <RankBadge rank={c.rank} size={18} showLabel />
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{c.pts.toLocaleString()}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{c.win}% win</span>
                <FitBar v={c.fit} />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card padding={22}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: a.c, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{a.role}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FitBar({ v }: { v: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <span className="mono" style={{ fontSize: 11.5, color: 'var(--cool)', fontWeight: 700 }}>{v}% fit</span>
      <div style={{ width: 70, height: 5, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{ width: v + '%', height: '100%', background: 'var(--cool)', borderRadius: 999 }} />
      </div>
    </div>
  );
}
