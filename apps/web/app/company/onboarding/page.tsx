'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const STEPS = ['Welcome', 'Your company', 'Done'] as const;

const INDUSTRY_OPTIONS = [
  'SaaS / Software',
  'FinTech',
  'HealthTech',
  'EdTech',
  'BFSI',
  'FMCG / Consumer',
  'Manufacturing',
  'E-commerce',
  'IT Services',
  'Other',
];

const SIZE_OPTIONS = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY') as any;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 fields
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [about, setAbout] = useState('');
  const [locations, setLocations] = useState('');

  function getCompanyId() {
    return user?.companyMemberships?.[0]?.company?.id ?? null;
  }

  async function submitProfile() {
    const companyId = getCompanyId();
    if (!companyId) {
      setError('Could not find your company. Please refresh and try again.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.companies.update(companyId, {
        industry: industry || undefined,
        size: size || undefined,
        website: website || undefined,
        logoUrl: logoUrl || undefined,
        about: about || undefined,
        locations: locations ? locations.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      });
      setStep(3);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <Logo size={24} />
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 36 }}>
        {STEPS.map((label, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: done
                    ? 'var(--emerald)'
                    : active
                    ? 'var(--cool)'
                    : 'var(--surface)',
                  border: `2px solid ${done ? 'var(--emerald)' : active ? 'var(--cool)' : 'var(--border)'}`,
                  color: done || active ? '#fff' : 'var(--text-mute)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {done ? '✓' : num}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: active ? 'var(--text)' : 'var(--text-mute)',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: done ? 'var(--emerald)' : 'var(--border-soft)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <Card padding={40} style={{ width: '100%', maxWidth: 520 }}>
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              Welcome to Closdex
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, margin: '0 0 32px' }}>
              Closdex helps you find verified sales talent who&apos;ve proven their skills through
              real AI-driven challenges. Let&apos;s set up your company profile — it takes under 2
              minutes.
            </p>
            <Btn onClick={() => setStep(2)} style={{ width: '100%' }}>
              Set up company profile →
            </Btn>
            <button
              onClick={() => router.push('/company')}
              style={{
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: 'var(--text-mute)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Tell us about your company</h2>

            <Field label="Industry">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: industry ? 'var(--text)' : 'var(--text-mute)',
                  fontSize: 14,
                }}
              >
                <option value="">Select industry</option>
                {INDUSTRY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>

            <Field label="Company size">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: `1.5px solid ${size === s ? 'var(--cool)' : 'var(--border)'}`,
                      background: size === s ? 'color-mix(in oklch, var(--cool) 15%, transparent)' : 'transparent',
                      color: size === s ? 'var(--cool)' : 'var(--text-dim)',
                      fontSize: 13,
                      cursor: 'pointer',
                      fontWeight: size === s ? 600 : 400,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Website">
              <TextInput
                value={website}
                onChange={(v) => setWebsite(v)}
                placeholder="https://yourcompany.com"
              />
            </Field>

            <Field label="Logo URL (optional)">
              <TextInput
                value={logoUrl}
                onChange={(v) => setLogoUrl(v)}
                placeholder="https://yourcompany.com/logo.png"
              />
            </Field>

            <Field label="Office locations (comma-separated)">
              <TextInput
                value={locations}
                onChange={(v) => setLocations(v)}
                placeholder="Mumbai, Bangalore"
              />
            </Field>

            <Field label="About your company">
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Brief description of what you do and the kind of sales talent you're looking for..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: 14,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}
              />
            </Field>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'color-mix(in oklch, #ef4444 15%, var(--surface))',
                  color: '#ef4444',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <Btn
                kind="secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                Back
              </Btn>
              <Btn
                onClick={submitProfile}
                loading={submitting}
                style={{ flex: 2 }}
              >
                Save &amp; continue
              </Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              You&apos;re all set!
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.6, margin: '0 0 32px' }}>
              Your company profile is live. Browse verified sales talent, post jobs, and build your
              shortlists — all in one place.
            </p>
            <Btn onClick={() => router.push('/company/talent')} style={{ width: '100%' }}>
              Browse talent →
            </Btn>
            <button
              onClick={() => router.push('/company')}
              style={{
                display: 'block',
                marginTop: 14,
                background: 'none',
                border: 'none',
                color: 'var(--text-mute)',
                fontSize: 13,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Go to dashboard
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
