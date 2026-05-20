'use client';

import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Stat } from '@/components/ui/Stat';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';
import type { DifficultyLevel } from '@/lib/constants';

interface RecentChallenge {
  t: string;
  level: DifficultyLevel;
  s: number;
  ach: boolean;
  when: string;
}

const GOAL_PERF = [
  { l: 'Qualify Lead',          v: 84, count: 16 },
  { l: 'Book Discovery Call',   v: 71, count: 14 },
  { l: 'Send Proposal',         v: 65, count: 9 },
  { l: 'Reach Decision Maker',  v: 48, count: 5 },
  { l: 'Close the Deal',        v: 33, count: 3 },
  { l: 'Win-back',              v: 50, count: 1 },
];

const RECENT: RecentChallenge[] = [
  { t: 'The Skeptical CTO',           level: 'Hard',   s: 522, ach: true,  when: '2h ago' },
  { t: 'Cold call → demo',            level: 'Medium', s: 312, ach: true,  when: '1d ago' },
  { t: 'Pricing pushback',            level: 'Medium', s: 184, ach: false, when: '3d ago' },
  { t: 'Gatekeeper bypass',           level: 'Hard',   s: 410, ach: true,  when: '4d ago' },
  { t: 'Cybersecurity to non-tech',   level: 'Hard',   s: 0,   ach: false, when: '5d ago' },
];

const BADGES = [
  { e: '🎯', n: 'First Goal',     on: true },
  { e: '🛡️', n: 'Objection Pro',  on: true },
  { e: '⚡', n: 'Speed Demon',    on: true },
  { e: '🔥', n: '5-day Streak',   on: true },
  { e: '💎', n: 'Diamond',        on: false },
  { e: '👑', n: 'Top 10',         on: false },
  { e: '🤝', n: 'First Hire',     on: false },
  { e: '🚀', n: 'Founding',       on: true },
];

const VIEWERS = [
  { co: 'Razorpay',    role: 'Senior AE — IT Sales', time: '5h ago' },
  { co: 'Zoho',        role: 'SDR Manager',          time: '1d ago' },
  { co: 'Freshworks',  role: 'Account Executive',    time: '2d ago' },
];

export default function ProfilePage() {
  return (
    <div>
      {/* Cover band */}
      <div style={{ height: 140, background: 'linear-gradient(135deg, color-mix(in oklch, var(--gold) 30%, var(--bg-2)) 0%, var(--bg-2) 100%)', position: 'relative' }}>
        <div className="stripe-ph" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>
      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginTop: -56 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name="Shashank Khare" size={120} />
            <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
              <RankBadge rank="Gold" size={44} />
            </div>
          </div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>Shashank Khare</h1>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                  color: 'var(--emerald)',
                  fontSize: 11,
                  fontWeight: 700,
                  border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                }}
              >
                ● OPEN TO WORK
              </span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              <strong style={{ color: 'var(--r-gold)' }}>Gold tier</strong> · Bangalore, India · 4 years sales experience · IT Sales / SaaS
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 6 }}>closdex.com/u/shashank</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="secondary" size="sm">Edit profile</Btn>
            <Btn kind="primary" size="sm">Share profile</Btn>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            marginTop: 28,
            padding: '20px 0',
            borderTop: '1px solid var(--border-soft)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <Stat label="Total points"  value="8,376" accent="var(--gold)" />
          <Stat label="Global rank"   value="#27"   sub="of 2,481" />
          <Stat label="Challenges"    value="48"    sub="completed" />
          <Stat label="Win rate"      value="73%"   sub="goal achieved" accent="var(--emerald)" />
          <Stat label="Best category" value="Discovery" sub="avg 4.3/5" />
        </div>

        {/* Activity heatmap */}
        <Card padding={22} style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Challenge activity</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-mute)', margin: '4px 0 0' }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>148 challenges</span> in the last 26 weeks · public profile shows last 12 weeks
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>5</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current streak (days)</div>
              </div>
              <div>
                <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>12</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Longest streak</div>
              </div>
              <div>
                <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>26%</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Days active</div>
              </div>
            </div>
          </div>
          <ActivityHeatmap weeks={26} seed={101} />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginTop: 22 }}>
          {/* Performance + recent challenges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Performance by goal type</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Overall', 'Category', 'Goal'].map((t, i) => (
                    <button
                      key={t}
                      style={{
                        padding: '5px 11px',
                        borderRadius: 6,
                        background: i === 2 ? 'var(--surface-2)' : 'transparent',
                        border: '1px solid var(--border-soft)',
                        color: 'var(--text)',
                        fontSize: 11.5,
                        fontWeight: 500,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {GOAL_PERF.map((g) => (
                  <div key={g.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12.5 }}>
                      <span>
                        {g.l} <span style={{ color: 'var(--text-mute)' }}>({g.count} attempts)</span>
                      </span>
                      <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{g.v}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: g.v + '%',
                          background: 'linear-gradient(90deg, color-mix(in oklch, var(--gold) 60%, var(--d-hard) 40%), var(--gold))',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Recent challenges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {RECENT.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'var(--bg-2)',
                    }}
                  >
                    <DifficultyTag level={c.level} size="sm" />
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.t}</span>
                    <span style={{ fontSize: 11, color: c.ach ? 'var(--emerald)' : 'var(--d-expert)' }}>
                      {c.ach ? '✓ Goal' : '✗ Missed'}
                    </span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: c.ach ? 'var(--gold)' : 'var(--text-mute)' }}>
                      {c.s > 0 ? '+' + c.s : '0'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{c.when}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Badges + career + viewers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Badges · 8 earned</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {BADGES.map((b) => (
                  <div
                    key={b.n}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      background: b.on ? 'color-mix(in oklch, var(--gold) 10%, var(--bg-2))' : 'var(--bg-2)',
                      border: `1px solid ${b.on ? 'color-mix(in oklch, var(--gold) 30%, transparent)' : 'var(--border-soft)'}`,
                      textAlign: 'center',
                      opacity: b.on ? 1 : 0.5,
                    }}
                  >
                    <div style={{ fontSize: 22 }}>{b.e}</div>
                    <div style={{ fontSize: 10.5, color: b.on ? 'var(--text)' : 'var(--text-mute)', marginTop: 4, fontWeight: 500 }}>
                      {b.n}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Career preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                <Row k="Open to work" v={<span style={{ color: 'var(--emerald)', fontWeight: 600 }}>● Yes</span>} />
                <Row k="Preferred locations" v="Bangalore, Remote" />
                <Row k="Expected CTC"        v="₹16-22 LPA" />
                <Row k="Notice period"       v="30 days" />
                <Row k="Resume"              v={<a style={{ color: 'var(--gold)', textDecoration: 'underline' }}>shashank_resume_v3.pdf</a>} />
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Companies viewing you</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {VIEWERS.map((v) => (
                  <div
                    key={v.co}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-2)' }}
                  >
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{v.co}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{v.role}</div>
                    </div>
                    <span style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{v.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-mute)' }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
