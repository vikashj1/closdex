'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, TutorialDetail, TrackProgress } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';

type QuizState = 'idle' | 'taking' | 'result';

interface QuizResult {
  passed: boolean;
  score: number;
  total: number;
  rewardPointsAwarded: number;
}

export default function TutorialPage() {
  const router = useRouter();
  const params = useParams();
  const trackId = params?.trackId as string;
  const tutorialId = params?.tutorialId as string;

  const { user, loading: authLoading } = useAuth();

  const [tutorial, setTutorial] = useState<TutorialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const calls: Promise<unknown>[] = [api.learning.getTutorial(tutorialId)];
    if (user) calls.push(api.learning.myProgress());

    Promise.all(calls)
      .then((results) => {
        if (cancelled) return;
        setTutorial(results[0] as TutorialDetail);
        if (user) {
          const progress = results[1] as TrackProgress[];
          const alreadyDone = progress.some((tp) =>
            tp.completedTutorialIds.includes(tutorialId),
          );
          setCompleted(alreadyDone);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load tutorial.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authLoading, user, tutorialId]);

  async function handleComplete() {
    if (!tutorial) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/learn/${trackId}/${tutorialId}`)}`);
      return;
    }
    setCompleting(true);
    try {
      await api.learning.completeTutorial(tutorial.id);
      setCompleted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not mark as complete.');
    } finally {
      setCompleting(false);
    }
  }

  function startQuiz() {
    if (!tutorial?.quiz) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/learn/${trackId}/${tutorialId}`)}`);
      return;
    }
    setSelectedAnswers(new Array(tutorial.quiz.questions.length).fill(-1));
    setQuizResult(null);
    setQuizState('taking');
  }

  async function submitQuiz() {
    if (!tutorial?.quiz) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/learn/${trackId}/${tutorialId}`)}`);
      return;
    }
    setQuizSubmitting(true);
    try {
      const res = await api.learning.attemptQuiz(tutorial.quiz.id, selectedAnswers);
      setQuizResult({
        passed: res.passed,
        score: res.score,
        total: res.total,
        rewardPointsAwarded: res.rewardPointsAwarded,
      });
      setQuizState('result');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Quiz submission failed.');
    } finally {
      setQuizSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: 32, color: 'var(--text-mute)', fontSize: 13.5 }}>
        Loading tutorial…
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--text-mute)', marginBottom: 14 }}>
          {error ?? 'Tutorial not found.'}
        </div>
        <Btn kind="ghost" onClick={() => router.push(`/learn/${trackId}`)}>
          ← Back to track
        </Btn>
      </div>
    );
  }

  const allAnswered =
    tutorial.quiz != null &&
    selectedAnswers.length === tutorial.quiz.questions.length &&
    selectedAnswers.every((a) => a !== -1);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Back link */}
      <button
        onClick={() => router.push(`/learn/${trackId}`)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 12.5,
          marginBottom: 16,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: 0,
        }}
      >
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
          <Icon.arrow />
        </span>
        Back to track
      </button>

      {/* Tutorial header */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            fontSize: 11.5,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          <Icon.book />
          <span>{tutorial.track.title}</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span>{tutorial.track.category}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            className="display"
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.022em',
              color: 'var(--text)',
              flex: 1,
            }}
          >
            {tutorial.title}
          </h1>

          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              background:
                tutorial.type === 'VIDEO'
                  ? 'color-mix(in oklch, var(--cool) 14%, transparent)'
                  : 'color-mix(in oklch, var(--gold) 14%, transparent)',
              color: tutorial.type === 'VIDEO' ? 'var(--cool)' : 'var(--gold)',
              border: `1px solid ${tutorial.type === 'VIDEO' ? 'color-mix(in oklch, var(--cool) 28%, transparent)' : 'color-mix(in oklch, var(--gold) 28%, transparent)'}`,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {tutorial.type}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--r-master) 10%, transparent)',
            color: 'var(--r-master)',
            fontSize: 12.5,
            border: '1px solid color-mix(in oklch, var(--r-master) 22%, transparent)',
          }}
        >
          {error}
        </div>
      )}

      {/* Content card */}
      <Card padding={28} style={{ marginBottom: 16 }}>
        {tutorial.type === 'VIDEO' && tutorial.contentUrl ? (
          <iframe
            src={tutorial.contentUrl}
            style={{
              width: '100%',
              height: 420,
              borderRadius: 8,
              border: 'none',
              display: 'block',
            }}
            allow="fullscreen"
            title={tutorial.title}
          />
        ) : tutorial.type === 'ARTICLE' && tutorial.body ? (
          <div
            style={{
              lineHeight: 1.7,
              fontSize: 14,
              color: 'var(--text-dim)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {tutorial.body}
          </div>
        ) : (
          <div style={{ color: 'var(--text-mute)', fontSize: 13.5, textAlign: 'center', padding: '40px 0' }}>
            Content coming soon.
          </div>
        )}

        {/* Mark complete */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {completed ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: 20,
                background: 'color-mix(in oklch, var(--emerald) 14%, transparent)',
                color: 'var(--emerald)',
                border: '1px solid color-mix(in oklch, var(--emerald) 28%, transparent)',
              }}
            >
              <Icon.check />
              Completed
            </span>
          ) : (
            <Btn
              kind="primary"
              icon={<Icon.check />}
              disabled={completing}
              onClick={handleComplete}
            >
              {completing ? 'Saving…' : 'Mark as complete'}
            </Btn>
          )}
        </div>
      </Card>

      {/* Quiz section */}
      {tutorial.quiz && (
        <Card padding={24}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <h2
                className="display"
                style={{ fontSize: 15, fontWeight: 700, margin: '0 0 3px', color: 'var(--text)' }}
              >
                Quick quiz
              </h2>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--gold)',
                  fontWeight: 600,
                }}
              >
                Earn +{tutorial.quiz.rewardPoints} pts
              </span>
            </div>

            {quizState === 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                  {tutorial.quiz.questions.length} question{tutorial.quiz.questions.length !== 1 ? 's' : ''}
                </span>
                <Btn kind="secondary" onClick={startQuiz}>
                  Take quiz
                </Btn>
              </div>
            )}
          </div>

          {quizState === 'taking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {tutorial.quiz.questions.map((q, qi) => (
                <div key={qi}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: 10,
                    }}
                  >
                    {qi + 1}. {q.q}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {q.options.map((opt, oi) => {
                      const selected = selectedAnswers[qi] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => {
                            const next = [...selectedAnswers];
                            next[qi] = oi;
                            setSelectedAnswers(next);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '9px 14px',
                            borderRadius: 20,
                            border: selected
                              ? '1.5px solid var(--gold)'
                              : '1.5px solid var(--border-soft)',
                            background: selected
                              ? 'color-mix(in oklch, var(--gold) 10%, transparent)'
                              : 'transparent',
                            color: selected ? 'var(--gold)' : 'var(--text-dim)',
                            fontSize: 13,
                            fontWeight: selected ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'border-color 0.1s, background 0.1s, color 0.1s',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 6 }}>
                <Btn
                  kind="primary"
                  icon={<Icon.send />}
                  disabled={!allAnswered || quizSubmitting}
                  onClick={submitQuiz}
                >
                  {quizSubmitting ? 'Submitting…' : 'Submit answers'}
                </Btn>
              </div>
            </div>
          )}

          {quizState === 'result' && quizResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 12,
                  background: quizResult.passed
                    ? 'color-mix(in oklch, var(--emerald) 10%, transparent)'
                    : 'color-mix(in oklch, var(--r-master) 10%, transparent)',
                  border: `1px solid ${quizResult.passed ? 'color-mix(in oklch, var(--emerald) 25%, transparent)' : 'color-mix(in oklch, var(--r-master) 25%, transparent)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  className="display"
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: quizResult.passed ? 'var(--emerald)' : 'var(--r-master)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {quizResult.passed ? 'PASSED' : 'FAILED'}
                </span>

                <div>
                  <div
                    style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}
                  >
                    <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                      {quizResult.score}
                    </span>
                    {' / '}
                    <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                      {quizResult.total}
                    </span>
                    {' correct'}
                  </div>

                  {quizResult.rewardPointsAwarded > 0 && (
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: 'var(--gold)',
                        marginTop: 3,
                      }}
                    >
                      +{quizResult.rewardPointsAwarded} pts awarded!
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {!quizResult.passed && (
                  <Btn kind="ghost" onClick={startQuiz}>
                    Try again
                  </Btn>
                )}
                {quizResult.passed && (
                  <Btn kind="ghost" onClick={() => router.push(`/learn/${trackId}`)}>
                    ← Back to track
                  </Btn>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
