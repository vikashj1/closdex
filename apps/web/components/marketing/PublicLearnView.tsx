'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { RankBadge } from '@/components/ui/RankBadge';
import type { RankName } from '@/lib/constants';
import { MarketingCTA, PublicFooter, PublicHeader, PublicScreen } from './PublicChrome';
import { ImgPh } from './ImgPh';
import { mLede, mp, mSectionHead } from './styles';

const DIMS = [
  { t: 'Discovery', b: 'Did you uncover real need, budget, and decision process, or just pitch?', icon: <Icon.search /> },
  { t: 'Objection handling', b: 'How well you acknowledged, reframed, and resolved pushback under pressure.', icon: <Icon.target /> },
  { t: 'Value articulation', b: "Tying your solution to the buyer's specific pain, in their language.", icon: <Icon.bolt /> },
  { t: 'Conversation control', b: 'Pace, question quality, and keeping the exchange moving toward the goal.', icon: <Icon.send /> },
  { t: 'Goal execution', b: "Did you actually achieve the scenario's objective? The call, the proposal, the close?", icon: <Icon.trophy /> },
];

const RANKS: Array<{ name: RankName; min: number }> = [
  { name: 'Rookie', min: 0 },
  { name: 'Bronze', min: 500 },
  { name: 'Silver', min: 1500 },
  { name: 'Gold', min: 4000 },
  { name: 'Platinum', min: 9000 },
  { name: 'Diamond', min: 18000 },
  { name: 'Master', min: 35000 },
  { name: 'Grandmaster', min: 70000 },
];

const GUIDES = [
  { cat: 'Discovery', t: 'The five questions that qualify any IT-sales lead', time: '6 min', level: 'Foundational' },
  { cat: 'Objections', t: "Reframing 'you're too expensive' without dropping price", time: '8 min', level: 'Intermediate' },
  { cat: 'Cold outreach', t: "Earning a reply from a CTO who's heard every pitch", time: '7 min', level: 'Intermediate' },
  { cat: 'Closing', t: 'Creating urgency that survives procurement', time: '9 min', level: 'Advanced' },
  { cat: 'Methodology', t: 'SPIN vs MEDDIC: when each one wins', time: '10 min', level: 'Foundational' },
  { cat: 'Career', t: 'Turning your rank into interview requests', time: '5 min', level: 'Foundational' },
];

const METHODS = [
  { k: 'SPIN', d: 'Situation, Problem, Implication, Need-payoff. Question-led discovery.' },
  { k: 'BANT', d: 'Budget, Authority, Need, Timeline. Fast lead qualification.' },
  { k: 'MEDDIC', d: 'Metrics, Economic buyer, Decision criteria, and more. Enterprise deals.' },
  { k: 'Challenger', d: "Teach, Tailor, Take control. Reframe the buyer's thinking." },
];

