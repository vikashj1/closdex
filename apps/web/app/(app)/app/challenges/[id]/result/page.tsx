'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { ApiError, AttemptDetail, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const DIM_LABELS: Record<string, string> = {
  discovery: 'Discovery & Listening',
  objectionHandling: 'Objection Handling',
  valueArticulation: 'Value Articulation',
  conversationalQuality: 'Conversational Quality',
  goalExecution: 'Goal Execution',
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
    <Suspense fallback={<div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading result…</div>}>
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
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading result…</div>;
  }
  if (!attempt) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--text-mute)' }}>{error ?? 'Result not available.'}</div>
        <Btn kind="ghost" onClick={() => router.push('/app/challenges')} style={{ marginTop: 14 }}>
          ← Back to challenges
        </Btn>
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

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {quarantined && (
        <Card
          padding={20}
          style={{
            marginBottom: 24,
            borderColor: 'color-mix(in oklch, var(--d-hard) 40%, var(--border))',
            background: 'color-mix(in oklch, var(--d-hard) 10%, transparent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ color: 'var(--d-hard)', flexShrink: 0, marginTop: 2 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--d-hard)', marginBottom: 4 }}>
                Score withheld pending review
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.55 }}>
                Our anti-cheat heuristics flagged signals consistent with pasted or
                AI-generated replies on this attempt. An admin will review and either
                credit the points or remove the attempt. Your breakdown is shown below
                for transparency — no points will be added to your total until review
                completes. Think this is wrong? Raise a dispute below.
              </div>
            </div>
          </div>
        </Card>
      )}
      <div style={{ textAlign: 'center', padding: '16px 0 36px', animation: 'fadeUp 0.4s ease' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: quarantined
              ? 'color-mix(in oklch, var(--d-hard) 18%, transparent)'
              : achieved
              ? 'color-mix(in oklch, var(--emerald) 18%, transparent)'
              : 'color-mix(in oklch, var(--text-mute) 14%, transparent)',
            color: quarantined ? 'var(--d-hard)' : achieved ? 'var(--emerald)' : 'var(--text-mute)',
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 18,
            border: `1px solid color-mix(in oklch, ${quarantined ? 'var(--d-hard)' : achieved ? 'var(--emerald)' : 'var(--text-mute)'} 35%, transparent)`,
          }}
        >
          <Icon.check /> {quarantined ? 'UNDER REVIEW' : achieved ? 'GOAL ACHIEVED' : scoring ? 'SCORING…' : 'GOAL NOT MET'}
        </div>
        <div className="display" style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: quarantined ? 'var(--text-mute)' : finalPts < 0 ? 'var(--d-expert)' : 'var(--gold)' }}>
          {quarantined ? '—' : finalPts > 0 ? `+${finalPts}` : finalPts}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 8 }}>
          {quarantined
            ? `score withheld · ${attempt.challenge.title}`
            : scoring
            ? 'Your conversation is being evaluated. Refresh in a moment to see the final score.'
            : `points earned · ${attempt.challenge.title}`}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card padding={24}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Score breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            <Row k={`Base (${attempt.challenge.difficulty.toLowerCase()})`} v={attempt.challenge.basePoints} />
            <Row k="× Quality (score / 100)" v={score ? (score / 100).toFixed(2) + 'x' : '—'} />
            <Row k="Goal achieved" v={achieved ? 'Yes' : 'No'} />
            <Row k="Messages used" v={`${attempt.messagesUsed} / ${attempt.challenge.maxMessages}`} />
            <Row k="Attempt #" v={attempt.attemptNumber} />
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 8, borderTop: '1px solid var(--border-soft)' }}>
              <span style={{ fontWeight: 700 }}>Points awarded</span>
              <span className="display mono" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 22 }}>{finalPts}</span>
            </div>
          </div>
        </Card>

        <Card padding={24}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Quality radar</h3>
          {dims.every((d) => d.v === 0) ? (
            <div style={{ padding: 24, color: 'var(--text-mute)', fontSize: 13, textAlign: 'center' }}>
              {scoring ? 'Waiting for evaluator…' : 'No rubric data available.'}
            </div>
          ) : (
            <RubricRadar dims={dims} />
          )}
        </Card>
      </div>

      <Card padding={24}>
        <h3 className="display" style={{ fontSize: 16, margin: '0 0 18px', fontWeight: 600 }}>AI coach feedback</h3>
        {attempt.feedback ? (
          <div style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {attempt.feedback}
          </div>
        ) : (
          <div style={{ padding: 24, color: 'var(--text-mute)', fontSize: 13, textAlign: 'center' }}>
            {scoring ? 'Feedback arrives once scoring completes.' : 'No feedback recorded for this attempt.'}
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => router.push('/app/challenges')}>Next challenge</Btn>
        <Btn kind="secondary" size="lg" onClick={() => router.push('/dashboard')}>Back to dashboard</Btn>
        <Btn kind="ghost" size="lg" onClick={() => router.refresh()}>Refresh score</Btn>
      </div>

      {/* Dispute section */}
      {attempt.status === 'COMPLETED' && !disputeDone && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {!disputeOpen ? (
            <button
              onClick={() => setDisputeOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-mute)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Disagree with the score? Raise a dispute
            </button>
          ) : (
            <Card padding={20} style={{ maxWidth: 560, margin: '0 auto', textAlign: 'left' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px' }}>Raise a dispute</h4>
              <p style={{ fontSize: 12.5, color: 'var(--text-mute)', margin: '0 0 12px' }}>
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
                  border: '1px solid var(--border)',
                  background: 'var(--bg-2)',
                  color: 'var(--text)',
                  fontSize: 13,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                <Btn kind="ghost" size="sm" onClick={() => setDisputeOpen(false)}>Cancel</Btn>
                <Btn
                  kind="primary"
                  size="sm"
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
                >
                  {submittingDispute ? 'Submitting…' : 'Submit dispute'}
                </Btn>
              </div>
            </Card>
          )}
        </div>
      )}
      {disputeDone && (
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12.5, color: 'var(--emerald)' }}>
          ✓ Dispute submitted. We&apos;ll review it within 48 hours.
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-soft)' }}>
      <span style={{ color: 'var(--text-dim)' }}>{k}</span>
      <span className="mono" style={{ fontWeight: 700, color: 'var(--text)' }}>{v}</span>
    </div>
  );
}

function RubricRadar({ dims }: { dims: RubricDim[] }) {
  const cx = 130;
  const cy = 130;
  const r = 90;
  const n = dims.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * (v / 5),
    cy + Math.sin(angle(i)) * r * (v / 5),
  ];
  const poly = dims.map((d, i) => pt(i, d.v).join(',')).join(' ');

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <polygon
            key={lvl}
            points={dims.map((d, i) => pt(i, lvl).join(',')).join(' ')}
            fill="none"
            stroke="var(--border-soft)"
            strokeWidth="0.8"
          />
        ))}
        {dims.map((d, i) => {
          const [x, y] = pt(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-soft)" strokeWidth="0.8" />;
        })}
        <polygon points={poly} fill="color-mix(in oklch, var(--gold) 30%, transparent)" stroke="var(--gold)" strokeWidth="2" />
        {dims.map((d, i) => {
          const [x, y] = pt(i, d.v);
          return <circle key={i} cx={x} cy={y} r="4" fill="var(--gold)" />;
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {dims.map((d) => (
          <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-dim)' }}>
            <span>{d.label}</span>
            <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{d.v.toFixed(1)}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}
