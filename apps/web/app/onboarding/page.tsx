'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Icon } from '@/components/ui/Icon';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const STEPS = ['Profile', 'Specialization', 'Self-assessment', 'Finish'] as const;

const SPECIALIZATIONS: { name: string; soon?: boolean }[] = [
  { name: 'IT Sales' },
  { name: 'SaaS', soon: true },
  { name: 'BFSI', soon: true },
  { name: 'FMCG', soon: true },
  { name: 'EdTech', soon: true },
  { name: 'Real Estate', soon: true },
  { name: 'Insurance', soon: true },
  { name: 'Healthcare', soon: true },
];

const SELF_ASSESS_LABELS = [
  'Cold outreach (email + LinkedIn)',
  'Discovery & qualification',
  'Objection handling',
  'Negotiation & closing',
  'Multi-stakeholder deals',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — Profile
  const [experienceYears, setExperienceYears] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');

  // Step 2 — Specialization
  const [selectedTags, setSelectedTags] = useState<string[]>(['IT Sales']);

  // Step 3 — Self-assessment (0–5 scale stored as avg)
  const [selfScores, setSelfScores] = useState<number[]>([3, 4, 2, 3, 2]);

  const avgSelfScore = Math.round(selfScores.reduce((a, b) => a + b, 0) / selfScores.length);

  const toggleTag = (name: string) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev.slice(0, 2), name],
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.users.updateSalesperson({
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
        currentCompany: currentCompany || undefined,
        specializationTags: selectedTags,
        skillSelfAssessment: avgSelfScore,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div data-resp="auth" style={{ minHeight: '100vh', padding: '32px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
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
        {step === 1 && (
          <StepProfile
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
            currentCompany={currentCompany}
            setCurrentCompany={setCurrentCompany}
          />
        )}
        {step === 2 && (
          <StepSpecialization selected={selectedTags} onToggle={toggleTag} />
        )}
        {step === 3 && (
          <StepSelfAssessment scores={selfScores} onChange={setSelfScores} />
        )}
        {step === 4 && <StepFinish name={user.name} />}

        {error && (
          <div style={{
            marginTop: 16,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--r-master) 12%, transparent)',
            color: 'var(--r-master)',
            fontSize: 12.5,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <Btn kind="ghost" onClick={() => (step > 1 ? setStep(step - 1) : router.push('/signup'))}>
            Back
          </Btn>
          {step < STEPS.length ? (
            <Btn kind="primary" icon={<Icon.arrow />} onClick={() => setStep(step + 1)}>
              Continue
            </Btn>
          ) : (
            <Btn kind="primary" icon={<Icon.bolt />} disabled={submitting} onClick={handleFinish}>
              {submitting ? 'Setting up…' : 'Finish & start walkthrough'}
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

function StepProfile({
  experienceYears, setExperienceYears, currentCompany, setCurrentCompany,
}: {
  experienceYears: string; setExperienceYears: (v: string) => void;
  currentCompany: string; setCurrentCompany: (v: string) => void;
}) {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Tell us about yourself</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        This will appear on your public profile and is visible to verified hiring companies.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Years of sales experience" required>
          <TextInput
            type="number"
            placeholder="4"
            value={experienceYears}
            onChange={(v) => setExperienceYears(v)}
          />
        </Field>
        <Field label="Current company" hint="Optional — visible to recruiters">
          <TextInput
            placeholder="e.g. Freshworks"
            value={currentCompany}
            onChange={(v) => setCurrentCompany(v)}
          />
        </Field>
      </div>
    </>
  );
}

function StepSpecialization({
  selected, onToggle,
}: { selected: string[]; onToggle: (name: string) => void }) {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Pick your specializations</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        Select up to 3. Phase 1 launches with IT Sales — others coming soon.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {SPECIALIZATIONS.map((t) => {
          const active = selected.includes(t.name);
          return (
            <button
              key={t.name}
              disabled={t.soon}
              onClick={() => !t.soon && onToggle(t.name)}
              style={{
                padding: '10px 16px',
                borderRadius: 999,
                background: active ? 'color-mix(in oklch, var(--gold) 18%, transparent)' : 'var(--bg-2)',
                border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                color: active ? 'var(--gold)' : t.soon ? 'var(--text-mute)' : 'var(--text)',
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
              {active && <Icon.check />}
              {t.soon && (
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-2)' }}>SOON</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepSelfAssessment({
  scores, onChange,
}: { scores: number[]; onChange: (scores: number[]) => void }) {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>Quick skill self-assessment</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        Calibrates your starting difficulty. Doesn&apos;t affect rank — only your first few recommended challenges.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {SELF_ASSESS_LABELS.map((label, idx) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13.5 }}>
              <span>{label}</span>
              <span className="mono" style={{ color: 'var(--gold)', fontWeight: 600 }}>{scores[idx]} / 5</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  onClick={() => {
                    const next = [...scores];
                    next[idx] = n;
                    onChange(next);
                  }}
                  style={{
                    flex: 1,
                    height: 12,
                    borderRadius: 4,
                    background: n <= scores[idx] ? 'var(--gold)' : 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StepFinish({ name }: { name: string }) {
  return (
    <>
      <h2 className="display" style={{ fontSize: 26, margin: '0 0 8px' }}>You&apos;re all set, {name.split(' ')[0]}!</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 24px', fontSize: 14 }}>
        Click below to save your profile and jump into your first challenge. You&apos;ll earn{' '}
        <strong style={{ color: 'var(--gold)' }}>+50 points</strong> just for completing the walkthrough.
      </p>
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: 'color-mix(in oklch, var(--gold) 8%, transparent)',
          border: '1px solid color-mix(in oklch, var(--gold) 25%, transparent)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontSize: 13.5,
        }}
      >
        <Icon.bolt />
        <span>Your rank starts at <strong>Rookie</strong>. Every challenge you clear earns points that push you up the ladder.</span>
      </div>
    </>
  );
}
