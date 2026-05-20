'use client';

import { useRouter } from 'next/navigation';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Stat } from '@/components/ui/Stat';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';
import { Icon } from '@/components/ui/Icon';
import type { DifficultyLevel } from '@/lib/constants';

interface Recommendation {
  title: string;
  level: DifficultyLevel;
  goal: string;
  points: number;
  time: string;
}

const RECOMMENDED: Recommendation[] = [
  { title: 'Email sequence: warm reply',         level: 'Easy',   goal: 'Book follow-up',         points: 110, time: '8 min' },
  { title: 'Gatekeeper bypass: enterprise IT',   level: 'Hard',   goal: 'Reach decision-maker',   points: 480, time: '12 min' },
  { title: 'Re-engage the ghosted prospect',     level: 'Medium', goal: 'Revive lead',            points: 240, time: '10 min' },
  { title: 'Pricing pushback — defend value',    level: 'Medium', goal: 'Send proposal',          points: 256, time: '15 min' },
];

const MINI_LEADERBOARD = [
  { r: 25, name: 'Tanvi Joshi',     pts: 8612, you: false },
  { r: 26, name: 'Vikram Singh',    pts: 8488, you: false },
  { r: 27, name: 'You (Shashank)',  pts: 8376, you: true },
  { r: 28, name: 'Arjun Pal',       pts: 8201, you: false },
  { r: 29, name: 'Pooja Verma',     pts: 8095, you: false },
];

const RECENT_ACTIVITY = [
  { t: "Cleared 'Cold call → demo'",         time: '2h ago', color: 'var(--emerald)',  pts: '+312' },
  { t: 'Profile viewed by Razorpay',          time: '5h ago', color: 'var(--cool)',     pts: null },
  { t: 'New job match: SDR @ Zoho',           time: '1d ago', color: 'var(--gold)',     pts: null },
  { t: "Badge earned: 'First Objection'",     time: '2d ago', color: 'var(--r-master)', pts: null },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>
            Welcome back, Shashank.
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            You&apos;re <strong style={{ color: 'var(--gold)' }}>624 points</strong> away from <RankBadge rank="Platinum" size={14} /> Platinum.
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
              <RankBadge rank="Gold" size={36} />
              <span className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--r-gold)' }}>Gold</span>
            </div>
          </div>
          <Stat label="Total points" value="8,376" sub="+1,204 this week" accent="var(--text)"    icon={<Icon.bolt />} />
          <Stat label="This week"    value="1,204" sub="↑ 38% vs last"   accent="var(--emerald)" icon={<Icon.trend />} />
          <Stat label="Streak"       value="5 days" sub="Best: 12 days"  accent="var(--gold)"    icon={<Icon.fire />} />
          <Stat label="Weekly rank"  value="#27"    sub="of 2,481 in IT Sales"                   icon={<Icon.trophy />} />
        </div>
        {/* Progress to next rank */}
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--text-dim)' }}>Progress to Platinum</span>
            <span className="mono" style={{ color: 'var(--text)' }}>8,376 / 9,000</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div style={{ width: '93%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--gold), var(--r-platinum))' }} />
          </div>
        </div>
      </Card>

      {/* Featured challenge */}
      <Card
        padding={0}
        style={{
          background: 'linear-gradient(135deg, color-mix(in oklch, var(--d-hard) 18%, var(--surface)) 0%, var(--surface) 60%)',
          borderColor: 'color-mix(in oklch, var(--d-hard) 30%, var(--border))',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0 }}>
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <DifficultyTag level="Hard" />
              <span style={{ ...BADGE_BASE, color: 'var(--gold)', background: 'color-mix(in oklch, var(--gold) 14%, transparent)', border: '1px solid color-mix(in oklch, var(--gold) 35%, transparent)' }}>
                ⭐ Challenge of the Day
              </span>
            </div>
            <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              The Skeptical CTO
            </h2>
            <p style={{ color: 'var(--text-dim)', margin: '0 0 16px', fontSize: 14, lineHeight: 1.55 }}>
              You&apos;re pitching a DevOps observability platform to a busy CTO at a Series B fintech. She&apos;s used 2 competitors before and isn&apos;t impressed. Goal:{' '}
              <strong style={{ color: 'var(--text)' }}>book a 30-min discovery call</strong>.
            </p>
            <div style={{ display: 'flex', gap: 18, marginBottom: 20, fontSize: 12, color: 'var(--text-dim)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.bolt /> <strong style={{ color: 'var(--text)' }}>400 base × 1.2 goal</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon.clock /> 15 min limit
              </span>
              <span>💬 25 messages max</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn kind="primary" icon={<Icon.arrow />} onClick={() => router.push('/challenges/featured')}>
                View details
              </Btn>
              <Btn kind="ghost">Save for later</Btn>
            </div>
          </div>
          <div style={{ padding: 28, borderLeft: '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Lead persona
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <Avatar name="Meera Krishnan" size={48} color="oklch(0.55 0.14 290)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Meera Krishnan</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>CTO · Vector Pay (Series B Fintech)</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-dim)' }}>
              <div>⏰ <strong style={{ color: 'var(--text)' }}>Time-poor</strong> — replies in 1-2 sentences</div>
              <div>🛡️ <strong style={{ color: 'var(--text)' }}>Has objections</strong> on pricing, integration time</div>
              <div>🔁 <strong style={{ color: 'var(--text)' }}>Comparison shops</strong> — knows your top 2 competitors</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Activity heatmap */}
      <Card padding={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Your challenge activity</h3>
            <p style={{ fontSize: 12, color: 'var(--text-mute)', margin: '4px 0 0' }}>
              148 challenges in the last 26 weeks · longest streak: 12 days
            </p>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>
                5 <span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 500 }}>days</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current streak</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                26<span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 500 }}>%</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Days active</div>
            </div>
          </div>
        </div>
        <ActivityHeatmap weeks={26} seed={101} />
      </Card>

      {/* Three columns: recommended / mini-leaderboard / recent activity */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECOMMENDED.map((c) => (
              <div
                key={c.title}
                onClick={() => router.push('/challenges/featured')}
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
                    <DifficultyTag level={c.level} size="sm" />
                    <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{c.goal}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono display" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>+{c.points}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{c.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Mini leaderboard · weekly</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MINI_LEADERBOARD.map((row) => (
              <div
                key={row.r}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '7px 9px',
                  borderRadius: 8,
                  background: row.you ? 'color-mix(in oklch, var(--gold) 14%, transparent)' : 'transparent',
                }}
              >
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: row.you ? 'var(--gold)' : 'var(--text-mute)' }}>
                  #{row.r}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={row.name} size={22} />
                  <span style={{ fontSize: 12.5, fontWeight: row.you ? 700 : 500, color: row.you ? 'var(--gold)' : 'var(--text)' }}>
                    {row.name}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{row.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={20}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {RECENT_ACTIVITY.map((a, i) => (
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

const BADGE_BASE = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 600,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: 4,
};
