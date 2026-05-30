'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Logo } from '@/components/ui/Logo';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 64px',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <a onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <Logo size={24} />
        </a>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="ghost" size="sm" onClick={() => router.push('/login')}>Log in</Btn>
          <Btn kind="primary" size="sm" onClick={() => router.push('/signup')}>Sign up</Btn>
        </div>
      </header>

      <section style={{ padding: '72px 64px', maxWidth: 1100, margin: '0 auto' }}>
        <h1
          className="display"
          style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 12px' }}
        >
          Simple, founder-friendly pricing.
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 15, margin: '0 0 40px', maxWidth: 720 }}>
          Salespeople always train for free. Companies pay only when a hire lands. No seats,
          no per-job, no surprise invoices.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <Card
            padding={28}
            style={{
              background: 'color-mix(in oklch, var(--gold) 8%, var(--surface))',
              borderColor: 'color-mix(in oklch, var(--gold) 30%, transparent)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Salesperson
            </div>
            <div className="display" style={{ fontSize: 36, fontWeight: 700 }}>
              Free
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.7 }}>
              <li>Unlimited challenges</li>
              <li>AI coach feedback</li>
              <li>Public profile + leaderboard</li>
              <li>Apply to any role</li>
            </ul>
            <Btn kind="primary" size="md" onClick={() => router.push('/signup')} style={{ marginTop: 'auto' }}>
              Start competing
            </Btn>
          </Card>

          <Card
            padding={28}
            style={{
              background: 'color-mix(in oklch, var(--cool) 8%, var(--surface))',
              borderColor: 'color-mix(in oklch, var(--cool) 30%, transparent)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Company — Hire
            </div>
            <div className="display" style={{ fontSize: 36, fontWeight: 700 }}>
              8.33% <span style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 500 }}>of CTC</span>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.7 }}>
              <li>Unlimited job postings</li>
              <li>Talent search by rank + specialization</li>
              <li>Shortlists, interview pipeline</li>
              <li>Pay only when a candidate joins</li>
            </ul>
            <Btn kind="secondary" size="md" onClick={() => router.push('/signup')} style={{ marginTop: 'auto' }}>
              Talk to us
            </Btn>
          </Card>

          <Card
            padding={28}
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Enterprise
            </div>
            <div className="display" style={{ fontSize: 36, fontWeight: 700 }}>
              Custom
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.7 }}>
              <li>Volume hiring discount</li>
              <li>Branded company profile</li>
              <li>Dedicated success manager</li>
              <li>SLA on screening turnaround</li>
            </ul>
            <Btn kind="ghost" size="md" onClick={() => router.push('/signup')} style={{ marginTop: 'auto' }}>
              Get in touch
            </Btn>
          </Card>
        </div>

        <p style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 32 }}>
          Final commission terms are confirmed at hire time and may include a probation-period
          clawback. See your placement agreement for the exact split.
        </p>
      </section>
    </div>
  );
}
