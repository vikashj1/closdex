'use client';

import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { PersonaShowcase } from '@/components/landing/PersonaShowcase';
import { AudienceTabs } from '@/components/landing/AudienceTabs';
import { OutcomesStrip } from '@/components/landing/OutcomesStrip';
import { SocialProofStrip } from '@/components/landing/SocialProofStrip';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTABanner } from '@/components/landing/FinalCTABanner';

/** Ported from the prototype's LandingScreen. Extended sections
 *  (ProductShowcase / PersonaShowcase / AudienceTabs / OutcomesStrip /
 *  SocialProofStrip / FAQSection / FinalCTABanner) are stubbed for slice 1
 *  and get ported in the next slice. */
export default function LandingPage() {
  const router = useRouter();
  const go = (path: string) => router.push(path);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* Header */}
      <header className="pad-x-fluid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 64px', borderBottom: '1px solid var(--border-soft)' }}>
        <Logo size={24} />
        <nav className="hide-mobile" style={{ display: 'flex', gap: 28, fontSize: 13.5, color: 'var(--text-dim)' }}>
          <a onClick={() => go('/challenges')} style={navLink}>Challenges</a>
          <a onClick={() => go('/leaderboard')} style={navLink}>Leaderboard</a>
          <a onClick={() => go('/company')} style={navLink}>For Companies</a>
          <a onClick={() => go('/pricing')} style={navLink}>Pricing</a>
          <a onClick={() => go('/learn')} style={navLink}>Learn</a>
        </nav>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="ghost" size="sm" onClick={() => go('/login')}>Log in</Btn>
          <Btn kind="primary" size="sm" onClick={() => go('/signup')}>Sign up</Btn>
        </div>
      </header>

      {/* Hero */}
      <section className="pad-x-fluid grid-hero pad-y-hero" style={{ padding: '72px 64px 56px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'color-mix(in oklch, var(--gold) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--gold) 30%, transparent)', color: 'var(--gold)', fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)', animation: 'pulseDot 1.6s infinite' }} />
            BETA · IT Sales vertical · Bangalore / Mumbai / Delhi NCR
          </div>
          <h1 className="display h-hero" style={{ fontSize: 76, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.04em', margin: '0 0 20px' }}>
            Compete.<br />Climb.<br /><span className="grad-text-gold">Get hired.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-dim)', lineHeight: 1.5, maxWidth: 520, margin: '0 0 32px' }}>
            India&apos;s first sales talent leaderboard. Practice realistic AI-driven lead conversations, climb the ranks, and get discovered by hiring companies — all on merit.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go('/signup')}>Start competing — free</Btn>
            <Btn kind="ghost" size="lg" icon={<Icon.briefcase />} onClick={() => go('/company')}>Hire top sales talent</Btn>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--text-mute)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.check /> No credit card</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.check /> Free forever for salespersons</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.check /> 5-min onboarding</span>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 40, color: 'var(--text-mute)', fontSize: 12.5 }}>
            <div><span className="display mono" style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginRight: 6 }}>2,481</span>salespersons</div>
            <div><span className="display mono" style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginRight: 6 }}>47</span>hiring partners</div>
            <div><span className="display mono" style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginRight: 6 }}>12.5%</span>placement fee</div>
          </div>
        </div>

        {/* Leaderboard preview card */}
        <Card padding={0} style={{ overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: 'var(--bg-2)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.trophy /><span style={{ fontWeight: 600, fontSize: 13.5 }}>Weekly Leaderboard</span>
              <span style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono' }}>IT_SALES · IN</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-mute)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--emerald)', animation: 'pulseDot 1.5s infinite' }} />
              Live · resets in 2d 14h
            </span>
          </div>
          {LEADERBOARD_PREVIEW.map((row) => (
            <div key={row.r} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto auto auto', gap: 14, padding: '11px 18px', alignItems: 'center', borderBottom: '1px solid var(--border-soft)' }}>
              <div className="mono" style={{ color: row.r <= 3 ? 'var(--gold)' : 'var(--text-mute)', fontSize: 13, fontWeight: 700 }}>#{row.r}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={row.name} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{row.city}</div>
                </div>
              </div>
              <RankBadge rank={row.rank} size={18} />
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{row.pts.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <Icon.trend /> {row.trend}
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* How it works */}
      <section style={{ padding: '56px 64px', borderTop: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
          <h2 className="display" style={{ fontSize: 36, margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>How it works</h2>
          <span style={{ color: 'var(--text-mute)', fontSize: 13 }}>For salespersons</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          {HOW_IT_WORKS.map((c) => (
            <Card key={c.step} padding={24} hover>
              <div className="mono" style={{ color: 'var(--gold)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{c.step}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--gold)' }}>
                {c.icon}
                <h3 className="display" style={{ fontSize: 22, margin: 0, color: 'var(--text)' }}>{c.title}</h3>
              </div>
              <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: 14, lineHeight: 1.55 }}>{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Extended landing sections */}
      <ProductShowcase go={go} />
      <PersonaShowcase go={go} />
      <AudienceTabs go={go} />
      <OutcomesStrip />
      <SocialProofStrip />
      <FAQSection />
      <FinalCTABanner go={go} />

      {/* Footer */}
      <footer style={{ padding: '40px 64px', borderTop: '1px solid var(--border-soft)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, color: 'var(--text-mute)', fontSize: 12.5 }}>
        <div>
          <Logo size={20} />
          <p style={{ marginTop: 12, lineHeight: 1.6, maxWidth: 280 }}>India&apos;s first sales talent leaderboard. Practice realistic AI leads, climb the ranks, get hired on merit.</p>
        </div>
        <div>
          <div style={footColH}>Salespersons</div>
          {['Challenges', 'Leaderboard', 'Learn', 'Sign up free', 'How scoring works'].map((l) => <a key={l} style={footLink}>{l}</a>)}
        </div>
        <div>
          <div style={footColH}>Companies</div>
          {['Talent search', 'Pricing', 'Book a demo', 'Case studies', 'Placement guarantee'].map((l) => <a key={l} style={footLink}>{l}</a>)}
        </div>
        <div>
          <div style={footColH}>Company</div>
          {['About', 'Careers', 'Privacy', 'Terms', 'Security · SOC2'].map((l) => <a key={l} style={footLink}>{l}</a>)}
        </div>
      </footer>
      <div style={{ padding: '16px 64px', borderTop: '1px solid var(--border-soft)', color: 'var(--text-mute)', fontSize: 11.5, display: 'flex', justifyContent: 'space-between' }}>
        <div>© 2026 Closdex · Made in Bangalore</div>
        <div>v0.1 · IT Sales vertical</div>
      </div>
    </div>
  );
}

const navLink: CSSProperties = { cursor: 'pointer' };
const footColH: CSSProperties = { fontSize: 11, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 700 };
const footLink: CSSProperties = { display: 'block', padding: '4px 0', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 12.5 };

const LEADERBOARD_PREVIEW: { r: number; name: string; city: string; rank: RankName; pts: number; trend: string }[] = [
  { r: 1, name: 'Aarav Sharma', city: 'Bangalore', rank: 'Master', pts: 38420, trend: '+842' },
  { r: 2, name: 'Priya Iyer', city: 'Mumbai', rank: 'Master', pts: 36110, trend: '+512' },
  { r: 3, name: 'Karan Mehta', city: 'Pune', rank: 'Diamond', pts: 28940, trend: '+1,204' },
  { r: 4, name: 'Sneha Reddy', city: 'Hyderabad', rank: 'Diamond', pts: 22180, trend: '+318' },
  { r: 5, name: 'Rohan Gupta', city: 'Delhi NCR', rank: 'Platinum', pts: 17850, trend: '+96' },
  { r: 6, name: 'Anjali Nair', city: 'Bangalore', rank: 'Platinum', pts: 14210, trend: '+632' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Practice', body: 'Take on AI-simulated leads across difficulty tiers — from warm prospects to hostile decision-makers.', icon: <Icon.bolt /> },
  { step: '02', title: 'Rank', body: 'Earn points from a transparent rubric: discovery, objection handling, value, conversation, goal execution.', icon: <Icon.trophy /> },
  { step: '03', title: 'Get hired', body: 'Verified companies search the ranked talent pool. Top performers get interview requests directly.', icon: <Icon.briefcase /> },
];
