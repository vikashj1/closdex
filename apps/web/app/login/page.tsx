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
import { landingPathFor, useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle(idToken: string) {
    setError(null);
    setSubmitting(true);
    try {
      const user = await loginWithGoogle({ idToken });
      router.replace(landingPathFor(user.role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 400
            ? 'Pick whether you are a salesperson or company on the signup page first.'
            : err.message
          : 'Google sign-in failed. Please try again.',
      );
      setSubmitting(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(landingPathFor(user.role));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? 'Invalid email or password.'
            : err.message
          : 'Login failed. Please try again.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div data-resp="auth" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
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
            Welcome back.<br /><span style={{ color: '#5B4BF5' }}>The leaderboard is waiting.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.55, maxWidth: 420, margin: '0 0 32px' }}>
            Pick up where you left off. Your streak is still alive — for now.
          </p>
        </div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>
          Trouble signing in? <a style={{ color: 'var(--text-dim)' }}>Reset password</a>
        </div>
      </div>

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
        <h2 className="display" style={{ fontSize: 28, margin: '0 0 24px', fontWeight: 700 }}>Log in</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22, alignItems: 'stretch' }}>
          <GoogleButton onIdToken={handleGoogle} label="signin_with" disabled={submitting} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-mute)', fontSize: 11, margin: '8px 0 22px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} /> OR <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
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
          <Field label="Password" required>
            <TextInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
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

        <Btn type="submit" kind="primary" full size="lg" icon={<Icon.arrow />} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Log in'}
        </Btn>

        <div style={{ marginTop: 22, color: 'var(--text-mute)', fontSize: 12.5 }}>
          New here?{' '}
          <a
            onClick={() => router.push('/signup')}
            style={{ color: '#5B4BF5', fontWeight: 600, cursor: 'pointer' }}
          >
            Create an account
          </a>
        </div>
      </form>
    </div>
  );
}
