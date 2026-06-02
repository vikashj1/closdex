'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { MarketingCTA, PublicFooter, PublicHeader, PublicScreen } from './PublicChrome';
import { mLede, mp, mSectionHead } from './styles';

type CompanyTier = {
  name: 'Starter' | 'Growth' | 'Scale';
  mo: number;
  blurb: string;
  fee: string;
  feats: string[];
  accent: string;
  popular?: boolean;
};

const COMPANY_TIERS: CompanyTier[] = [
  {
    name: 'Starter',
    mo: 4999,
    blurb: 'For a first role or a small team.',
    fee: '12.5% placement fee',
    feats: ['1 active job posting', 'Browse + shortlist the full board', 'Performance breakdowns', 'Email support'],
    accent: 'var(--text-dim)',
  },
  {
    name: 'Growth',
    mo: 14999,
    blurb: 'For teams hiring continuously.',
    fee: '12.5% placement fee',
    feats: ['5 active job postings', 'Team shortlists & panel comments', 'Advanced skill filters', 'Priority support', 'ATS export'],
    accent: 'var(--cool)',
    popular: true,
  },
  {
    name: 'Scale',
    mo: 39999,
    blurb: 'For high-volume sales orgs.',
    fee: '10% placement fee',
    feats: ['Unlimited job postings', 'Dedicated talent advisor', 'Custom analytics dashboard', 'Reduced 10% placement fee', 'SSO + audit logs'],
    accent: 'var(--r-master)',
  },
];

const COMPARE_ROWS: string[][] = [
  ['Active job postings', '1', '5', 'Unlimited'],
  ['Browse full leaderboard', '✓', '✓', '✓'],
  ['Performance breakdowns', '✓', '✓', '✓'],
  ['Team shortlists & comments', '—', '✓', '✓'],
  ['Advanced skill filters', '—', '✓', '✓'],
  ['Custom analytics dashboard', '—', '—', '✓'],
  ['Dedicated talent advisor', '—', '—', '✓'],
  ['Placement fee', '12.5%', '12.5%', '10%'],
  ['SSO + audit logs', '—', '—', '✓'],
];

const FAQS = [
  {
    q: 'Is it really free for salespersons?',
    a: "Yes — 100% free in Phase 1. No paywalls, no premium tier, no 'unlock to apply' tricks. Companies fund the platform through subscriptions and placement fees.",
  },
  {
    q: 'How does the placement fee work?',
    a: "You pay 12.5% of the hire's first-year fixed CTC only when a hire is confirmed (10% on the Scale plan). Browsing, shortlisting, and interviewing cost nothing beyond your subscription.",
  },
  {
    q: "What's the 90-day guarantee?",
    a: "If a placed hire leaves or doesn't work out within 90 days, we either replace them at no extra placement fee or refund 50% of the fee. Your choice.",
  },
  {
    q: 'Can I change or cancel plans?',
    a: 'Yes. Upgrade, downgrade, or cancel anytime from billing. Annual plans are billed for ten months, two months free versus paying monthly.',
  },
];

