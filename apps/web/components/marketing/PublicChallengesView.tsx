'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { DIFFICULTY, type DifficultyLevel } from '@/lib/constants';
import { MarketingCTA, PublicFooter, PublicHeader, PublicScreen } from './PublicChrome';
import { ImgPh } from './ImgPh';
import { mLede, mp, mSectionHead } from './styles';

const TIERS: Array<{
  name: DifficultyLevel;
  mood: string;
  desc: string;
  goal: string;
}> = [
  {
    name: 'Rookie',
    mood: 'Warm & cooperative',
    desc: 'Curious, wants to be sold to. Asks helpful questions and shares context freely.',
    goal: 'Capture interest · qualify lightly',
  },
  {
    name: 'Easy',
    mood: 'Mildly curious',
    desc: 'Polite engagement with one minor pushback. Open to your pitch, not yet committed.',
    goal: 'Book a follow-up · share materials',
  },
  {
    name: 'Medium',
    mood: 'Skeptical, asks for proof',
    desc: 'Throws two to three real objections. Wants data, case studies, a clear differentiator.',
    goal: 'Book a discovery call',
  },
  {
    name: 'Hard',
    mood: 'Busy & dismissive',
    desc: 'Replies in one sentence. Acts like a gatekeeper. Has heard every pitch in your category.',
    goal: 'Reach decision-maker · send proposal',
  },
  {
    name: 'Expert',
    mood: 'Hostile, well-informed',
    desc: "Comparison-shopping. Knows your competitors better than you. Won't suffer hype.",
    goal: 'Close the deal against competitors',
  },
];

const PERSONAS: Array<{ e: string; n: string; desc: string; count: number; level: DifficultyLevel }> = [
  { e: '❄️', n: 'The Cold Opener', desc: 'First contact. Warm them up or get shut down in two messages.', count: 18, level: 'Rookie' },
  { e: '🛡️', n: 'The Skeptic', desc: 'Heard every pitch. Wants proof, data, and a reason to keep listening.', count: 14, level: 'Hard' },
  { e: '🚪', n: 'The Gatekeeper', desc: 'Earn the warm intro to the actual decision-maker.', count: 9, level: 'Hard' },
  { e: '💰', n: 'The Pricing Pushback', desc: "Loves the product. Says you're 2× the alternatives.", count: 12, level: 'Medium' },
  { e: '👻', n: 'The Ghoster', desc: '60 days silent. Win the conversation back from the dead.', count: 7, level: 'Medium' },
  { e: '🏛️', n: 'The Committee', desc: 'Procurement, security, and the champion — all in one room.', count: 5, level: 'Expert' },
];

const LIBRARY: Array<{ title: string; level: DifficultyLevel; goal: string; points: number; time: string }> = [
  { title: 'Cold call → demo, mid-market SaaS', level: 'Medium', goal: 'Book a demo', points: 240, time: '10 min' },
  { title: 'Gatekeeper bypass: enterprise IT', level: 'Hard', goal: 'Reach decision-maker', points: 480, time: '12 min' },
  { title: 'Re-engage the ghosted prospect', level: 'Medium', goal: 'Revive lead', points: 256, time: '10 min' },
  { title: 'Pricing pushback — defend value', level: 'Medium', goal: 'Send proposal', points: 256, time: '15 min' },
  { title: 'Discovery with a curious CTO', level: 'Easy', goal: 'Qualify need', points: 120, time: '8 min' },
  { title: 'Displace the incumbent vendor', level: 'Expert', goal: 'Win the switch', points: 820, time: '18 min' },
];

const ANATOMY = [
  { s: '01', t: 'Pick a lead', b: "Choose a persona and difficulty tier. You'll see the buyer's role, company, and the goal you're chasing.", icon: <Icon.target /> },
  { s: '02', t: 'Have the conversation', b: 'Message back and forth with a live AI buyer. A timer and message counter keep the pressure real.', icon: <Icon.send /> },
  { s: '03', t: 'Hit your goal', b: 'Book the call, send the proposal, reach the decision-maker — whatever the scenario demands.', icon: <Icon.bolt /> },
  { s: '04', t: 'Get scored', b: 'A transparent five-dimension rubric grades the exchange and awards points toward your rank.', icon: <Icon.trophy /> },
];

