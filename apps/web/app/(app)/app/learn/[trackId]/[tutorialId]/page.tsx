'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, TutorialDetail, TrackProgress } from '@/lib/api';
import { useAuth } from '@/lib/auth';

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

  const [backHover, setBackHover] = useState(false);
  const [completeHover, setCompleteHover] = useState(false);
  const [takeQuizHover, setTakeQuizHover] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);
  const [tryAgainHover, setTryAgainHover] = useState(false);
  const [backTrackHover, setBackTrackHover] = useState(false);

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
      <div style={{ padding: 32, color: '#7A7A86', fontSize: 13.5 }}>
        Loading tutorial…
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: '#7A7A86', marginBottom: 14, fontSize: 13.5 }}>
          {error ?? 'Tutorial not found.'}
        </div>
        <button
          onClick={() => router.push(`/learn/${trackId}`)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: 'none',
            color: '#7A7A86',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          Back to track
        </button>
      </div>
    );
  }

  const allAnswered =
    tutorial.quiz != null &&
    selectedAnswers.length === tutorial.quiz.questions.length &&
    selectedAnswers.every((a) => a !== -1);

  const typeLabel = tutorial.type === 'VIDEO' ? 'Video' : 'Article';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 80px' }}>
      {/* Back link */}
      <button
        onClick={() => router.push(`/learn/${trackId}`)}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: backHover ? '#0B0B0F' : '#7A7A86',
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontSize: 12.5,
          fontWeight: 500,
          marginBottom: 18,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
        Back to track
      </button>

      {/* Breadcrumb strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#7A7A86',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
        <span>{tutorial.track.title}</span>
        <span style={{ color: '#E7E7EC' }}>·</span>
        <span>{tutorial.track.category}</span>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            flex: 1,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '-0.022em',
            color: '#0B0B0F',
            lineHeight: 1.2,
          }}
        >
          {tutorial.title}
        </h1>
        <span
          style={{
            flexShrink: 0,
            padding: '5px 11px',
            borderRadius: 20,
            background: '#FFFBF2',
            border: '1px solid #F4E4C4',
            color: '#8A6A1A',
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(220, 38, 38, 0.08)',
            color: '#B91C1C',
            fontSize: 12.5,
            border: '1px solid rgba(220, 38, 38, 0.22)',
          }}
        >
          {error}
        </div>
      )}

      {/* Content card */}
      <section
        style={{
          border: '1px solid #E7E7EC',
          borderRadius: 14,
          padding: 28,
          background: '#FFFFFF',
          marginBottom: 18,
        }}
      >
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
              color: '#3A3A44',
              fontSize: 14.5,
              lineHeight: 1.72,
              whiteSpace: 'pre-wrap',
            }}
          >
            {tutorial.body}
          </div>
        ) : (
          <div
            style={{
              color: '#7A7A86',
              fontSize: 13.5,
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            Content coming soon.
          </div>
        )}

        {/* Mark complete row */}
        <div
          style={{
            marginTop: 26,
            paddingTop: 20,
            borderTop: '1px solid #EAEAEF',
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
                gap: 7,
                padding: '7px 14px',
                borderRadius: 100,
                background: 'rgba(31,138,91,0.1)',
                border: '1px solid rgba(31,138,91,0.32)',
                color: '#1F8A5B',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Completed
            </span>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              onMouseEnter={() => setCompleteHover(true)}
              onMouseLeave={() => setCompleteHover(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                background: completeHover ? '#23232B' : '#0B0B0F',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 22px',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                cursor: completing ? 'not-allowed' : 'pointer',
                opacity: completing ? 0.7 : 1,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              {completing ? 'Saving…' : 'Mark as complete'}
            </button>
          )}
        </div>
      </section>

      {/* Quiz card */}
      {tutorial.quiz && (
        <section
          style={{
            border: '1px solid #E7E7EC',
            borderRadius: 14,
            padding: 24,
            background: '#FFFFFF',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 22,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: '-0.01em',
                  color: '#0B0B0F',
                  lineHeight: 1.2,
                }}
              >
                Quick quiz
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#F5A524',
                }}
              >
                Earn +{tutorial.quiz.rewardPoints} pts
              </div>
            </div>
            <span style={{ fontSize: 12, color: '#7A7A86' }}>
              {tutorial.quiz.questions.length} question{tutorial.quiz.questions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* IDLE: take quiz CTA */}
          {quizState === 'idle' && (
            <div>
              <button
                onClick={startQuiz}
                onMouseEnter={() => setTakeQuizHover(true)}
                onMouseLeave={() => setTakeQuizHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 9,
                  background: takeQuizHover ? '#23232B' : '#0B0B0F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 22px',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Take quiz
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </button>
            </div>
          )}

          {/* TAKING: questions + submit */}
          {quizState === 'taking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {tutorial.quiz.questions.map((q, qi) => (
                <div key={qi}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: '#0B0B0F',
                      marginBottom: 10,
                      lineHeight: 1.5,
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
                            border: selected ? '1.5px solid #F5A524' : '1.5px solid #E7E7EC',
                            background: selected ? 'rgba(245,165,36,0.10)' : 'transparent',
                            color: selected ? '#F5A524' : '#5A5A66',
                            fontFamily: 'Inter, sans-serif',
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

              {/* Submit */}
              <div style={{ marginTop: 6 }}>
                <button
                  onClick={submitQuiz}
                  disabled={!allAnswered || quizSubmitting}
                  onMouseEnter={() => setSubmitHover(true)}
                  onMouseLeave={() => setSubmitHover(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    background: submitHover && allAnswered && !quizSubmitting ? '#23232B' : '#0B0B0F',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 22px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: !allAnswered || quizSubmitting ? 'not-allowed' : 'pointer',
                    opacity: !allAnswered || quizSubmitting ? 0.55 : 1,
                  }}
                >
                  {quizSubmitting ? 'Submitting…' : 'Submit answers'}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7Z" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* RESULT: passed/failed card + actions */}
          {quizState === 'result' && quizResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: 12,
                  background: quizResult.passed
                    ? 'rgba(31,138,91,0.10)'
                    : 'rgba(220,38,38,0.10)',
                  border: quizResult.passed
                    ? '1px solid rgba(31,138,91,0.28)'
                    : '1px solid rgba(220,38,38,0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 22,
                    fontWeight: 800,
                    color: quizResult.passed ? '#1F8A5B' : '#B91C1C',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {quizResult.passed ? 'PASSED' : 'FAILED'}
                </span>

                <div>
                  <div style={{ fontSize: 13, color: '#3A3A44', fontWeight: 500 }}>
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {quizResult.score}
                    </span>
                    {' / '}
                    <span
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {quizResult.total}
                    </span>
                    {' correct'}
                  </div>

                  {quizResult.rewardPointsAwarded > 0 && (
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#F5A524',
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
                  <button
                    onClick={startQuiz}
                    onMouseEnter={() => setTryAgainHover(true)}
                    onMouseLeave={() => setTryAgainHover(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: tryAgainHover ? '#FAFAF8' : '#FFFFFF',
                      color: '#0B0B0F',
                      border: '1px solid #E7E7EC',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Try again
                  </button>
                )}
                {quizResult.passed && (
                  <button
                    onClick={() => router.push(`/learn/${trackId}`)}
                    onMouseEnter={() => setBackTrackHover(true)}
                    onMouseLeave={() => setBackTrackHover(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: backTrackHover ? '#FAFAF8' : '#FFFFFF',
                      color: '#0B0B0F',
                      border: '1px solid #E7E7EC',
                      borderRadius: 10,
                      padding: '10px 18px',
                      fontFamily: 'inherit',
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
                    Back to track
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
