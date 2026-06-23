'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, AttemptDetail, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const DIM_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  objectionHandling: 'Objection handling',
  valueArticulation: 'Value articulation',
  conversationalQuality: 'Conversation flow',
  goalExecution: 'Goal execution',
};

// Coach tip per weakest rubric dimension. Mirrors the dashboard's coach map so
// the salesperson hears a consistent voice across the journey.
const COACH_TIPS: Record<string, { focus: string; tip: string }> = {
  discovery: {
    focus: 'discovery',
    tip: 'Ask one open-ended question before pitching — let the buyer name the pain first.',
  },
  objectionHandling: {
    focus: 'objection handling',
    tip: 'Acknowledge the objection in their words, then ask one clarifying question before answering.',
  },
  valueArticulation: {
    focus: 'value articulation',
    tip: 'Translate features into rupee impact or hours saved. Numbers beat adjectives.',
  },
  conversationalQuality: {
    focus: 'conversation flow',
    tip: 'Mirror their last sentence and ask one short follow-up — drop the script.',
  },
  goalExecution: {
    focus: 'goal execution',
    tip: 'State the next step early and end every message with a clear ask, not a question.',
  },
};

interface RubricDim { key: string; label: string; v: number }

function extractDims(rubricScores: Record<string, number> | null | undefined): RubricDim[] {
  if (!rubricScores) {
    return Object.entries(DIM_LABELS).map(([key, label]) => ({ key, label, v: 0 }));
  }
  return Object.entries(DIM_LABELS).map(([key, label]) => ({
    key,
    label,
    v: typeof rubricScores[key] === 'number' ? rubricScores[key] : 0,
  }));
}

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: '#7A7A86' }}>Loading result…</div>}>
      <ResultPageInner params={params} />
    </Suspense>
  );
}

