'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Icon } from '@/components/ui/Icon';

type Side = 'salesperson' | 'company';

export default function SignupPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Side>('salesperson');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      {/* Left: pitch */}
      <div
        style={{
          background: 'var(--bg-2)',
          padding: '56px 56px',
          borderRight: '1px solid var(--border-soft)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Logo size={22} />
        <div>
          <h1 className="display" style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px' }}>
            Join the arena.<br /><span style={{ color: 'var(--gold)' }}>Get measured fairly.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 420, margin: '0 0 32px' }}>
            Sign up free. Take your first calibration challenge in under 5 minutes. Get ranked. Stay ranked.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              '100% free for salespersons — no paywalls in Phase 1',
              'Public profile + shareable rank URL',
              'Eligible for 47+ active hiring partner roles',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-dim)', fontSize: 13.5 }}>
                <span style={{ color: 'var(--emerald)' }}><Icon.check /></span>{t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>
          By signing up you agree to Closdex&apos;s <a style={{ color: 'var(--text-dim)' }}>Terms</a> and <a style={{ color: 'var(--text-dim)' }}>Privacy Policy</a>.
        </div>
      </div>

      {/* Right: form */}
      <div style={{ padding: '56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 540 }}>
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-2)',
            padding: 4,
            borderRadius: 10,
            gap: 4,
            marginBottom: 28,
            border: '1px solid var(--border)',
            width: 'fit-content',
          }}
        >
          {(['salesperson', 'company'] as Side[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: tab === t ? 'var(--gold)' : 'transparent',
                color: tab === t ? 'oklch(0.18 0.02 75)' : 'var(--text-dim)',
                border: 'none',
                textTransform: 'capitalize',
              }}
            >
              I&apos;m a {t}
            </button>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 28, margin: '0 0 24px', fontWeight: 700 }}>
          Create your {tab} account
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <Btn kind="secondary" full icon={<Icon.linkedin />}>Continue with LinkedIn</Btn>
          <Btn kind="secondary" full icon={<Icon.google />}>Continue with Google</Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-mute)', fontSize: 11, margin: '8px 0 22px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
          {tab === 'company' && (
            <Field label="Company name" required>
              <TextInput placeholder="e.g. Razorpay" />
            </Field>
          )}
          <Field label="Full name" required>
            <TextInput placeholder="Your name" />
          </Field>
          <Field label="Work email" required>
            <TextInput placeholder="you@company.com" />
          </Field>
          <Field label="Password" required hint="At least 8 characters">
            <TextInput type="password" placeholder="••••••••" />
          </Field>
        </div>

        <Btn
          kind="primary"
          full
          size="lg"
          icon={<Icon.arrow />}
          onClick={() => router.push(tab === 'salesperson' ? '/onboarding' : '/company')}
        >
          Create account & start onboarding
        </Btn>

        <div style={{ marginTop: 22, color: 'var(--text-mute)', fontSize: 12.5 }}>
          Already a member?{' '}
          <a
            onClick={() => router.push('/login')}
            style={{ color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
