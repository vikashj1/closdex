'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Icon } from '@/components/ui/Icon';

const STEPS = ['Profile', 'Specialization', 'Self-assessment', 'Resume'] as const;

const SPECIALIZATIONS: { name: string; active?: boolean; soon?: boolean }[] = [
  { name: 'IT Sales', active: true },
  { name: 'SaaS', soon: true },
  { name: 'BFSI', soon: true },
  { name: 'FMCG', soon: true },
  { name: 'EdTech', soon: true },
  { name: 'Real Estate', soon: true },
  { name: 'Insurance', soon: true },
  { name: 'Healthcare', soon: true },
];

const SELF_ASSESS: { q: string; val: number }[] = [
  { q: 'Cold outreach (email + LinkedIn)', val: 3 },
  { q: 'Discovery & qualification', val: 4 },
  { q: 'Objection handling', val: 2 },
  { q: 'Negotiation & closing', val: 3 },
  { q: 'Multi-stakeholder deals', val: 2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo size={20} />
        <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>
          Step {step} of {STEPS.length} — takes 4 minutes
        </span>
      </header>

      {/* Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 10 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 4, borderRadius: 999, background: i < step ? 'var(--gold)' : 'var(--surface-2)' }} />
            <div style={{ fontSize: 11.5, color: i < step ? 'var(--gold)' : 'var(--text-mute)', fontWeight: 600 }}>
              <span className="mono">{String(i + 1).padStart(2, '0')} </span>{s}
            </div>
          </div>
        ))}
      </div>

      <Card padding={36} style={{ maxWidth: 760, alignSelf: 'center', width: '100%' }}>
        {step === 1 && <StepProfile />}
        {step === 2 && <StepSpecialization />}
        {step === 3 && <StepSelfAssessment />}
        {step === 4 && <StepResume />}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <Btn kind="ghost" onClick={() => (step > 1 ? setStep(step - 1) : router.push('/signup'))}>
            Back
          </Btn>
          <Btn
            kind="primary"
            icon={<Icon.arrow />}
            onClick={() => (step < STEPS.length ? setStep(step + 1) : router.push('/dashboard'))}
          >
            {step < STEPS.length ? 'Continue' : 'Finish & start walkthrough'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function StepProfile() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Tell us about yourself</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        This will appear on your public profile and is visible to verified hiring companies.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Full name" required>
          <TextInput placeholder="Your full name" />
        </Field>
        <Field label="Display handle" hint="closdex.com/u/yourname">
          <TextInput placeholder="yourname" />
        </Field>
        <Field label="City" required>
          <TextInput placeholder="Bangalore" />
        </Field>
        <Field label="Years of sales experience" required>
          <TextInput placeholder="4" />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Current company (optional)" hint="Visible only if you choose so">
            <TextInput placeholder="e.g. Freshworks" />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Short bio" hint="Max 240 characters">
            <textarea
              rows={3}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 12,
                fontSize: 13.5,
                color: 'var(--text)',
                resize: 'vertical',
              }}
              placeholder="What kind of sales do you love? What makes you good at it?"
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function StepSpecialization() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Pick your specializations</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        Select up to 3. Phase 1 launches with IT Sales — others coming soon.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {SPECIALIZATIONS.map((t) => (
          <button
            key={t.name}
            disabled={t.soon}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              background: t.active ? 'color-mix(in oklch, var(--gold) 18%, transparent)' : 'var(--bg-2)',
              border: `1px solid ${t.active ? 'var(--gold)' : 'var(--border)'}`,
              color: t.active ? 'var(--gold)' : t.soon ? 'var(--text-mute)' : 'var(--text)',
              fontSize: 13,
              fontWeight: 600,
              opacity: t.soon ? 0.55 : 1,
              cursor: t.soon ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {t.name}
            {t.active && <Icon.check />}
            {t.soon && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-2)' }}>SOON</span>
            )}
          </button>
        ))}
      </div>
      <div
        style={{
          marginTop: 24,
          padding: 14,
          borderRadius: 10,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-soft)',
          fontSize: 12.5,
          color: 'var(--text-dim)',
        }}
      >
        <strong style={{ color: 'var(--text)' }}>Sub-tags within IT Sales:</strong> Cloud / Infra · Cybersecurity · DevTools · IT Services · Hardware · Networking
      </div>
    </>
  );
}

function StepSelfAssessment() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Quick skill self-assessment</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        Used to calibrate your starting difficulty. Doesn&apos;t affect your rank — only your first 3 recommended challenges.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {SELF_ASSESS.map((s) => (
          <div key={s.q}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13.5 }}>
              <span>{s.q}</span>
              <span className="mono" style={{ color: 'var(--gold)', fontWeight: 600 }}>{s.val} / 5</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ flex: 1, height: 8, borderRadius: 4, background: n <= s.val ? 'var(--gold)' : 'var(--surface-2)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StepResume() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Upload your resume</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        PDF or DOCX, max 5 MB. Used for company-side hiring only — never shown publicly without your consent.
      </p>
      <div style={{ padding: 32, border: '2px dashed var(--border)', borderRadius: 12, textAlign: 'center', background: 'var(--bg-2)' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'color-mix(in oklch, var(--gold) 15%, transparent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold)',
            marginBottom: 12,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Drag your resume here</div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 16 }}>or</div>
        <Btn kind="secondary" size="sm">Browse files</Btn>
      </div>
      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: 'color-mix(in oklch, var(--gold) 8%, transparent)',
          border: '1px solid color-mix(in oklch, var(--gold) 25%, transparent)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          fontSize: 12.5,
        }}
      >
        <Icon.bolt />
        <span>
          Next: a 5-minute walkthrough challenge to introduce the scoring rubric.{' '}
          <strong style={{ color: 'var(--gold)' }}>+50 points</strong> on completion.
        </span>
      </div>
    </>
  );
}
