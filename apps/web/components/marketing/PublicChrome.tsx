'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { MobileNav } from '@/components/shell/MobileNav';
import { mp } from './styles';

type PublicNavId =
  | 'landing'
  | 'info-challenges'
  | 'info-leaderboard'
  | 'info-companies'
  | 'info-pricing'
  | 'info-learn'
  | 'signup'
  | 'login';

const ROUTE_MAP: Record<PublicNavId, string> = {
  landing: '/',
  'info-challenges': '/challenges',
  'info-leaderboard': '/leaderboard',
  'info-companies': '/company',
  'info-pricing': '/pricing',
  'info-learn': '/learn',
  signup: '/signup',
  login: '/login',
};

const PUBLIC_NAV: Array<{ id: PublicNavId; label: string }> = [
  { id: 'info-challenges', label: 'Challenges' },
  { id: 'info-leaderboard', label: 'Leaderboard' },
  { id: 'info-companies', label: 'For Companies' },
  { id: 'info-pricing', label: 'Pricing' },
  { id: 'info-learn', label: 'Learn' },
];

export function PublicHeader({ active }: { active?: PublicNavId }) {
  const router = useRouter();
  const go = (id: PublicNavId) => router.push(ROUTE_MAP[id]);
  return (
    <header
      className="pad-x-fluid"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 64px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'color-mix(in oklch, var(--bg) 90%, transparent)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ cursor: 'pointer' }} onClick={() => go('landing')}>
        <Logo size={24} />
      </div>
      <nav className="hide-mobile" style={{ display: 'flex', gap: 28, fontSize: 13.5 }}>
        {PUBLIC_NAV.map((n) => (
          <a
            key={n.id}
            onClick={() => go(n.id)}
            style={{
              color: active === n.id ? 'var(--gold)' : 'var(--text-dim)',
              fontWeight: active === n.id ? 700 : 500,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {n.label}
          </a>
        ))}
      </nav>
      <div className="hide-mobile" style={{ display: 'flex', gap: 10 }}>
        <Btn kind="ghost" size="sm" onClick={() => go('login')}>Log in</Btn>
        <Btn kind="primary" size="sm" onClick={() => go('signup')}>Sign up</Btn>
      </div>
      <MobileNav
        items={PUBLIC_NAV.map((n) => ({ label: n.label, href: ROUTE_MAP[n.id], active: active === n.id }))}
        primaryCtaLabel="Sign up"
        primaryCtaHref={ROUTE_MAP.signup}
        secondaryCtaLabel="Log in"
        secondaryCtaHref={ROUTE_MAP.login}
        go={(href) => router.push(href)}
      />
    </header>
  );
}

const mFootColH = {
  fontSize: 11,
  color: 'var(--text)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: 12,
  fontWeight: 700,
};
const mFootLink = {
  display: 'block',
  padding: '4px 0',
  color: 'var(--text-mute)',
  cursor: 'pointer',
  fontSize: 12.5,
  textDecoration: 'none' as const,
};

export function PublicFooter() {
  const router = useRouter();
  const go = (id: PublicNavId) => router.push(ROUTE_MAP[id]);
  const cols: Array<{ h: string; links: Array<[string, PublicNavId]> }> = [
    {
      h: 'Salespersons',
      links: [
        ['Challenges', 'info-challenges'],
        ['Leaderboard', 'info-leaderboard'],
        ['Learn', 'info-learn'],
        ['Sign up free', 'signup'],
        ['How scoring works', 'info-learn'],
      ],
    },
    {
      h: 'Companies',
      links: [
        ['Talent search', 'info-companies'],
        ['Pricing', 'info-pricing'],
        ['Book a demo', 'info-companies'],
        ['Case studies', 'info-companies'],
        ['Placement guarantee', 'info-companies'],
      ],
    },
    {
      h: 'Company',
      links: [
        ['About', 'info-learn'],
        ['Careers', 'info-learn'],
        ['Privacy', 'info-learn'],
        ['Terms', 'info-learn'],
        ['Security · SOC2', 'info-learn'],
      ],
    },
  ];
  return (
    <>
      <footer
        className="pad-x-fluid grid-4-2"
        style={{
          padding: '48px 64px',
          borderTop: '1px solid var(--border-soft)',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 40,
          color: 'var(--text-mute)',
          fontSize: 12.5,
          background: 'var(--bg-2)',
        }}
      >
        <div>
          <div style={{ cursor: 'pointer' }} onClick={() => go('landing')}>
            <Logo size={20} />
          </div>
          <p style={{ marginTop: 12, lineHeight: 1.6, maxWidth: 280 }}>
            India&apos;s first sales talent leaderboard. Practice realistic AI leads, climb the
            ranks, get hired on merit.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div style={mFootColH}>{c.h}</div>
            {c.links.map(([l, id]) => (
              <a key={l} style={mFootLink} onClick={() => go(id)}>
                {l}
              </a>
            ))}
          </div>
        ))}
      </footer>
      <div
        className="pad-x-fluid stack-mobile"
        style={{
          padding: '16px 64px',
          borderTop: '1px solid var(--border-soft)',
          color: 'var(--text-mute)',
          fontSize: 11.5,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          background: 'var(--bg-2)',
        }}
      >
        <div>© 2026 Closdex · Made in India</div>
        <div>v0.7 beta · IT Sales vertical</div>
      </div>
    </>
  );
}

export function MarketingCTA({
  eyebrow = 'The leaderboard is live',
  title = 'Ready to find out your rank?',
  body = 'Free forever for salespersons. Take your first calibration challenge in under five minutes.',
  primary = { label: 'Start competing — free', to: 'signup' as PublicNavId },
  secondary = { label: 'Hire top talent', to: 'info-companies' as PublicNavId },
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  primary?: { label: string; to: PublicNavId };
  secondary?: { label: string; to: PublicNavId };
}) {
  const router = useRouter();
  const go = (id: PublicNavId) => router.push(ROUTE_MAP[id]);
  return (
    <section className="pad-x-fluid" style={{ padding: '0 64px 72px' }}>
      <Card
        padding={0}
        style={{
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--gold) 20%, var(--bg)) 0%, color-mix(in oklch, var(--gold) 7%, var(--bg-2)) 100%)',
          borderColor: 'color-mix(in oklch, var(--gold) 35%, var(--border))',
          position: 'relative',
        }}
      >
        <svg
          style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}
          width="360"
          height="360"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M3 18 L9 18 L11 12 L13 18 L19 18 L15 6 L9 6 Z" fill="var(--gold)" />
        </svg>
        <div style={{ padding: '56px 56px', position: 'relative', maxWidth: 760 }}>
          <div style={mp('var(--gold)')}>{eyebrow}</div>
          <h2
            className="display h-section"
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
              margin: '16px 0 16px',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--text-dim)',
              lineHeight: 1.55,
              maxWidth: 540,
              margin: '0 0 28px',
            }}
          >
            {body}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go(primary.to)}>
              {primary.label}
            </Btn>
            <Btn kind="secondary" size="lg" icon={<Icon.briefcase />} onClick={() => go(secondary.to)}>
              {secondary.label}
            </Btn>
          </div>
        </div>
      </Card>
    </section>
  );
}

/** Wrapper used by every marketing page — full-width background. */
export function PublicScreen({ children }: { children: ReactNode }) {
  return <div data-resp="landing" style={{ background: 'var(--bg)', minHeight: '100%' }}>{children}</div>;
}

export type { PublicNavId };
