'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import { ApiError, AttemptDetail, ChallengeSummary, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { DIFFICULTY, difficultyFromEnum } from '@/lib/constants';

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [challenge, setChallenge] = useState<ChallengeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestAttempt, setBestAttempt] = useState<AttemptDetail | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      api.challenges.get(params.id),
      api.attempts.listMine(),
    ]).then(([cRes, aRes]) => {
      if (cancelled) return;
      if (cRes.status === 'fulfilled') setChallenge(cRes.value);
      if (aRes.status === 'fulfilled') {
        const mine: AttemptDetail[] = aRes.value;
        const completed = mine.filter(
          (a) => a.challenge.id === params.id && a.status === 'COMPLETED',
        );
        if (completed.length > 0) {
          setIsCompleted(true);
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
  }, [user, params.id]);

  async function onStart() {
    if (!challenge || isCompleted) return;
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

  if (authLoading || !user || loading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading challenge…</div>;
  }
  if (!challenge) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--text-mute)' }}>{error ?? 'Challenge not found.'}</div>
        <Btn kind="ghost" onClick={() => router.push('/challenges')} style={{ marginTop: 14 }}>
          ← Back to challenges
        </Btn>
      </div>
    );
  }

  const level = difficultyFromEnum(challenge.difficulty);

  return (
    <div style={{ padding: '24px 32px' }}>
      <button
        onClick={() => router.push('/challenges')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 12.5,
          marginBottom: 14,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Icon.arrow /></span> Back to challenges
      </button>

      <Card padding={0} style={{ overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: 5, background: DIFFICULTY[level].color }} />
        <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <DifficultyTag level={level} />
              <span style={{ fontSize: 11.5, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono' }}>
                {challenge.category.toUpperCase()}
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 32, margin: '0 0 8px', fontWeight: 700, letterSpacing: '-0.025em' }}>
              {challenge.title}
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: 14.5, lineHeight: 1.5, maxWidth: 720 }}>
              {challenge.brief}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display mono" style={{ fontSize: 38, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
              +{challenge.basePoints}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>base × goal mult</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.user /> Lead persona</h3>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <Avatar name={challenge.persona?.name ?? 'Lead'} size={56} color="oklch(0.55 0.14 290)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{challenge.persona?.name ?? 'Lead'}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                  {[challenge.persona?.role, challenge.persona?.company].filter(Boolean).join(' · ') || 'Persona profile'}
                </div>
              </div>
            </div>
            <div style={{ paddingTop: 14, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Persona personality is hidden — you&apos;ll discover it through the conversation. Use open-ended
              questions, listen for pain points, and adapt your pitch in real time.
            </div>
          </Card>

          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.target /> Your goal</h3>
            <div
              style={{
                padding: '14px 16px',
                background: 'color-mix(in oklch, var(--gold) 10%, transparent)',
                border: '1px solid color-mix(in oklch, var(--gold) 30%, transparent)',
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gold)', marginBottom: 6 }}>
                {challenge.goalType.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                Be specific. Vague commitments don&apos;t count — the AI evaluator looks for an explicit yes.
              </div>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.clock /> Constraints</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Messages</div>
                <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{challenge.maxMessages}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>cap</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attempts</div>
                <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                  {challenge.attemptsAllowed ?? '∞'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>allowed</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
                <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{challenge.status}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>visibility</div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.bolt /> Scoring breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {[
                { l: 'Base points',          v: `${challenge.basePoints}`, note: `${level} tier` },
                { l: '× Goal multiplier',    v: '1.0 – 2.0x',              note: 'Goal-dependent' },
                { l: '× Quality multiplier', v: '0.0 – 1.0',               note: '5-dimension AI rubric' },
                { l: '+ Speed bonus',        v: '+10% base',               note: 'If < 60% messages used' },
                { l: '+ First-try bonus',    v: '+15% base',               note: 'Cleared on attempt 1' },
                { l: '− Spam penalty',       v: '−50',                     note: 'Pushy/unsolicited' },
              ].map((r) => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 8, borderBottom: '1px dashed var(--border-soft)' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.l}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{r.note}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{r.v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            padding={20}
            style={{
              background: 'color-mix(in oklch, var(--gold) 12%, var(--surface))',
              borderColor: 'color-mix(in oklch, var(--gold) 30%, transparent)',
            }}
          >
            {error && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
                  color: 'var(--d-expert)',
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}
            {isCompleted ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 0',
                  borderRadius: 10,
                  background: 'color-mix(in oklch, var(--emerald) 14%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                  color: 'var(--emerald)', fontSize: 14, fontWeight: 700,
                  marginBottom: 10,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Challenge completed
                </div>
                {bestAttempt && (
                  <div style={{ fontSize: 12, color: 'var(--text-mute)', textAlign: 'center', marginBottom: 10 }}>
                    Best score: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>+{bestAttempt.pointsAwarded ?? 0} pts</span>
                    {bestAttempt.score != null && ` · ${bestAttempt.score}/100`}
                  </div>
                )}
                <Btn
                  kind="ghost"
                  full
                  size="md"
                  onClick={() => bestAttempt && router.push(`/challenges/${params.id}/result?attempt=${bestAttempt.id}`)}
                >
                  View result
                </Btn>
              </>
            ) : (
              <>
                <Btn kind="primary" full size="lg" icon={<Icon.bolt />} onClick={onStart} disabled={starting}>
                  {starting ? 'Starting…' : 'Start challenge'}
                </Btn>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', textAlign: 'center', marginTop: 12 }}>
                  Once started, abandoning costs −25 pts.
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

const DET_H: CSSProperties = {
  fontSize: 13,
  margin: '0 0 4px',
  fontWeight: 600,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};
