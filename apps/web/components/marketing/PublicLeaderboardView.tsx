'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { RankBadge } from '@/components/ui/RankBadge';
import type { RankName } from '@/lib/constants';
import { MarketingCTA, PublicFooter, PublicHeader, PublicScreen } from './PublicChrome';
import { mLede, mp, mSectionHead } from './styles';

const ROWS: Array<{ r: number; name: string; city: string; rank: RankName; pts: number; win: string; trend: string }> = [
  { r: 1, name: 'Aarav Sharma', city: 'Bangalore', rank: 'Master', pts: 38420, win: '94%', trend: '+842' },
  { r: 2, name: 'Priya Iyer', city: 'Mumbai', rank: 'Master', pts: 36110, win: '92%', trend: '+512' },
  { r: 3, name: 'Karan Mehta', city: 'Pune', rank: 'Diamond', pts: 28940, win: '89%', trend: '+1,204' },
  { r: 4, name: 'Sneha Reddy', city: 'Hyderabad', rank: 'Diamond', pts: 22180, win: '87%', trend: '+318' },
  { r: 5, name: 'Rohan Gupta', city: 'Delhi NCR', rank: 'Platinum', pts: 17850, win: '84%', trend: '+96' },
  { r: 6, name: 'Anjali Nair', city: 'Bangalore', rank: 'Platinum', pts: 14210, win: '83%', trend: '+632' },
  { r: 7, name: 'Vikram Desai', city: 'Mumbai', rank: 'Platinum', pts: 12740, win: '81%', trend: '+204' },
  { r: 8, name: 'Meera Joshi', city: 'Chennai', rank: 'Gold', pts: 9880, win: '79%', trend: '+440' },
  { r: 9, name: 'Arjun Rao', city: 'Bangalore', rank: 'Gold', pts: 8120, win: '77%', trend: '+118' },
  { r: 10, name: 'Divya Menon', city: 'Kochi', rank: 'Gold', pts: 6540, win: '75%', trend: '+512' },
  { r: 11, name: 'Sahil Khanna', city: 'Delhi NCR', rank: 'Gold', pts: 5310, win: '73%', trend: '+88' },
  { r: 12, name: 'Nikhil Verma', city: 'Pune', rank: 'Silver', pts: 4120, win: '71%', trend: '+260' },
];

const RANKS: Array<{ name: RankName; min: number }> = [
  { name: 'Grandmaster', min: 70000 },
  { name: 'Master', min: 35000 },
  { name: 'Diamond', min: 18000 },
  { name: 'Platinum', min: 9000 },
  { name: 'Gold', min: 4000 },
  { name: 'Silver', min: 1500 },
  { name: 'Bronze', min: 500 },
  { name: 'Rookie', min: 0 },
];

const FILTER_CHIPS = [
  { g: 'Vertical', items: ['IT Sales', 'Cloud', 'DevTools', 'Cybersecurity'] },
  { g: 'City', items: ['All India', 'Bangalore', 'Mumbai', 'Delhi NCR'] },
  { g: 'Window', items: ['This week', 'This month', 'All time'] },
];

const FAIRNESS = [
  { t: 'Published rubric', b: 'The scoring formula is public and every point is auditable. No black box. Companies see the full performance breakdown, not just a number.', icon: <Icon.book /> },
  { t: 'Gaming detection', b: 'ML flags copy-paste patterns and scripted plays. Scores that look engineered are reviewed and removed before they ever rank.', icon: <Icon.target /> },
  { t: 'Dispute window', b: 'Salespersons can dispute any score for human review within 48 hours, keeping the board accurate and fair on both sides.', icon: <Icon.clock /> },
];

