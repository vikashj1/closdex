'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Icon } from '@/components/ui/Icon';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Side = 'salesperson' | 'company';

export default function SignupPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState<Side>('salesperson');
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (tab === 'company' && !companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role: tab === 'salesperson' ? 'SALESPERSON' : 'COMPANY',
        companyName: tab === 'company' ? companyName.trim() : undefined,
      });
      router.replace(tab === 'salesperson' ? '/onboarding' : '/company/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-up failed. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleGoogle(idToken: string) {
    setError(null);
    if (tab === 'company' && !companyName.trim()) {
      setError('Enter your company name before continuing with Google.');
      return;
    }
    setSubmitting(true);
    try {
      const user = await loginWithGoogle({
        idToken,
        role: tab === 'salesperson' ? 'SALESPERSON' : 'COMPANY',
        companyName: tab === 'company' ? companyName.trim() : undefined,
      });
      router.replace(tab === 'salesperson' ? '/onboarding' : '/company/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Google sign-up failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div data-resp="auth" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
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
            Join the arena.<br /><span style={{ color: '#5B4BF5' }}>Get measured fairly.</span>
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
      <form
        onSubmit={onSubmit}
        style={{
          padding: '56px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 540,
        }}
      >
        <div data-auth-mobile-logo>
          <Logo size={22} />
        </div>
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
              type="button"
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: tab === t ? '#5B4BF5' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-dim)',
                border: 'none',
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              I&apos;m a {t}
            </button>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 28, margin: '0 0 24px', fontWeight: 700 }}>
          Create your {tab} account
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22, alignItems: 'stretch' }}>
          <GoogleButton onIdToken={handleGoogle} label="signup_with" disabled={submitting} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-mute)', fontSize: 11, margin: '8px 0 22px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
          {tab === 'company' && (
            <Field label="Company name" required>
              <TextInput
                placeholder="e.g. Razorpay"
                value={companyName}
                onChange={setCompanyName}
                autoComplete="organization"
                required
              />
            </Field>
          )}
          <Field label="Full name" required>
            <TextInput
              placeholder="Your name"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Work email" required>
            <TextInput
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Password" required hint="At least 8 characters">
            <TextInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              required
            />
          </Field>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
              border: '1px solid color-mix(in oklch, var(--d-expert) 35%, transparent)',
              color: 'var(--d-expert)',
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        <Btn
          type="submit"
          kind="primary"
          full
          size="lg"
          icon={<Icon.arrow />}
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Create account & start onboarding'}
        </Btn>

        <div style={{ marginTop: 22, color: 'var(--text-mute)', fontSize: 12.5 }}>
          Already a member?{' '}
          <a
            onClick={() => router.push('/login')}
            style={{ color: '#5B4BF5', fontWeight: 600, cursor: 'pointer' }}
          >
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