export function PublicPricingView() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const factor = annual ? 10 : 1;
  const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

  return (
    <PublicScreen>
      <PublicHeader active="info-pricing" />

      <section
        className="pad-x-fluid pad-y-hero"
        style={{
          padding: '72px 64px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="hero-blob gold"
          style={{ top: -220, left: '50%', transform: 'translateX(-50%)' }}
        />
        <div className="reveal-up" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ ...mp('var(--gold)'), margin: '0 auto' }}>Pricing · IT Sales vertical</div>
        <h1
          className="display h-hero"
          style={{
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.035em',
            margin: '18px auto 16px',
            maxWidth: 760,
          }}
        >
          Free to compete. <span className="grad-text-gold">Aligned to outcomes.</span>
        </h1>
        </div>
        <p style={{ ...mLede, fontSize: 16.5, margin: '0 auto 28px' }}>
          Salespersons never pay. Companies browse for free and pay on results. No hidden seats, no
          surprise overages.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: 5,
          }}
        >
          {([['Monthly', false], ['Annual · 2 months free', true]] as Array<[string, boolean]>).map(([l, v]) => (
            <button
              key={l}
              onClick={() => setAnnual(v)}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: annual === v ? 'var(--gold)' : 'transparent',
                color: annual === v ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      <section className="pad-x-fluid" style={{ padding: '16px 64px 0' }}>
        <Card padding={0} style={{ overflow: 'hidden', borderColor: 'color-mix(in oklch, var(--gold) 35%, var(--border))' }}>
          <div
            style={{
              padding: 32,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 32,
              alignItems: 'center',
              background:
                'linear-gradient(135deg, color-mix(in oklch, var(--gold) 12%, var(--surface)), var(--surface))',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <h3 className="display" style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Salespersons</h3>
                <span style={{ ...mp('var(--gold)'), fontSize: 11 }}>Free forever in Phase 1</span>
              </div>
              <p style={{ fontSize: 14.5, color: 'var(--text-dim)', margin: '0 0 4px', lineHeight: 1.5, maxWidth: 620 }}>
                Unlimited challenges, public profile, shareable rank URL, and eligibility for 47+
                hiring-partner roles. No credit card, ever.
              </p>
              <div style={{ display: 'flex', gap: 20, marginTop: 14, flexWrap: 'wrap' }}>
                {['Unlimited challenges', 'Public ranked profile', '1-click apply with proof', 'Activity heatmap & badges'].map((f) => (
                  <span
                    key={f}
                    style={{ fontSize: 12.5, color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <span style={{ color: 'var(--emerald)' }}>
                      <Icon.check />
                    </span>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                className="display mono"
                style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                ₹0
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 14 }}>forever</div>
              <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => router.push('/signup')}>
                Start free
              </Btn>
            </div>
          </div>
        </Card>
      </section>

      <section className="pad-x-fluid" style={{ padding: '48px 64px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ ...mp('var(--cool)'), margin: '0 auto' }}>For companies</div>
          <h2 className="display" style={{ ...mSectionHead, margin: '16px auto 0', fontSize: 36 }}>
            Plans that scale with your hiring.
          </h2>
        </div>
        <div className="grid-3-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, alignItems: 'stretch' }}>
          {COMPANY_TIERS.map((t) => (
            <Card
              key={t.name}
              padding={0}
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderColor: t.popular
                  ? 'color-mix(in oklch, var(--cool) 45%, var(--border))'
                  : 'var(--border-soft)',
                position: 'relative',
              }}
            >
              {t.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'var(--cool)',
                    background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                    border: '1px solid color-mix(in oklch, var(--cool) 35%, transparent)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Most popular
                </div>
              )}
              <div style={{ height: 4, background: t.accent }} />
              <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
                <h3 className="display" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>{t.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '0 0 18px' }}>{t.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span
                    className="display mono"
                    style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em' }}
                  >
                    {fmt(t.mo * factor)}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>/{annual ? 'yr' : 'mo'}</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--cool)',
                    fontWeight: 600,
                    marginTop: 6,
                    marginBottom: 20,
                  }}
                >
                  {t.fee} on confirmed hires
                </div>
                <Btn
                  kind={t.popular ? 'primary' : 'secondary'}
                  full
                  size="md"
                  onClick={() => router.push('/signup')}
                  style={t.popular ? { background: 'var(--cool)', color: 'white' } : undefined}
                >
                  Choose {t.name}
                </Btn>
                <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {t.feats.map((f) => (
                    <div
                      key={f}
                      style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.4 }}
                    >
                      <span style={{ color: t.accent, flexShrink: 0 }}>
                        <Icon.check />
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-mute)' }}>
          Need more than Scale?{' '}
          <a onClick={() => router.push('/signup')} style={{ color: 'var(--cool)', fontWeight: 600, cursor: 'pointer' }}>
            Talk to us about Enterprise →
          </a>
        </div>
      </section>

      <section className="pad-x-fluid" style={{ padding: '72px 64px 0' }}>
        <Card padding={0} style={{ overflow: 'hidden', background: 'var(--bg-2)' }}>
          <div
            style={{
              padding: 36,
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr',
              gap: 40,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={mp('var(--emerald)')}>How the placement fee works</div>
              <h2
                className="display"
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  margin: '16px 0 12px',
                  lineHeight: 1.15,
                }}
              >
                You only pay when you actually hire.
              </h2>
              <p style={{ ...mLede, fontSize: 14.5 }}>
                Your subscription covers postings and access. The placement fee, 12.5% of first-year
                fixed CTC or 10% on Scale, is charged once on a confirmed hire and is fully covered
                by the 90-day replacement guarantee.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { s: '1', t: 'Subscribe & post', b: 'Pick a plan, post your role, and start browsing the ranked pool.' },
                { s: '2', t: 'Shortlist & interview', b: 'Evaluate performance breakdowns and interview your favourites. No charge.' },
                { s: '3', t: 'Hire & pay once', b: 'On a confirmed hire, pay 12.5% of first-year fixed CTC. Backed 90 days.' },
              ].map((r) => (
                <div
                  key={r.s}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: 16,
                    borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: 'var(--emerald)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {r.s}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.t}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.45 }}>
                      {r.b}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="pad-x-fluid" style={{ padding: '48px 64px 0' }}>
        <Card
          padding={32}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 32,
            alignItems: 'center',
            borderColor: 'color-mix(in oklch, var(--r-master) 30%, var(--border))',
          }}
        >
          <div>
            <div style={{ ...mp('var(--r-master)'), marginBottom: 12 }}>
              Sales enablement · private team leagues
            </div>
            <h3 className="display" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
              Train your own team on your own leads.
            </h3>
            <p style={{ ...mLede, fontSize: 14, maxWidth: 620 }}>
              Upload your ICP, objections, and competitive landscape. We turn them into custom
              scenarios with a rubric you control (SPIN / BANT / MEDDIC / Challenger), plus a team
              leaderboard and manager analytics.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>from</div>
            <div
              className="display mono"
              style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              ₹39,999
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 14 }}>/mo</div>
            <Btn kind="secondary" size="md" onClick={() => router.push('/signup')}>
              Request demo
            </Btn>
          </div>
        </Card>
      </section>

      <section className="pad-x-fluid" style={{ padding: '72px 64px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ ...mp('var(--text-dim)'), color: 'var(--text-mute)', margin: '0 auto' }}>
            Compare company plans
          </div>
          <h2 className="display" style={{ ...mSectionHead, margin: '16px auto 0', fontSize: 34 }}>
            Every feature, side by side.
          </h2>
        </div>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr' }}>
            <div
              style={{
                padding: '16px 22px',
                background: 'var(--bg-2)',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-mute)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Feature
            </div>
            {['Starter', 'Growth', 'Scale'].map((h, i) => (
              <div
                key={h}
                style={{
                  padding: '16px 22px',
                  background: 'var(--bg-2)',
                  fontSize: 13.5,
                  fontWeight: 700,
                  textAlign: 'center',
                  color: i === 1 ? 'var(--cool)' : 'var(--text)',
                }}
              >
                {h}
              </div>
            ))}
            {COMPARE_ROWS.map((row, ri) => (
              <Fragment key={ri}>
                <div
                  style={{
                    padding: '13px 22px',
                    fontSize: 13.5,
                    color: 'var(--text-dim)',
                    borderTop: '1px solid var(--border-soft)',
                  }}
                >
                  {row[0]}
                </div>
                {row.slice(1).map((cell, ci) => (
                  <div
                    key={ci}
                    style={{
                      padding: '13px 22px',
                      textAlign: 'center',
                      borderTop: '1px solid var(--border-soft)',
                      borderLeft: '1px solid var(--border-soft)',
                      fontSize: 13.5,
                      fontWeight: cell === '✓' ? 700 : 500,
                      color:
                        cell === '✓'
                          ? 'var(--emerald)'
                          : cell === '—'
                            ? 'var(--text-mute)'
                            : 'var(--text)',
                      background:
                        ci === 1 ? 'color-mix(in oklch, var(--cool) 4%, transparent)' : 'transparent',
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </Card>
      </section>

      <section className="pad-x-fluid pad-y-section" style={{ padding: '72px 64px' }}>
        <div className="grid-2-1" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 56 }}>
          <div>
            <div style={mp('var(--gold)')}>Pricing questions</div>
            <h2 className="display" style={{ ...mSectionHead, fontSize: 36 }}>Before you commit.</h2>
            <p style={{ ...mLede, fontSize: 14, marginTop: 8 }}>
              Still unsure which plan fits? We answer every email personally.
            </p>
            <div style={{ marginTop: 16 }}>
              <Btn kind="ghost" size="md">hello@closdex.in</Btn>
            </div>
          </div>
          <div>
            {FAQS.map((f, i) => (
              <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="display" style={{ fontSize: 16.5, fontWeight: 600, marginBottom: 8 }}>{f.q}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingCTA
        eyebrow="No credit card to start"
        title="Start free, on either side of the board."
        body="Salespersons compete for free. Companies browse for free and pay only on confirmed hires."
        primary={{ label: 'Start competing — free', to: 'signup' }}
        secondary={{ label: 'Browse talent free', to: 'signup' }}
      />
      <PublicFooter />
    </PublicScreen>
  );
}
