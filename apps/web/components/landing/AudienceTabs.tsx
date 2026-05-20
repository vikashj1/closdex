'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { pill } from './pill';

interface Props {
  go: (path: string) => void;
}

type TabId = 'salesperson' | 'company' | 'enablement';

interface TabDef {
  id: TabId;
  label: string;
  color: string;
  head: string;
  body: string;
  bullets: string[];
  ctaPrimary: { label: string; path: string };
  ctaSecondary: { label: string };
  meta: string;
}

export function AudienceTabs({ go }: Props) {
  const [tab, setTab] = useState<TabId>('salesperson');

  const tabs: TabDef[] = [
    {
      id: 'salesperson',
      label: "I'm a Salesperson",
      color: 'var(--gold)',
      head: 'Get measured fairly. Get hired on merit.',
      body: 'Stop relying on "who you know". Practice realistic leads, climb the public leaderboard, and let your numbers do the introducing to 47+ hiring partners.',
      bullets: [
        'Free forever in Phase 1. No paywalls.',
        'Public shareable profile · closdex.com/u/yourname',
        '1-click apply with auto-attached rank + performance proof',
        'Replace the cold-cover-letter game with verified skill',
      ],
      ctaPrimary: { label: 'Start competing — free', path: '/signup' },
      ctaSecondary: { label: 'See how scoring works' },
      meta: '2,481 salespersons · avg first rank in 3 challenges',
    },
    {
      id: 'company',
      label: "I'm Hiring",
      color: 'var(--cool)',
      head: 'Hire sales talent on objective performance.',
      body: 'Stop reading the same 200 "results-driven, dynamic SDR" resumes. Search a pre-vetted, ranked pool. View live performance breakdowns. Hire with a 90-day replacement guarantee.',
      bullets: [
        'Free browse · paid plans from ₹4,999/mo',
        '12.5% placement fee on confirmed hires (10% for Scale subscribers)',
        'Filter by rank, win-rate, goal-type performance, location',
        '90-day replacement OR 50% refund guarantee',
      ],
      ctaPrimary: { label: 'Browse talent · free', path: '/company' },
      ctaSecondary: { label: 'Book a 20-min demo' },
      meta: '47 hiring partners · avg 18 days to first hire · 312 candidates Gold+',
    },
    {
      id: 'enablement',
      label: "I'm a Sales Enablement Lead",
      color: 'var(--r-master)',
      head: 'Train your team on leads they actually face.',
      body: 'Run private team leagues. Upload your ICP, your objections, your competitive landscape. We turn it into customised scenarios with a rubric you control — and a leaderboard your reps actually want to top.',
      bullets: [
        'Private team workspace · ICP-tuned bots',
        'Custom rubric weights (SPIN / BANT / MEDDIC / Challenger)',
        'Team leaderboard + manager analytics dashboard',
        'From ₹39,999/mo · onboarding in 2 weeks',
      ],
      ctaPrimary: { label: 'Request enablement demo', path: '/company' },
      ctaSecondary: { label: 'View enterprise pricing' },
      meta: 'Phase 3 · early-access partners onboarding now',
    },
  ];

  const t = tabs.find((x) => x.id === tab)!;

  return (
    <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ ...pill('var(--text-dim)'), color: 'var(--text-mute)' }}>Built for three audiences</div>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '16px 0 0' }}>
          One platform. Three different jobs to be done.
        </h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 600,
              background: tab === x.id ? x.color : 'transparent',
              color: tab === x.id ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
              border: `1px solid ${tab === x.id ? 'transparent' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <Card padding={0} style={{ maxWidth: 980, margin: '0 auto', overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ height: 4, background: t.color }} />
        <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <h3 className="display" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 14px', lineHeight: 1.15 }}>{t.head}</h3>
            <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.55, margin: '0 0 24px' }}>{t.body}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => go(t.ctaPrimary.path)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  background: t.color,
                  color: 'oklch(0.18 0.02 75)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {t.ctaPrimary.label} <Icon.arrow />
              </button>
              <Btn kind="ghost" size="md">{t.ctaSecondary.label}</Btn>
            </div>
            <div style={{ marginTop: 18, fontSize: 11.5, color: 'var(--text-mute)' }}>{t.meta}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: 32 }}>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>What you get</div>
            {t.bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                <span style={{ color: t.color, marginTop: 2, flexShrink: 0 }}><Icon.check /></span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