export function PublicLeaderboardView() {
  const router = useRouter();
  const goSignup = () => router.push('/signup');

  return (
    <PublicScreen>
      <PublicHeader active="info-leaderboard" />

      <section
        style={{
          padding: '64px 64px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 40,
          alignItems: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="hero-blob gold" style={{ top: -180, right: -140 }} />
        <div className="reveal-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={mp('var(--gold)')}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: 'var(--emerald)',
                animation: 'pulseDot 1.5s infinite',
              }}
            />
            Live · IT Sales · India · resets in 2d 14h
          </div>
          <h1
            className="display"
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '18px 0 16px',
            }}
          >
            The board companies<br />
            <span className="grad-text-gold">actually watch.</span>
          </h1>
          <p style={{ ...mLede, fontSize: 17 }}>
            2,481 salespersons ranked purely on performance. No resumes, no referrals, no inflated
            titles. Every point is earned in the arena and auditable on a published rubric.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 28, paddingBottom: 6 }}>
          {[['2,481', 'ranked'], ['47', 'hiring partners'], ['312', 'Gold+']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'right' }}>
              <div className="display mono" style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {n}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 64px 8px' }}>
        <Card padding={16} style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          {FILTER_CHIPS.map((f) => (
            <div key={f.g} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                {f.g}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {f.items.map((it, i) => (
                  <Chip key={it} active={i === 0}>{it}</Chip>
                ))}
              </div>
            </div>
          ))}
          <div
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              color: 'var(--text-mute)',
            }}
          >
            <Icon.filter /> More filters require an account
          </div>
        </Card>
      </section>

      <section style={{ padding: '24px 64px 0' }}>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 1fr 130px 120px 110px 100px',
              gap: 14,
              padding: '12px 22px',
              borderBottom: '1px solid var(--border-soft)',
              background: 'var(--bg-2)',
              fontSize: 11,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            <div>Rank</div><div>Salesperson</div><div>Tier</div><div>Points</div><div>Win rate</div><div>Trend</div>
          </div>
          <div style={{ position: 'relative' }}>
            {ROWS.map((row, i) => (
              <div
                key={row.r}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 130px 120px 110px 100px',
                  gap: 14,
                  padding: '13px 22px',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-soft)',
                  opacity: i >= 9 ? 0.45 : 1,
                  background:
                    row.r <= 3 ? 'color-mix(in oklch, var(--gold) 5%, transparent)' : 'transparent',
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: row.r <= 3 ? 'var(--gold)' : 'var(--text-mute)',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  #{row.r}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Avatar name={row.name} size={32} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{row.city}</div>
                  </div>
                </div>
                <RankBadge rank={row.rank} size={18} />
                <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
                  {row.pts.toLocaleString()}
                </div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)' }}>{row.win}</div>
                <div
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: 'var(--emerald)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Icon.trend /> {row.trend}
                </div>
              </div>
            ))}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 260,
                background: 'linear-gradient(to bottom, transparent, var(--surface) 70%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 24,
              }}
            >
              <Card padding={24} style={{ textAlign: 'center', maxWidth: 480 }}>
                <Icon.trophy />
                <div style={{ fontSize: 16, fontWeight: 700, margin: '10px 0 6px' }}>
                  2,469 more ranked salespersons below
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.5 }}>
                  Sign up free to see the full board, filter by skill, win-rate and goal-type, and
                  track where <em>you</em> land.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Btn kind="primary" size="md" icon={<Icon.bolt />} onClick={goSignup}>
                    See the full board
                  </Btn>
                  <Btn kind="ghost" size="md" onClick={() => router.push('/learn')}>
                    How ranking works
                  </Btn>
                </div>
              </Card>
            </div>
          </div>
        </Card>
        <div style={{ height: 40 }} />
      </section>

      <section
        style={{ padding: '72px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div style={mp('var(--gold)')}>Eight ranks · one ladder</div>
            <h2 className="display" style={mSectionHead}>Everyone starts at Rookie. The rest you earn.</h2>
            <p style={{ ...mLede, marginBottom: 20 }}>
              Points accumulate from every challenge you clear. Cross a threshold and you rank up,
              unlocking harder tiers, more visibility to companies, and a brighter badge on your
              public profile.
            </p>
            <Btn kind="ghost" size="md" icon={<Icon.book />} onClick={() => router.push('/learn')}>
              Read the scoring guide
            </Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RANKS.map((r) => (
              <div
                key={r.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 18px',
                  borderRadius: 999,
                  background: 'var(--surface)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <RankBadge rank={r.name} size={24} />
                <span className="display" style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>{r.name}</span>
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
                  {r.min.toLocaleString()}+ pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ ...mp('var(--emerald)'), margin: '0 auto' }}>Built to be trusted</div>
          <h2 className="display" style={{ ...mSectionHead, margin: '16px auto 8px' }}>
            Why companies treat this as a hiring signal.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {FAIRNESS.map((c) => (
            <Card key={c.t} padding={24}>
              <div style={{ color: 'var(--emerald)', marginBottom: 12 }}>{c.icon}</div>
              <h3 className="display" style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px' }}>{c.t}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>{c.b}</p>
            </Card>
          ))}
        </div>
      </section>

      <MarketingCTA
        eyebrow="Claim your spot"
        title="Where will you land?"
        body="Sign up free, clear a few challenges, and watch your name climb the board the companies are already watching."
        secondary={{ label: 'Hire from the board', to: 'info-companies' }}
      />
      <PublicFooter />
    </PublicScreen>
  );
}