const RUBRIC_PREVIEW: Array<[string, number]> = [
  ['Discovery', 4],
  ['Objection handling', 5],
  ['Value articulation', 4],
  ['Conversation control', 4],
  ['Goal execution', 5],
];

export function PublicChallengesView() {
  const router = useRouter();
  const goSignup = () => router.push('/signup');

  return (
    <PublicScreen>
      <PublicHeader active="info-challenges" />

      {/* Hero */}
      <section
        className="pad-x-fluid pad-y-hero grid-hero"
        style={{
          padding: '72px 64px 56px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: 48,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="hero-blob gold" style={{ top: -160, right: -120 }} />
        <div className="reveal-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={mp('var(--gold)')}>The arena floor · 80+ live scenarios</div>
          <h1
            className="display h-hero"
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '18px 0 18px',
            }}
          >
            Every lead you&apos;re<br />afraid of. <span className="grad-text-gold">On demand.</span>
          </h1>
          <p style={{ ...mLede, fontSize: 17.5, maxWidth: 520, marginBottom: 28 }}>
            Challenges are realistic, dynamic conversations with AI-simulated buyers. Same
            scenario, different conversation every time. The lead reacts to what you actually say.
            Pick a tier, hit your goal, get scored.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={goSignup}>
              Start your first challenge
            </Btn>
            <Btn kind="ghost" size="lg" icon={<Icon.trophy />} onClick={() => router.push('/leaderboard')}>
              See the leaderboard
            </Btn>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 36, color: 'var(--text-mute)', fontSize: 12.5 }}>
            {[['80+', 'scenarios'], ['6', 'persona archetypes'], ['5', 'difficulty tiers']].map(([n, l]) => (
              <div key={l}>
                <span
                  className="display mono"
                  style={{ color: 'var(--text)', fontSize: 24, fontWeight: 700, marginRight: 6 }}
                >
                  {n}
                </span>
                {l}
              </div>
            ))}
          </div>
        </div>
        <div className="float-soft reveal-up d-200" style={{ position: 'relative', zIndex: 1 }}>
          <ImgPh label="hero — conversation screenshot" height={380} />
        </div>
      </section>

      {/* Anatomy */}
      <section
        className="pad-x-fluid pad-y-section"
        style={{ padding: '72px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ marginBottom: 36 }}>
          <div style={mp('var(--gold)')}>Anatomy of an at-bat</div>
          <h2 className="display" style={mSectionHead}>How one challenge works.</h2>
          <p style={mLede}>
            Four beats, every time. No scripts, no branching trees. Just a buyer with a backstory and
            a goal you have to earn.
          </p>
        </div>
        <div className="grid-4-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ANATOMY.map((c) => (
            <Card key={c.s} padding={22} hover>
              <div className="mono" style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                {c.s}
              </div>
              <div style={{ color: 'var(--gold)', marginBottom: 10 }}>{c.icon}</div>
              <h3 className="display" style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 700 }}>
                {c.t}
              </h3>
              <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: 13, lineHeight: 1.5 }}>{c.b}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Difficulty tiers */}
      <section className="pad-x-fluid pad-y-section" style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={mp('var(--gold)')}>Five tiers · unlocked as you rank up</div>
          <h2 className="display" style={mSectionHead}>
            From warm prospect to <span style={{ color: 'var(--d-expert)' }}>hostile decision-maker</span>.
          </h2>
          <p style={mLede}>
            Each tier shifts the buyer&apos;s personality, objection density, and goal complexity.
            Your skill ceiling keeps moving, and so do the points on offer.
          </p>
        </div>
        <div className="grid-5-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          {TIERS.map((t) => {
            const d = DIFFICULTY[t.name];
            return (
              <Card
                key={t.name}
                padding={0}
                style={{
                  overflow: 'hidden',
                  borderColor: `color-mix(in oklch, ${d.color} 30%, var(--border))`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ height: 5, background: d.color }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <DifficultyTag level={t.name} size="sm" />
                    <span
                      className="display mono"
                      style={{ fontSize: 22, fontWeight: 700, color: d.color, letterSpacing: '-0.02em' }}
                    >
                      {d.base}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.color, lineHeight: 1.3 }}>{t.mood}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>{t.desc}</div>
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px dashed var(--border-soft)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-mute)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 600,
                      }}
                    >
                      Typical goal
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text)', marginTop: 4, lineHeight: 1.4 }}>{t.goal}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Personas */}
      <section className="pad-x-fluid pad-y-section" style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <div style={mp('var(--gold)')}>Six persona archetypes</div>
            <h2 className="display" style={mSectionHead}>Practice the leads that actually scare you.</h2>
            <p style={mLede}>
              Every persona reacts dynamically, built from real call transcripts contributed by working
              sales coaches.
            </p>
          </div>
          <Btn kind="ghost" size="md" icon={<Icon.arrow />} onClick={goSignup}>
            Browse all 80+
          </Btn>
        </div>
        <div className="grid-3-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PERSONAS.map((p) => (
            <Card key={p.n} padding={22} hover onClick={goSignup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ fontSize: 40 }}>{p.e}</div>
                <DifficultyTag level={p.level} size="sm" />
              </div>
              <h3 className="display" style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px' }}>{p.n}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>{p.desc}</p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-soft)',
                }}
              >
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{p.count} variations</span>
                <span
                  style={{
                    color: 'var(--gold)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Practice this <Icon.arrow />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Library preview (gated) */}
      <section className="pad-x-fluid pad-y-section" style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={mp('var(--gold)')}>A peek at the library</div>
          <h2 className="display" style={mSectionHead}>Fresh challenges drop every week.</h2>
        </div>
        <div style={{ position: 'relative' }}>
          <div className="grid-3-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {LIBRARY.map((c, i) => (
              <Card key={c.title} padding={18} hover style={i >= 3 ? { opacity: 0.5 } : undefined}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <DifficultyTag level={c.level} size="sm" />
                  <span className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
                    +{c.points}
                  </span>
                </div>
                <h3
                  className="display"
                  style={{ fontSize: 17, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.25 }}
                >
                  {c.title}
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
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icon.target /> {c.goal}
                  </span>
                  <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon.clock /> {c.time}
                  </span>
                </div>
              </Card>
            ))}
          </div>
          {/* gate */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: -10,
              height: 240,
              background: 'linear-gradient(to bottom, transparent, var(--bg) 72%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 8,
            }}
          >
            <Card padding={22} style={{ textAlign: 'center', maxWidth: 460 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                Sign up free to unlock all 80+ challenges
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.5 }}>
                No credit card. No paywall. Take your calibration challenge and get your first rank in
                under five minutes.
              </div>
              <Btn kind="primary" size="md" icon={<Icon.bolt />} onClick={goSignup}>
                Create free account
              </Btn>
            </Card>
          </div>
        </div>
        <div style={{ height: 150 }} />
      </section>

      {/* Scoring teaser */}
      <section className="pad-x-fluid" style={{ padding: '0 64px 72px' }}>
        <Card padding={0} style={{ overflow: 'hidden', background: 'var(--bg-2)' }}>
          <div
            className="grid-2-1"
            style={{
              padding: 40,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={mp('var(--cool)')}>Scored on a published rubric</div>
              <h2
                className="display"
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  margin: '16px 0 12px',
                  lineHeight: 1.1,
                }}
              >
                Every message graded on five dimensions.
              </h2>
              <p style={{ ...mLede, fontSize: 14.5, marginBottom: 20 }}>
                Discovery, objection handling, value articulation, conversation control, and goal
                execution. Each scored 1–5, totally auditable. We show our work, and so should you.
              </p>
              <Btn kind="ghost" size="md" icon={<Icon.book />} onClick={() => router.push('/learn')}>
                See how scoring works
              </Btn>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RUBRIC_PREVIEW.map(([l, v]) => (
                <div key={l}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}
                  >
                    <span style={{ color: 'var(--text-dim)' }}>{l}</span>
                    <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{v}/5</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        style={{
                          flex: 1,
                          height: 5,
                          borderRadius: 3,
                          background: n <= v ? 'var(--gold)' : 'var(--bg-2)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <MarketingCTA
        eyebrow="Your first rank is 5 minutes away"
        title="Step into the arena."
        body="Free forever for salespersons. Pick a lead, have the conversation, and see where you land on the board."
      />
      <PublicFooter />
    </PublicScreen>
  );
}