function ResultPageInner({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeDone, setDisputeDone] = useState(false);

  useEffect(() => {
    if (!user || !attemptId) {
      if (user && !attemptId) {
        setError('No attempt id provided. Pick a challenge from the library to begin.');
        setLoading(false);
      }
      return;
    }
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    // Scoring runs async via BullMQ — the attempt is COMPLETED the moment the
    // user lands here, but finalScore may still be null for ~2-8s while the
    // worker hits the LLM. Poll on a 2s cadence (capped at 20 attempts ≈ 40s)
    // and stop the moment either pointsAwarded comes back populated OR the
    // attempt looks quarantined (those skip rubric points so pointsAwarded
    // alone isn't a sufficient terminal signal).
    let attempts = 0;
    async function fetchOnce() {
      try {
        const a = await api.attempts.get(attemptId as string);
        if (cancelled) return;
        setAttempt(a);
        setLoading(false);
        const scored = a.pointsAwarded != null || a.feedback != null || a.quarantined === true;
        if (!scored && attempts < 20) {
          attempts += 1;
          pollTimer = setTimeout(fetchOnce, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load attempt.');
        setLoading(false);
      }
    }
    fetchOnce();

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [user, attemptId]);

  if (authLoading || !user || loading) {
    return <div style={{ padding: 32, color: '#7A7A86' }}>Loading result…</div>;
  }
  if (!attempt) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: '#7A7A86' }}>{error ?? 'Result not available.'}</div>
        <button
          onClick={() => router.push('/app/challenges')}
          style={{
            marginTop: 14,
            background: '#fff',
            color: '#0B0B0F',
            border: '1px solid #E7E7EC',
            borderRadius: 10,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back to challenges
        </button>
      </div>
    );
  }

  const dims = extractDims(attempt.rubricScores);
  const achieved = attempt.goalAchieved ?? false;
  const finalPts = attempt.pointsAwarded ?? 0;
  const score = attempt.score ?? 0;
  const quarantined = attempt.quarantined === true;
  // Scoring is "in flight" when the attempt is completed but the worker hasn't
  // populated the breakdown yet. Quarantined attempts DO get a breakdown so we
  // don't treat them as still-scoring.
  const scoring = !quarantined && (
    attempt.status === 'IN_PROGRESS' ||
    (attempt.pointsAwarded == null && attempt.feedback == null)
  );

  // Status pill colors
  const pillStyle = quarantined
    ? {
        background: 'rgba(220,38,38,0.1)',
        border: '1px solid rgba(220,38,38,0.32)',
        color: '#DC2626',
      }
    : achieved
    ? {
        background: 'rgba(31,138,91,0.1)',
        border: '1px solid rgba(31,138,91,0.32)',
        color: '#1F8A5B',
      }
    : {
        background: 'rgba(154,154,164,0.1)',
        border: '1px solid rgba(154,154,164,0.32)',
        color: '#7A7A86',
      };

  const pillLabel = quarantined
    ? 'Under review'
    : scoring
    ? 'Scoring…'
    : achieved
    ? 'Goal achieved'
    : 'Goal not met';

  // Hero number color
  const heroColor = quarantined ? '#9A9AA4' : finalPts < 0 ? '#DC2626' : '#F5A524';

  // Ring offset for SVG (circumference 565, fill based on score 0-100)
  const ringPct = Math.max(0, Math.min(100, score)) / 100;
  const ringOffset = quarantined || scoring ? 565 : 565 - 565 * ringPct;

  // Build radar polygon points dynamically
  const cx = 130;
  const cy = 130;
  const r = 90;
  const n = dims.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * (v / 5),
    cy + Math.sin(angle(i)) * r * (v / 5),
  ];
  const dataPoly = dims.map((d, i) => pt(i, d.v).join(',')).join(' ');
  const ringPolygons = [1, 2, 3, 4, 5].map((lvl) =>
    dims.map((_, i) => pt(i, lvl).join(',')).join(' ')
  );
  const dimsHaveData = dims.some((d) => d.v > 0);
  const dimAvg = dimsHaveData
    ? (dims.reduce((s, d) => s + d.v, 0) / dims.length).toFixed(1)
    : '—';

  // Coach tip = weakest rubric dim from this attempt. Falls back when there's
  // no rubric data (scoring still in flight, or quarantined with no breakdown).
  let weakestDim: string | null = null;
  if (dimsHaveData) {
    let lowest = Infinity;
    for (const d of dims) {
      if (d.v < lowest) { lowest = d.v; weakestDim = d.key; }
    }
  }
  const coach = weakestDim && COACH_TIPS[weakestDim]
    ? COACH_TIPS[weakestDim]
    : { focus: 'the next round', tip: 'Try the same persona at the next difficulty when your discovery feels solid.' };

  return (
    <main style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }} data-resp="result">
      <div style={{ maxWidth: 1020, margin: '0 auto', padding: '40px 40px 80px' }}>

        {/* Back link */}
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => router.push('/app/attempts')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#7A7A86',
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            Back to My Attempts
          </button>
        </div>

        {/* Quarantine banner */}
        {quarantined && (
          <div
            style={{
              marginBottom: 24,
              padding: 20,
              border: '1px solid rgba(220,38,38,0.32)',
              background: 'rgba(220,38,38,0.05)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div style={{ color: '#DC2626', flexShrink: 0, marginTop: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#DC2626', marginBottom: 4 }}>
                Score withheld pending review
              </div>
              <div style={{ fontSize: 13, color: '#5A5A66', lineHeight: 1.55 }}>
                Our anti-cheat heuristics flagged signals consistent with pasted or
                AI-generated replies on this attempt. An admin will review and either
                credit the points or remove the attempt. Your breakdown is shown below
                for transparency — no points will be added to your total until review
                completes. Think this is wrong? Raise a dispute below.
              </div>
            </div>
          </div>
        )}

        {/* ===== HERO SCORE ===== */}
        <section style={{ textAlign: 'center', padding: '14px 0 44px' }}>

          {/* Status pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 13px 6px 11px',
              borderRadius: 100,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 24,
              ...pillStyle,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {quarantined ? (
                <>
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </>
              ) : achieved ? (
                <path d="M20 6 9 17l-5-5" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                </>
              )}
            </svg>
            {pillLabel}
          </div>

          {/* Ring + points */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 220, margin: '0 auto 18px' }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r="90" fill="none" stroke="#F3F2F0" strokeWidth="10" />
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="url(#scoreRing)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="565"
                strokeDashoffset={ringOffset}
                style={{ filter: 'drop-shadow(0 2px 8px rgba(245,165,36,0.32))', transition: 'stroke-dashoffset 0.7s ease' }}
              />
              <defs>
                <linearGradient id="scoreRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F5A524" />
                  <stop offset="100%" stopColor="#F7B948" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.045em', color: heroColor }}>
                {quarantined ? '—' : finalPts > 0 ? `+${finalPts}` : finalPts}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: 8 }}>
                {scoring ? 'Scoring in progress' : 'Points earned'}
              </div>
            </div>
          </div>

          <h1 style={{ margin: '8px 0 6px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#0B0B0F' }}>
            {attempt.challenge.title}
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: '#7A7A86', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em' }}>
            {`Attempt #${attempt.attemptNumber} · ${attempt.challenge.difficulty}`}
          </p>
        </section>

        {/* ===== TOP ROW: BREAKDOWN + RADAR ===== */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Breakdown card */}
          <div style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: '#0B0B0F', letterSpacing: '-0.01em' }}>Score breakdown</h3>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                {attempt.challenge.difficulty} tier
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontSize: 13 }}>

              <BreakdownRow k={`Base (${attempt.challenge.difficulty.toLowerCase()})`} v={attempt.challenge.basePoints} />
              <BreakdownRow k="× Quality (score / 100)" v={score ? `${(score / 100).toFixed(2)}x` : '—'} />
              <BreakdownRow
                k="Goal achieved"
                v={achieved ? 'Yes' : 'No'}
                vColor={achieved ? '#1F8A5B' : '#0B0B0F'}
              />
              <BreakdownRow
                k="Messages used"
                v={
                  <>
                    {attempt.messagesUsed} <span style={{ color: '#9A9AA4', fontWeight: 400 }}>/ {attempt.challenge.maxMessages}</span>
                  </>
                }
              />
              <BreakdownRow k="Attempt #" v={attempt.attemptNumber} last />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0', marginTop: 6, borderTop: '1px solid #E7E7EC' }}>
                <span style={{ fontWeight: 600, color: '#0B0B0F', fontSize: 13.5 }}>Points awarded</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: quarantined ? '#9A9AA4' : '#F5A524', fontSize: 24, letterSpacing: '-0.02em' }}>
                  {quarantined ? '—' : finalPts > 0 ? `+${finalPts}` : finalPts}
                </span>
              </div>

            </div>
          </div>

          {/* Quality radar card */}
          <div style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: '#0B0B0F', letterSpacing: '-0.01em' }}>Quality radar</h3>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                Avg {dimAvg} / 5
              </span>
            </div>

            {!dimsHaveData ? (
              <div style={{ padding: 24, color: '#9A9AA4', fontSize: 13, textAlign: 'center' }}>
                {scoring ? 'Waiting for evaluator…' : 'No rubric data available.'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }} data-result-radar-row>

                {/* Radar SVG */}
                <svg width="200" height="200" viewBox="0 0 260 260" style={{ flexShrink: 0, maxWidth: '100%', height: 'auto' }} data-result-radar>
                  {ringPolygons.map((points, lvl) => (
                    <polygon key={lvl} points={points} fill="none" stroke="#EAEAEF" strokeWidth="0.8" />
                  ))}
                  {dims.map((_, i) => {
                    const [x, y] = pt(i, 5);
                    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#EAEAEF" strokeWidth="0.8" />;
                  })}
                  <polygon points={dataPoly} fill="rgba(245,165,36,0.28)" stroke="#F5A524" strokeWidth="2" />
                  {dims.map((d, i) => {
                    const [x, y] = pt(i, d.v);
                    return <circle key={i} cx={x} cy={y} r="4" fill="#F5A524" />;
                  })}
                </svg>

                {/* Dim list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 0 }}>
                  {dims.map((d) => (
                    <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#5A5A66' }}>
                      <span>{d.label}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", color: '#F5A524', fontWeight: 700 }}>
                        {d.v.toFixed(1)}/5
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

        </section>

        {/* ===== AI COACH FEEDBACK ===== */}
        <section style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(91,75,245,0.1)', color: '#5B4BF5' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </span>
            <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: '#0B0B0F', letterSpacing: '-0.01em' }}>AI coach feedback</h3>
          </div>

          {attempt.feedback ? (
            <div style={{ fontSize: 13.5, color: '#3A3A44', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {attempt.feedback}
            </div>
          ) : (
            <div style={{ padding: 24, color: '#9A9AA4', fontSize: 13, textAlign: 'center' }}>
              {scoring ? 'Feedback arrives once scoring completes.' : 'No feedback recorded for this attempt.'}
            </div>
          )}

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #EAEAEF', display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 2.5-2.4 2.5-4.5a4.8 4.8 0 0 0-1.5-3.5A5 5 0 0 0 14 2C8 2 5 4 5 8c0 1.7.8 3 2 4 .8.7 1.3 1.4 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0B0B0F', marginBottom: 3, fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {weakestDim ? `Work on: ${coach.focus}` : 'Coach tip'}
              </div>
              <div style={{ fontSize: 13, color: '#5A5A66', lineHeight: 1.6 }}>
                {coach.tip}
              </div>
            </div>
          </div>
        </section>

        {/* ===== ACTIONS ===== */}
        <section style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center', marginTop: 8 }} data-result-actions>
          <button
            onClick={() => router.push('/app/challenges')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: '#0B0B0F',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '13px 22px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="m13 2-3 7h7l-9 13 3-9H4l9-11z" />
            </svg>
            Next challenge
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: '#fff',
              color: '#0B0B0F',
              border: '1px solid #E7E7EC',
              borderRadius: 10,
              padding: '13px 22px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
            </svg>
            Back to dashboard
          </button>
          <button
            onClick={() => router.refresh()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              background: '#fff',
              color: '#5A5A66',
              border: '1px solid #E7E7EC',
              borderRadius: 10,
              padding: '13px 18px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Refresh score
          </button>
        </section>

        {/* ===== DISPUTE ===== */}
        {attempt.status === 'COMPLETED' && !disputeDone && (
          <div style={{ marginTop: 36, textAlign: 'center' }}>
            {!disputeOpen ? (
              <button
                onClick={() => setDisputeOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9A9AA4',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationColor: '#D9D9DF',
                  textUnderlineOffset: 3,
                }}
              >
                Disagree with the score? Raise a dispute
              </button>
            ) : (
              <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'left', border: '1px solid #E7E7EC', borderRadius: 14, padding: 20, background: '#FFFFFF' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', color: '#0B0B0F' }}>Raise a dispute</h4>
                <p style={{ fontSize: 12.5, color: '#7A7A86', margin: '0 0 12px' }}>
                  Describe why you believe the scoring is incorrect. Our team reviews disputes within 48h.
                </p>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. I clearly handled the objection at message 5 but it wasn't reflected in the score…"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #E7E7EC',
                    background: '#FAFAF8',
                    color: '#0B0B0F',
                    fontSize: 13,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    onClick={() => setDisputeOpen(false)}
                    style={{
                      background: 'none',
                      color: '#5A5A66',
                      border: '1px solid #E7E7EC',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submittingDispute || disputeReason.trim().length < 10}
                    onClick={async () => {
                      setSubmittingDispute(true);
                      try {
                        await api.disputes.create(attempt!.id, disputeReason.trim());
                        setDisputeDone(true);
                        setDisputeOpen(false);
                      } catch {
                        // silently ignore — keep form open
                      } finally {
                        setSubmittingDispute(false);
                      }
                    }}
                    style={{
                      background: '#0B0B0F',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: submittingDispute || disputeReason.trim().length < 10 ? 'not-allowed' : 'pointer',
                      opacity: submittingDispute || disputeReason.trim().length < 10 ? 0.5 : 1,
                    }}
                  >
                    {submittingDispute ? 'Submitting…' : 'Submit dispute'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {disputeDone && (
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12.5, color: '#1F8A5B' }}>
            ✓ Dispute submitted. We&apos;ll review it within 48 hours.
          </div>
        )}

      </div>
    </main>
  );
}

function BreakdownRow({
  k,
  v,
  vColor,
  last,
}: {
  k: string;
  v: React.ReactNode;
  vColor?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '11px 0',
        borderBottom: last ? 'none' : '1px dashed #EAEAEF',
      }}
    >
      <span style={{ color: '#5A5A66' }}>{k}</span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: vColor ?? '#0B0B0F' }}>{v}</span>
    </div>
  );
}
