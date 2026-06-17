'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, AttemptDetail, ChallengeSummary, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { difficultyFromEnum } from '@/lib/constants';

// Hex color tables sourced directly from challenge-detail.dc.html.
const DIFFICULTY_HEX: Record<string, { stripe: string; tagBg: string; tagBorder: string; tagText: string; dot: string }> = {
  Rookie: { stripe: '#1F8A5B', tagBg: 'rgba(31,138,91,0.12)', tagBorder: 'rgba(31,138,91,0.4)', tagText: '#1F6A47', dot: '#1F8A5B' },
  Easy:   { stripe: '#1F8A5B', tagBg: 'rgba(31,138,91,0.12)', tagBorder: 'rgba(31,138,91,0.4)', tagText: '#1F6A47', dot: '#1F8A5B' },
  Medium: { stripe: '#5B4BF5', tagBg: 'rgba(91,75,245,0.12)', tagBorder: 'rgba(91,75,245,0.4)', tagText: '#3A2DC4', dot: '#5B4BF5' },
  Hard:   { stripe: '#F5A524', tagBg: 'rgba(245,165,36,0.12)', tagBorder: 'rgba(245,165,36,0.4)', tagText: '#8A6A1A', dot: '#F5A524' },
  Expert: { stripe: '#A93F37', tagBg: 'rgba(169,63,55,0.12)', tagBorder: 'rgba(169,63,55,0.4)', tagText: '#8A2F28', dot: '#A93F37' },
};

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [bestAttempt, setBestAttempt] = useState<AttemptDetail | null>(null);
  const [backHover, setBackHover] = useState(false);
  const [ctaHover, setCtaHover] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    const calls: Promise<unknown>[] = [api.challenges.get(params.id)];
    if (user) calls.push(api.attempts.listMine());
    Promise.allSettled(calls).then((results) => {
      if (cancelled) return;
      const cRes = results[0];
      const aRes = user ? results[1] : null;
      if (cRes.status === 'fulfilled') setChallenge(cRes.value as ChallengeSummary);
      if (aRes && aRes.status === 'fulfilled') {
        const mine = aRes.value as AttemptDetail[];
        const completed = mine.filter(
          (a) => a.challenge.id === params.id && a.status === 'COMPLETED',
        );
        if (completed.length > 0) {
          setIsCompleted(true);
          setCompletedCount(completed.length);
          // pick attempt with highest pointsAwarded
          const best = completed.reduce((a, b) =>
            (b.pointsAwarded ?? 0) > (a.pointsAwarded ?? 0) ? b : a,
          );
          setBestAttempt(best);
        }
      }
      setLoading(false);
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof ApiError ? err.message : 'Could not load challenge.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [authLoading, user, params.id]);

  const canRetry = challenge
    ? !challenge.attemptsAllowed || completedCount < challenge.attemptsAllowed
    : false;

  async function onStart() {
    if (!challenge || (isCompleted && !canRetry)) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/app/challenges/${challenge.id}`)}`);
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const attempt = await api.attempts.start(challenge.id);
      router.push(`/play/${attempt.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the attempt.');
      setStarting(false);
    }
  }

  if (authLoading || loading) {
    return <div style={{ padding: 32, color: '#7A7A86' }}>Loading challenge…</div>;
  }
  if (!challenge) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: '#7A7A86' }}>{error ?? 'Challenge not found.'}</div>
        <button
          onClick={() => router.push('/app/challenges')}
          style={{
            marginTop: 14,
            background: 'transparent',
            border: '1px solid #E7E7EC',
            borderRadius: 10,
            padding: '8px 14px',
            color: '#0B0B0F',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Back to challenges
        </button>
      </div>
    );
  }

  const level = difficultyFromEnum(challenge.difficulty);
  const palette = DIFFICULTY_HEX[level] ?? DIFFICULTY_HEX.Easy;
  const persona = challenge.persona;
  const personaInitial = (persona?.name ?? 'L').trim().charAt(0).toUpperCase();
  const personaSubtitle =
    [persona?.role, persona?.company].filter(Boolean).join(' · ') || 'Persona profile';
  const goalLabel = challenge.goalType.replace(/_/g, ' ');
  const category = challenge.category ? challenge.category.toUpperCase() : '';
  const attemptsAllowedDisplay: string | number =
    challenge.attemptsAllowed ?? '∞';
  const remaining = challenge.attemptsAllowed != null
    ? challenge.attemptsAllowed - completedCount
    : null;
  const bestPts = bestAttempt?.pointsAwarded ?? 0;

  return (
    <main
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#FFFFFF',
        color: '#0B0B0F',
        fontFamily: 'Inter, -apple-system, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '32px 40px 80px',
          animation: 'fadeUp 0.4s ease-out',
        }}
      >
        {/* Inline back link */}
        <button
          onClick={() => router.push('/app/challenges')}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            color: backHover ? '#0B0B0F' : '#7A7A86',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 12.5,
            fontWeight: 500,
            marginBottom: 18,
            fontFamily: 'inherit',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to challenges
        </button>

        {/* HERO CARD */}
        <section
          style={{
            border: '1px solid #E7E7EC',
            borderRadius: 14,
            background: '#FFFFFF',
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          <div style={{ height: 5, background: palette.stripe }} />
          <div
            style={{
              padding: '26px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 24,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 9,
                  alignItems: 'center',
                  marginBottom: 14,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px',
                    borderRadius: 100,
                    background: palette.tagBg,
                    border: `1px solid ${palette.tagBorder}`,
                    color: palette.tagText,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: palette.dot,
                      display: 'inline-block',
                    }}
                  />
                  {level}
                </span>
                {category && (
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                    }}
                  >
                    {category}
                  </span>
                )}
              </div>

              <h1
                style={{
                  margin: '0 0 10px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 32,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: '#0B0B0F',
                }}
              >
                {challenge.title}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: '#5A5A66',
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  maxWidth: 560,
                }}
              >
                {challenge.brief}
              </p>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 40,
                  lineHeight: 1,
                  color: '#F5A524',
                  letterSpacing: '-0.03em',
                }}
              >
                +{challenge.basePoints}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9A9AA4',
                  marginTop: 6,
                }}
              >
                base × goal mult
              </div>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN BODY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 18,
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* Lead persona */}
            <section
              style={{
                border: '1px solid #E7E7EC',
                borderRadius: 14,
                padding: '22px 24px',
                background: '#FFFFFF',
              }}
            >
              <h3
                style={{
                  margin: '0 0 14px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5.5 21a8 8 0 0 1 13 0" />
                </svg>
                Lead persona
              </h3>

              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  paddingBottom: 18,
                  borderBottom: '1px solid #EAEAEF',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(160deg, #4A3AD9, #2C2256)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 20,
                    flexShrink: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {personaInitial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#0B0B0F', lineHeight: 1.2 }}>
                    {persona?.name ?? 'Lead'}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#7A7A86', marginTop: 5, lineHeight: 1.3 }}>
                    {personaSubtitle}
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 14, fontSize: 12.5, color: '#5A5A66', lineHeight: 1.6 }}>
                Persona personality is hidden — you{'’'}ll discover it through the conversation. Lead with open-ended questions, listen for friction points, then adapt your pitch in real time.
              </div>
            </section>

            {/* Your goal */}
            <section
              style={{
                border: '1px solid #E7E7EC',
                borderRadius: 14,
                padding: '22px 24px',
                background: '#FFFFFF',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1.4" />
                </svg>
                Your goal
              </h3>

              <div
                style={{
                  background: '#FFFBF2',
                  border: '1px solid #F4E4C4',
                  borderRadius: 11,
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: '#8A6A1A',
                    lineHeight: 1.35,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {goalLabel}
                </div>
                <div style={{ fontSize: 12.5, color: '#7A7A86', marginTop: 8, lineHeight: 1.5 }}>
                  {challenge.goalDescription ||
                    `Be specific. The AI evaluator looks for an explicit yes — vague commitments don’t count.`}
                </div>
              </div>
            </section>

            {/* Constraints */}
            <section
              style={{
                border: '1px solid #E7E7EC',
                borderRadius: 14,
                padding: '22px 24px',
                background: '#FFFFFF',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Constraints
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                    }}
                  >
                    Messages
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#0B0B0F',
                      marginTop: 6,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {challenge.maxMessages}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#9A9AA4', marginTop: 3 }}>cap</div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                    }}
                  >
                    Attempts
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#0B0B0F',
                      marginTop: 6,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {attemptsAllowedDisplay}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#9A9AA4', marginTop: 3 }}>allowed</div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                    }}
                  >
                    Status
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#1F8A5B',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#1F8A5B',
                        letterSpacing: '-0.015em',
                      }}
                    >
                      {challenge.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#9A9AA4', marginTop: 3 }}>visibility</div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            {/* Scoring breakdown */}
            <section
              style={{
                border: '1px solid #E7E7EC',
                borderRadius: 14,
                padding: '22px 24px',
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#0B0B0F',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Scoring breakdown
                </h3>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                  }}
                >
                  {level} tier
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { l: 'Base points',          v: `+${challenge.basePoints}`,  note: `${level} tier`,         danger: false, last: false },
                  { l: '× Goal multiplier',    v: '1.0 – 2.0x',                note: 'Goal-dependent',        danger: false, last: false },
                  { l: '× Quality multiplier', v: '0.0 – 1.0',                 note: '5-dimension AI rubric', danger: false, last: false },
                  { l: '+ Speed bonus',        v: '+10% base',                 note: 'If < 60% messages used', danger: false, last: false },
                  { l: '+ First-try bonus',    v: '+15% base',                 note: 'Cleared on attempt 1',  danger: false, last: false },
                  { l: '− Spam penalty',       v: '−50',                       note: 'Pushy or unsolicited',  danger: true,  last: true  },
                ].map((r) => (
                  <div
                    key={r.l}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: r.last ? '11px 0 4px' : '11px 0',
                      borderBottom: r.last ? 'none' : '1px dashed #EAEAEF',
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0B0B0F' }}>{r.l}</div>
                      <div style={{ fontSize: 11, color: '#9A9AA4', marginTop: 2 }}>{r.note}</div>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 13,
                        fontWeight: 700,
                        color: r.danger ? '#A93F37' : '#F5A524',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.v}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA card */}
            <section
              style={{
                border: '1px solid #F4E4C4',
                borderRadius: 14,
                padding: '22px 24px',
                background: '#FFFBF2',
              }}
            >
              {error && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'rgba(169,63,55,0.12)',
                    color: '#A93F37',
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}

              {isCompleted ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '14px 0',
                      borderRadius: 10,
                      background: 'rgba(31,138,91,0.14)',
                      border: '1px solid rgba(31,138,91,0.35)',
                      color: '#1F8A5B',
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Challenge completed
                  </div>
                  {bestAttempt && (
                    <div
                      style={{
                        fontSize: 12,
                        color: '#7A7A86',
                        textAlign: 'center',
                        marginBottom: 10,
                      }}
                    >
                      Best score:{' '}
                      <span
                        style={{
                          color: bestPts < 0 ? '#A93F37' : '#F5A524',
                          fontWeight: 700,
                        }}
                      >
                        {bestPts > 0 ? `+${bestAttempt.pointsAwarded}` : bestPts} pts
                      </span>
                      {bestAttempt.score != null && ` · ${bestAttempt.score}/100`}
                    </div>
                  )}
                  <button
                    onClick={() =>
                      bestAttempt &&
                      router.push(`/app/challenges/${params.id}/result?attempt=${bestAttempt.id}`)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      width: '100%',
                      background: '#FFFFFF',
                      color: '#0B0B0F',
                      border: '1px solid #E7E7EC',
                      borderRadius: 11,
                      padding: '12px 18px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    View result
                  </button>
                  {canRetry ? (
                    <>
                      <button
                        onClick={onStart}
                        disabled={starting}
                        onMouseEnter={() => setCtaHover(true)}
                        onMouseLeave={() => setCtaHover(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 9,
                          width: '100%',
                          marginTop: 8,
                          background: starting ? '#3A3A44' : ctaHover ? '#23232B' : '#0B0B0F',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 11,
                          padding: '14px 18px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 15,
                          fontWeight: 600,
                          cursor: starting ? 'not-allowed' : 'pointer',
                          letterSpacing: '-0.005em',
                        }}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m13 2-3 7h7l-9 13 3-9H4l9-11z" />
                        </svg>
                        {starting ? 'Starting…' : 'Try again'}
                      </button>
                      <div
                        style={{
                          textAlign: 'center',
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                          color: '#9A9AA4',
                          marginTop: 13,
                          letterSpacing: '0.03em',
                          lineHeight: 1.5,
                        }}
                      >
                        {remaining != null
                          ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining`
                          : 'Unlimited attempts'}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 11,
                        color: '#9A9AA4',
                        marginTop: 13,
                        letterSpacing: '0.03em',
                        lineHeight: 1.5,
                      }}
                    >
                      Max attempts reached
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={onStart}
                    disabled={starting}
                    onMouseEnter={() => setCtaHover(true)}
                    onMouseLeave={() => setCtaHover(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      width: '100%',
                      background: starting ? '#3A3A44' : ctaHover ? '#23232B' : '#0B0B0F',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 11,
                      padding: '14px 18px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: starting ? 'not-allowed' : 'pointer',
                      letterSpacing: '-0.005em',
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m13 2-3 7h7l-9 13 3-9H4l9-11z" />
                    </svg>
                    {starting ? 'Starting…' : 'Start challenge'}
                  </button>
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      color: '#9A9AA4',
                      marginTop: 13,
                      letterSpacing: '0.03em',
                      lineHeight: 1.5,
                    }}
                  >
                    Once started, abandoning costs −25 pts.
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
