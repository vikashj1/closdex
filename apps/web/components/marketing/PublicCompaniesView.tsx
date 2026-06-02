'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { RankBadge } from '@/components/ui/RankBadge';
import type { RankName } from '@/lib/constants';
import { MarketingCTA, PublicFooter, PublicHeader, PublicScreen } from './PublicChrome';
import { ImgPh } from './ImgPh';
import { mLede, mp, mSectionHead } from './styles';

const CANDIDATES: Array<{ name: string; role: string; city: string; rank: RankName; win: string; open: boolean }> = [
  { name: 'Aarav Sharma', role: 'Enterprise AE · 6 yrs', city: 'Bangalore', rank: 'Master', win: '94%', open: true },
  { name: 'Sneha Reddy', role: 'SDR → AE · 3 yrs', city: 'Hyderabad', rank: 'Diamond', win: '87%', open: true },
  { name: 'Rohan Gupta', role: 'Inside Sales · 4 yrs', city: 'Delhi NCR', rank: 'Platinum', win: '84%', open: false },
];

const OLD_WAY = [
  'Resumes optimised for keywords, not skill',
  'Interviews that reward confidence over competence',
  'Weeks of screening calls to find one closer',
  "No way to verify a '120% of quota' claim",
];

const NEW_WAY = [
  'A ranked pool where skill is measured, not claimed',
  'Full performance breakdown before you ever call',
  'Filter to your exact ICP in seconds',
  'Verified, auditable scores on a published rubric',
];

const STEPS = [
  { s: '01', t: 'Search the ranked pool', b: 'Filter 2,481 salespersons by rank, win-rate, goal-type performance, vertical, and city. Shortlist in one click.', label: 'filter + results grid' },
  { s: '02', t: 'Evaluate real performance', b: 'Open a candidate to see their rubric scores, conversation replays, activity heatmap, and rank history. Not just a CV.', label: 'candidate breakdown' },
  { s: '03', t: 'Hire with a guarantee', b: 'Send an interview request, make the offer, and pay only on a confirmed hire. Backed by 90-day replacement.', label: 'offer + billing' },
];

const FEATURES = [
  { t: 'Pre-vetted ranked pool', b: 'Every candidate has cleared real challenges. Rank is the floor of the conversation, not a self-reported guess.', icon: <Icon.trophy /> },
  { t: 'Performance breakdowns', b: 'Five-dimension rubric scores, win-rate by difficulty, and goal-type strengths on every profile.', icon: <Icon.trend /> },
  { t: 'Precision skill filters', b: 'Slice by objection-handling, discovery, or closing performance. Not just years of experience.', icon: <Icon.filter /> },
  { t: 'One-click shortlists', b: 'Build shared shortlists your whole hiring panel can review, comment on, and rank.', icon: <Icon.target /> },
  { t: '90-day guarantee', b: "If a hire doesn't work out in 90 days, we replace them or refund 50% of the placement fee.", icon: <Icon.check /> },
  { t: 'Indian-first payments', b: 'GST invoicing, Razorpay + Stripe, and INR pricing built for Indian finance teams.', icon: <Icon.briefcase /> },
];

const LOGOS = ['Razorpay', 'Zoho', 'Freshworks', 'Postman', 'Atlan', 'BrowserStack'];

