'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const [backHover, setBackHover] = useState(false);
  const [primaryHover, setPrimaryHover] = useState(false);

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: '#7A7A86' }}>Loading…</div>;
  }

  return (
    <div
      data-resp="auth"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#FFFFFF',
        color: '#0B0B0F',
        fontFamily: 'Inter,-apple-system,sans-serif',
        padding: '32px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ============ TOP HEADER BAR ============ */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Closdex wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5 22 20.5H2L12 2.5Z" fill="#0B0B0F" />
            <path d="M12 12.2 16.8 20.5H7.2L12 12.2Z" fill="#5B4BF5" />
          </svg>
          <span
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.03em',
              color: '#0B0B0F',
            }}
          >
            Closdex
          </span>
        </div>

        {/* Step indicator */}
        <span
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7A7A86',
          }}
        >
          Step {step} of {STEPS.length} — takes 4 minutes
        </span>
      </header>

      {/* ============ STEPPER ROW ============ */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length},1fr)`, gap: 10 }}>
        {STEPS.map((s, i) => {
          const reached = i < step;
          return (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 999,
                  background: reached ? '#F5A524' : '#E7E7EC',
                }}
              />
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: reached ? '#F5A524' : '#7A7A86',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>{' '}
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {/* ============ CARD ============ */}
      <div
        style={{
          maxWidth: 760,
          width: '100%',
          alignSelf: 'center',
          background: '#FFFFFF',
          border: '1px solid #E7E7EC',
          borderRadius: 14,
          padding: 36,
        }}
      >
        {step === 1 && (
          <StepProfile
            experienceYears={experienceYears}
            setExperienceYears={setExperienceYears}
            currentCompany={currentCompany}
            setCurrentCompany={setCurrentCompany}
          />
        )}
        {step === 2 && <StepSpecialization selected={selectedTags} onToggle={toggleTag} />}
        {step === 3 && <StepSelfAssessment scores={selfScores} onChange={setSelfScores} />}
        {step === 4 && <StepFinish name={user.name} />}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'rgba(220,53,69,0.10)',
              color: '#DC3545',
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Card footer */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 22,
            borderTop: '1px solid #E7E7EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.push('/signup'))}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            style={{
              background: backHover ? '#FAFAF8' : '#fff',
              color: backHover ? '#0B0B0F' : '#5A5A66',
              border: '1px solid #E7E7EC',
              borderRadius: 10,
              padding: '11px 16px',
              fontFamily: 'Inter,sans-serif',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back
          </button>

          {step < STEPS.length ? (
            <button
              onClick={() => setStep(step + 1)}
              onMouseEnter={() => setPrimaryHover(true)}
              onMouseLeave={() => setPrimaryHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: primaryHover ? '#23232B' : '#0B0B0F',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '11px 18px',
                fontFamily: 'Inter,sans-serif',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting}
              onMouseEnter={() => setPrimaryHover(true)}
              onMouseLeave={() => setPrimaryHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: primaryHover ? '#23232B' : '#0B0B0F',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '11px 18px',
                fontFamily: 'Inter,sans-serif',
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Setting up…' : 'Finish & start walkthrough'}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ============ HELPFUL NOTE ============ */}
      <div style={{ textAlign: 'center', fontSize: 12, color: '#7A7A86' }}>
        You can change these anytime in Settings.
      </div>
    </div>
  );
}

function StepProfile({
  experienceYears,
  setExperienceYears,
  currentCompany,
  setCurrentCompany,
}: {
  experienceYears: string;
  setExperienceYears: (v: string) => void;
  currentCompany: string;
  setCurrentCompany: (v: string) => void;
}) {
  return (
    <>
      <h2
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: '-0.02em',
          color: '#0B0B0F',
          margin: '0 0 8px',
        }}
      >
        Tell us about yourself
      </h2>
      <p style={{ color: '#5A5A66', fontSize: 14, lineHeight: 1.55, margin: '0 0 26px' }}>
        This will appear on your public profile and is visible to verified hiring companies.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0B0B0F' }}>
            Years of sales experience <span style={{ color: '#DC3545' }}>*</span>
          </label>
          <input
            type="number"
            placeholder="4"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #E7E7EC',
              background: '#FFFFFF',
              color: '#0B0B0F',
              fontFamily: 'Inter,sans-serif',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#0B0B0F' }}>
            Current company
          </label>
          <input
            type="text"
            placeholder="e.g. Freshworks"
            value={currentCompany}
            onChange={(e) => setCurrentCompany(e.target.value)}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              border: '1px solid #E7E7EC',
              background: '#FFFFFF',
              color: '#0B0B0F',
              fontFamily: 'Inter,sans-serif',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 11.5, color: '#7A7A86' }}>
            Optional — visible to recruiters
          </span>
        </div>
      </div>
    </>
  );
}

function StepSpecialization({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <>
      <h2
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: '-0.02em',
          color: '#0B0B0F',
          margin: '0 0 8px',
        }}
      >
        Pick your specializations
      </h2>
      <p style={{ color: '#5A5A66', fontSize: 14, lineHeight: 1.55, margin: '0 0 26px' }}>
        Select up to 3. Phase 1 launches with IT Sales — others coming soon.
      </p>

      {/* Pill grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {SPECIALIZATIONS.map((t) => {
          const active = selected.includes(t.name);
          return (
            <button
              key={t.name}
              disabled={t.soon}
              onClick={() => !t.soon && onToggle(t.name)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 999,
                background: active
                  ? 'rgba(245,165,36,0.18)'
                  : t.soon
                    ? '#FAFAF8'
                    : '#FFFFFF',
                border: `1px solid ${active ? '#F5A524' : '#E7E7EC'}`,
                color: active ? '#F5A524' : t.soon ? '#7A7A86' : '#0B0B0F',
                fontFamily: 'Inter,sans-serif',
                fontSize: 13,
                fontWeight: 600,
                opacity: t.soon ? 0.55 : 1,
                cursor: t.soon ? 'not-allowed' : 'pointer',
              }}
            >
              {t.name}
              {active && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {t.soon && (
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                    background: '#FAFAF8',
                    border: '1px solid #E7E7EC',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  SOON
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function StepSelfAssessment({
  scores,
  onChange,
}: {
  scores: number[];
  onChange: (scores: number[]) => void;
}) {
  return (
    <>
      <h2
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: '-0.02em',
          color: '#0B0B0F',
          margin: '0 0 8px',
        }}
      >
        Quick skill self-assessment
      </h2>
      <p style={{ color: '#5A5A66', fontSize: 14, lineHeight: 1.55, margin: '0 0 26px' }}>
        Calibrates your starting difficulty. Doesn{"'"}t affect rank — only your first few
        recommended challenges.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {SELF_ASSESS_LABELS.map((label, idx) => (
          <div key={label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13.5,
                color: '#0B0B0F',
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  color: '#F5A524',
                  fontWeight: 700,
                }}
              >
                {scores[idx]} / 5
              </span>
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
                    background: n <= scores[idx] ? '#F5A524' : '#E7E7EC',
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
  const firstName = name.split(' ')[0];
  return (
    <>
      <h2
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: '-0.02em',
          color: '#0B0B0F',
          margin: '0 0 8px',
        }}
      >
        You{"'"}re all set, {firstName}!
      </h2>
      <p style={{ color: '#5A5A66', fontSize: 14, lineHeight: 1.55, margin: '0 0 26px' }}>
        Click below to save your profile and jump into your first challenge. You{"'"}ll earn{' '}
        <strong style={{ color: '#F5A524' }}>+50 points</strong> just for completing the
        walkthrough.
      </p>
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: 'rgba(245,165,36,0.08)',
          border: '1px solid rgba(245,165,36,0.25)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontSize: 13.5,
          color: '#0B0B0F',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F5A524"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span>
          Your rank starts at <strong>Rookie</strong>. Every challenge you clear earns points
          that push you up the ladder.
        </span>
      </div>
    </>
  );
}