export function PublicLearnView() {
  const router = useRouter();

  return (
    <PublicScreen>
      <PublicHeader active="info-learn" />

      <section style={{ padding: '72px 64px 48px', textAlign: 'center' }}>
        <div style={{ ...mp('var(--gold)'), margin: '0 auto' }}>Learn · scoring, ranks & sales craft</div>
        <h1
          className="display"
          style={{
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.035em',
            margin: '18px auto 16px',
            maxWidth: 740,
          }}
        >
          Learn the game. <span style={{ color: 'var(--gold)' }}>Then go win it.</span>
        </h1>
        <p style={{ ...mLede, fontSize: 16.5, margin: '0 auto' }}>
          Exactly how scoring works, how ranks are earned, and the sales craft behind every
          challenge. All out in the open. No black box, no gatekeeping.
        </p>
      </section>

      <section
        style={{ padding: '64px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ marginBottom: 36 }}>
          <div style={mp('var(--gold)')}>How scoring works</div>
          <h2 className="display" style={mSectionHead}>Five dimensions, one transparent formula.</h2>
          <p style={mLede}>
            Every challenge is graded 1–5 across five dimensions. Those combine with your goal
            outcome and difficulty to produce the points that move your rank.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
          {DIMS.map((d, i) => (
            <Card key={d.t} padding={18}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, marginBottom: 10 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ color: 'var(--gold)', marginBottom: 10 }}>{d.icon}</div>
              <h3 className="display" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.2 }}>
                {d.t}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, margin: 0 }}>{d.b}</p>
            </Card>
          ))}
        </div>
        <Card padding={28} style={{ background: 'var(--surface)' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 14,
            }}
          >
            The points formula
          </div>
          <div
            className="mono"
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 15, fontWeight: 600 }}
          >
            <span style={{ padding: '8px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--gold) 14%, transparent)', color: 'var(--gold)' }}>
              Base (difficulty)
            </span>
            <span style={{ color: 'var(--text-mute)' }}>×</span>
            <span style={{ padding: '8px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--emerald) 14%, transparent)', color: 'var(--emerald)' }}>
              Goal multiplier
            </span>
            <span style={{ color: 'var(--text-mute)' }}>×</span>
            <span style={{ padding: '8px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--gold) 14%, transparent)', color: 'var(--gold)' }}>
              Quality (rubric avg)
            </span>
            <span style={{ color: 'var(--text-mute)' }}>+</span>
            <span style={{ padding: '8px 14px', borderRadius: 8, background: 'color-mix(in oklch, var(--cool) 14%, transparent)', color: 'var(--cool)' }}>
              Bonuses
            </span>
            <span style={{ color: 'var(--text-mute)' }}>=</span>
            <span style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--gold)', color: 'oklch(0.18 0.02 75)' }}>
              Points earned
            </span>
          </div>
          <div
            style={{ display: 'flex', gap: 24, marginTop: 18, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-dim)' }}
          >
            <span>
              <strong style={{ color: 'var(--text)' }}>Speed bonus</strong> — hit the goal in fewer
              messages.
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>First-try bonus</strong> — clear it without
              a retry.
            </span>
            <span>
              <strong style={{ color: 'var(--text)' }}>Streak bonus</strong> — compounds with daily
              play.
            </span>
          </div>
        </Card>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={mp('var(--gold)')}>The rank system</div>
          <h2 className="display" style={mSectionHead}>Eight ranks. Points are the only currency.</h2>
          <p style={mLede}>
            Cross a threshold and you rank up for good, unlocking harder tiers and more visibility
            to hiring partners.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {RANKS.map((r) => (
            <Card key={r.name} padding={20} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <RankBadge rank={r.name} size={32} />
              <div>
                <div className="display" style={{ fontSize: 16, fontWeight: 700 }}>{r.name}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                  {r.min.toLocaleString()}+ pts
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section
        style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={mp('var(--gold)')}>Guides & playbooks</div>
            <h2 className="display" style={mSectionHead}>Sharpen the craft between challenges.</h2>
          </div>
          <Btn kind="ghost" size="md" icon={<Icon.arrow />} onClick={() => router.push('/signup')}>
            All guides
          </Btn>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {GUIDES.map((g) => (
            <Card
              key={g.t}
              padding={0}
              hover
              onClick={() => router.push('/signup')}
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <ImgPh label={`${g.cat.toLowerCase()} — cover`} height={140} style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border-soft)' }} />
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      color: 'var(--gold)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {g.cat}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{g.level}</span>
                </div>
                <h3
                  className="display"
                  style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px', lineHeight: 1.3, flex: 1 }}
                >
                  {g.t}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11.5,
                    color: 'var(--text-mute)',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-soft)',
                  }}
                >
                  <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon.clock /> {g.time} read
                  </span>
                  <span
                    style={{
                      color: 'var(--gold)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Read <Icon.arrow />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={mp('var(--cool)')}>Methodology primers</div>
          <h2 className="display" style={mSectionHead}>The frameworks behind the rubric.</h2>
          <p style={mLede}>
            Our scenarios and scoring draw on the methodologies working teams actually use.
            Enablement customers can weight the rubric to any of them.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {METHODS.map((m) => (
            <Card key={m.k} padding={24}>
              <div
                className="display"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--cool)',
                  letterSpacing: '-0.02em',
                  marginBottom: 10,
                }}
              >
                {m.k}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>{m.d}</p>
            </Card>
          ))}
        </div>
      </section>

      <MarketingCTA
        eyebrow="Theory's nice. Reps are better."
        title="Put the playbook to work."
        body="You've seen exactly how it's scored. Now take a challenge and earn your first points."
        primary={{ label: 'Start a challenge — free', to: 'signup' }}
        secondary={{ label: 'See the leaderboard', to: 'info-leaderboard' }}
      />
      <PublicFooter />
    </PublicScreen>
  );
}