export function PublicCompaniesView() {
  const router = useRouter();

  return (
    <PublicScreen>
      <PublicHeader active="info-companies" />

      <section
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
        <div className="hero-blob cool" style={{ top: -160, right: -120 }} />
        <div className="reveal-up" style={{ position: 'relative', zIndex: 1 }}>
          <div style={mp('var(--cool)')}>For hiring teams · IT Sales vertical</div>
          <h1
            className="display"
            style={{
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '18px 0 18px',
            }}
          >
            Hire sales talent on{' '}
            <span className="grad-text-cool">objective performance.</span>
          </h1>
          <p style={{ ...mLede, fontSize: 17, maxWidth: 540, marginBottom: 28 }}>
            Stop reading the same 200 &quot;results-driven, dynamic SDR&quot; resumes. Search a
            pre-vetted, ranked talent pool, view live performance breakdowns, and hire with a 90-day
            replacement guarantee.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn kind="primary" size="lg" icon={<Icon.briefcase />} onClick={() => router.push('/signup')} style={{ background: 'var(--cool)', color: 'white' }}>
              Book a 20-min demo
            </Btn>
            <Btn kind="ghost" size="lg" icon={<Icon.search />} onClick={() => router.push('/signup')}>
              Browse talent — free
            </Btn>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 36, color: 'var(--text-mute)', fontSize: 12.5 }}>
            {[['18d', 'avg time to hire'], ['312', 'candidates Gold+'], ['90d', 'replacement guarantee']].map(([n, l]) => (
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
          <ImgPh label="talent search dashboard" height={380} />
        </div>
      </section>

      <section
        style={{ padding: '72px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card padding={32} style={{ borderColor: 'color-mix(in oklch, var(--d-expert) 25%, var(--border))' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--d-expert)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              The old way
            </div>
            {OLD_WAY.map((t) => (
              <div
                key={t}
                style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}
              >
                <span style={{ color: 'var(--d-expert)', flexShrink: 0 }}>✕</span>
                {t}
              </div>
            ))}
          </Card>
          <Card padding={32} style={{ borderColor: 'color-mix(in oklch, var(--cool) 30%, var(--border))' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--cool)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              With Closdex
            </div>
            {NEW_WAY.map((t) => (
              <div
                key={t}
                style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.5 }}
              >
                <span style={{ color: 'var(--cool)', flexShrink: 0 }}>
                  <Icon.check />
                </span>
                {t}
              </div>
            ))}
          </Card>
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={mp('var(--cool)')}>Three steps to a confirmed hire</div>
          <h2 className="display" style={mSectionHead}>Search. Evaluate. Hire.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {STEPS.map((c) => (
            <div key={c.s}>
              <ImgPh label={c.label} height={180} style={{ marginBottom: 16 }} />
              <div className="mono" style={{ color: 'var(--cool)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                {c.s}
              </div>
              <h3 className="display" style={{ fontSize: 21, fontWeight: 700, margin: '0 0 8px' }}>{c.t}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div style={{ marginBottom: 36 }}>
          <div style={mp('var(--cool)')}>Everything in the hiring console</div>
          <h2 className="display" style={mSectionHead}>Built for sales-hiring decisions.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map((c) => (
            <Card key={c.t} padding={22} hover>
              <div style={{ color: 'var(--cool)', marginBottom: 12 }}>{c.icon}</div>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{c.t}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.55, margin: 0 }}>{c.b}</p>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={mp('var(--cool)')}>A glimpse of the pool</div>
            <h2 className="display" style={mSectionHead}>Talent you could be talking to today.</h2>
          </div>
          <Btn kind="ghost" size="md" icon={<Icon.arrow />} onClick={() => router.push('/signup')}>
            Open talent search
          </Btn>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {CANDIDATES.map((c) => (
            <Card key={c.name} padding={20} hover onClick={() => router.push('/signup')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={c.name} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{c.role}</div>
                </div>
                <RankBadge rank={c.rank} size={22} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--cool)' }}>{c.win}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>win rate</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{c.city}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>location</div>
                  </div>
                </div>
                {c.open ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--emerald)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--emerald)' }} />
                    Open to work
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)' }}>Passive</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 64px 72px' }}>
        <Card padding={0} style={{ overflow: 'hidden', background: 'var(--bg-2)' }}>
          <div
            style={{
              padding: 40,
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: 40,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={mp('var(--cool)')}>Simple, outcome-aligned pricing</div>
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
                Browse free. Pay on results.
              </h2>
              <p style={{ ...mLede, fontSize: 14.5, marginBottom: 20 }}>
                Plans start at ₹4,999/mo for one active posting. Placement fee is 12.5% of first-year
                fixed CTC on confirmed hires (10% for Scale subscribers) with a 90-day replacement or
                50% refund.
              </p>
              <Btn
                kind="primary"
                size="md"
                icon={<Icon.arrow />}
                onClick={() => router.push('/pricing')}
                style={{ background: 'var(--cool)', color: 'white' }}
              >
                See full pricing
              </Btn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Free', 'browse the board'],
                ['₹4,999', '/mo · Starter'],
                ['12.5%', 'placement fee'],
                ['90 days', 'replacement'],
              ].map(([n, l]) => (
                <div
                  key={l}
                  style={{
                    padding: 18,
                    borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div
                    className="display mono"
                    style={{ fontSize: 24, fontWeight: 700, color: 'var(--cool)', letterSpacing: '-0.02em' }}
                  >
                    {n}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section
        style={{ padding: '48px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
            fontSize: 11.5,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        >
          Hiring on Closdex
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 48,
            flexWrap: 'wrap',
            opacity: 0.7,
          }}
        >
          {LOGOS.map((l) => (
            <div key={l} className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-dim)' }}>
              {l}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 64px 8px' }}>
        <Card padding={40} style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div
            className="display"
            style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.02em' }}
          >
            &quot;We filled two enterprise AE roles in 16 days. The rubric breakdowns meant our first
            interviews were with people we already knew could sell.&quot;
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}
          >
            <Avatar name="Lavanya Rao" size={40} color="oklch(0.55 0.15 240)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Lavanya Rao</div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>VP Sales · a fintech hiring partner</div>
            </div>
          </div>
        </Card>
      </section>

      <MarketingCTA
        eyebrow="Free to browse · pay on confirmed hires"
        title="Meet your next closer."
        body="Book a 20-minute demo and we'll walk your hiring panel through the ranked pool with your exact ICP loaded."
        primary={{ label: 'Book a demo', to: 'signup' }}
        secondary={{ label: 'Browse talent free', to: 'signup' }}
      />
      <PublicFooter />
    </PublicScreen>
  );
}
