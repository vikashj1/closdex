'use client';

import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Icon } from '@/components/ui/Icon';

/** Login route — not in the prototype source. Built to match the signup visual
 *  language. Wire to POST /api/auth/login in the API-integration slice. */
export default function LoginPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
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
            Welcome back.<br /><span style={{ color: 'var(--gold)' }}>The leaderboard is waiting.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 420, margin: '0 0 32px' }}>
            Pick up where you left off. Your streak is still alive — for now.
          </p>
        </div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>
          Trouble signing in? <a style={{ color: 'var(--text-dim)' }}>Reset password</a>
        </div>
      </div>

      <div style={{ padding: '56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 540 }}>
        <h2 className="display" style={{ fontSize: 28, margin: '0 0 24px', fontWeight: 700 }}>Log in</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          <Btn kind="secondary" full icon={<Icon.linkedin />}>Continue with LinkedIn</Btn>
          <Btn kind="secondary" full icon={<Icon.google />}>Continue with Google</Btn>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-mute)', fontSize: 11, margin: '8px 0 22px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
          <Field label="Work email" required>
            <TextInput placeholder="you@company.com" />
          </Field>
          <Field label="Password" required>
            <TextInput type="password" placeholder="••••••••" />
          </Field>
        </div>

        <Btn kind="primary" full size="lg" icon={<Icon.arrow />} onClick={() => router.push('/dashboard')}>
          Log in
        </Btn>

        <div style={{ marginTop: 22, color: 'var(--text-mute)', fontSize: 12.5 }}>
          New here?{' '}
          <a
            onClick={() => router.push('/signup')}
            style={{ color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
