'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, AttemptDetail, CoachingNudge, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Immersive conversation screen. The route param is the **attempt id** — the
 * challenge-detail page calls POST /challenges/:id/attempts first and pushes
 * `/play/:attemptId` with the new attempt's id.
 */
export default function ConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [endHover, setEndHover] = useState(false);
  const [backHover, setBackHover] = useState(false);
  const [micHover, setMicHover] = useState(false);
  const [sendHover, setSendHover] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  // Shown when the conversation closes (goal achieved or message cap hit).
  // The user can dismiss it to keep scrolling through the chat, or click
  // through to the result page.
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [coaching, setCoaching] = useState<CoachingNudge | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputBaseRef = useRef('');
  // Anti-cheat telemetry — reset each time a message ships.
  const firstKeystrokeRef = useRef<number | null>(null);
  const pasteCountRef = useRef(0);
  // Characters that arrived via speech-to-text (Web Speech API mic button OR
  // native OS/mobile keyboard dictation). Voice input dumps text all at once,
  // which the suspicion service reads as superhuman typing speed. Reporting
  // this lets the backend exempt legit dictation.
  const dictationCharsRef = useRef(0);
  const pastedCharsRef = useRef(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.attempts
      .get(params.id)
      .then((a) => { if (!cancelled) { setAttempt(a); setLoading(false); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Could not load attempt.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [user, params.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [attempt?.conversation?.messages?.length, sending]);

  // Initialize Web Speech API for voice input (browser-side, free).
  useEffect(() => {
    const SR: any =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) return;
    setSpeechSupported(true);
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN';
    r.onresult = (e: any) => {
      let finalTxt = '';
      let interimTxt = '';
      let newlyFinalChars = 0;
      for (let i = 0; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTxt += txt;
          // Only count characters as dictated the first time they turn final
          // (avoids double-counting across successive onresult events).
          if (i >= (r._finalCount ?? 0)) {
            newlyFinalChars += txt.length;
            r._finalCount = i + 1;
          }
        } else {
          interimTxt += txt;
        }
      }
      if (newlyFinalChars > 0) dictationCharsRef.current += newlyFinalChars;
      const base = inputBaseRef.current;
      const sep = base && !base.endsWith(' ') ? ' ' : '';
      setInput((base + sep + finalTxt + interimTxt).trimStart());
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
    return () => { try { r.stop(); } catch {} };
  }, []);

  function toggleMic() {
    const r = recognitionRef.current;
    if (!r) return;
    if (listening) {
      try { r.stop(); } catch {}
      setListening(false);
      // Commit the dictated text as the new base.
      inputBaseRef.current = input;
    } else {
      inputBaseRef.current = input;
      try {
        r.start();
        setListening(true);
      } catch {}
    }
  }

  function resetTelemetry() {
    firstKeystrokeRef.current = null;
    pasteCountRef.current = 0;
    pastedCharsRef.current = 0;
    dictationCharsRef.current = 0;
    // Reset the Web Speech API "final result" cursor so the next message
    // starts counting dictated chars from index 0 again.
    const r: any = recognitionRef.current;
    if (r) r._finalCount = 0;
  }

  async function send() {
    if (!input.trim() || !attempt || sending) return;
    const text = input.trim();
    const prevAttempt = attempt;
    // Snapshot telemetry BEFORE clearing the input so we capture this message's
    // typing pattern, not the next one's.
    const clientMeta = {
      pasteCount: pasteCountRef.current,
      pastedChars: pastedCharsRef.current,
      totalTypingMs: firstKeystrokeRef.current
        ? Math.max(0, Date.now() - firstKeystrokeRef.current)
        : 0,
      charCount: text.length,
      dictationChars: Math.min(dictationCharsRef.current, text.length),
    };
    setInput('');
    inputBaseRef.current = '';
    resetTelemetry();
    setError(null);

    // Optimistic: show the user's message immediately, before the round-trip.
    // The server response replaces this with the canonical attempt state.
    setAttempt({
      ...attempt,
      messagesUsed: attempt.messagesUsed + 1,
      conversation: {
        ...attempt.conversation,
        messages: [
          ...attempt.conversation.messages,
          {
            id: `temp-${Date.now()}`,
            sender: 'SALESPERSON',
            content: text,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    setSending(true);
    try {
      const res = await api.attempts.send(attempt.id, text, clientMeta);
      setAttempt(res.attempt);
      // Only surface a coaching nudge while the attempt is still live —
      // once completed, the reflection card on the result page takes over.
      setCoaching(res.attempt.status === 'IN_PROGRESS' ? res.coaching : null);
      // Don't auto-redirect — surface a dismissible modal so the salesperson
      // can still scroll back through the conversation before viewing the
      // result page.
      if (res.attempt.status !== 'IN_PROGRESS') {
        setCloseModalOpen(true);
      }
    } catch (err) {
      setAttempt(prevAttempt);
      setError(err instanceof ApiError ? err.message : 'Send failed.');
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  async function end() {
    if (!attempt) return;
    setEnding(true);
    try {
      await api.attempts.end(attempt.id);
      router.push(`/app/challenges/${attempt.challenge.id}/result?attempt=${attempt.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not end the attempt.');
      setEnding(false);
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div style={{ padding: 32, color: '#7A7A86', fontFamily: 'Inter,-apple-system,sans-serif' }}>
        Loading conversation…
      </div>
    );
  }
  if (!attempt) {
    return (
      <div style={{ padding: 32, fontFamily: 'Inter,-apple-system,sans-serif' }}>
        <div style={{ color: '#7A7A86' }}>{error ?? 'Attempt not found.'}</div>
        <button
          onClick={() => router.push('/app/challenges')}
          style={{
            marginTop: 14,
            background: 'transparent',
            border: '1px solid #E7E7EC',
            color: '#3A3A44',
            padding: '8px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'Inter,sans-serif',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ← Back to challenges
        </button>
      </div>
    );
  }

  const { challenge, conversation, messagesUsed } = attempt;
  const persona = challenge.persona;
  const cap = challenge.maxMessages;
  const goalLabel = challenge.goalType.replace(/_/g, ' ');
  const personaInitial = (persona?.name ?? 'L').charAt(0).toUpperCase();
  const personaName = persona?.name ?? 'Lead';
  const personaRoleCompany = [persona?.role, persona?.company].filter(Boolean).join(', ');
  const canSend = attempt.status === 'IN_PROGRESS' && !sending && input.trim().length > 0;
  const isClosed = attempt.status !== 'IN_PROGRESS';

  return (
    <div
      data-resp="play"
      data-r="cols1-sm"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        height: '100vh',
        width: '100%',
        background: '#FFFFFF',
        color: '#0B0B0F',
        fontFamily: 'Inter,-apple-system,sans-serif',
        overflow: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ============ CHAT COLUMN ============ */}
      {/* minHeight:0 lets the flex:1 messages area constrain so the footer
          stays pinned at the bottom instead of being pushed off-viewport as
          new messages arrive. Height: 100% fills the grid track (which is
          100dvh) — using 100vh directly leaves the composer below the iOS
          keyboard when it opens because vh doesn't shrink with the keyboard. */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #E7E7EC', minWidth: 0, minHeight: 0, height: '100%' }}>
        {/* Top bar — desktop only; mobile uses .play-mobile-chrome below. */}
        <header
          data-r="hide-sm"
          style={{
            minHeight: 64,
            flexShrink: 0,
            borderBottom: '1px solid #E7E7EC',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '10px 24px',
            background: '#FFFFFF',
          }}
        >
          {/* Back */}
          <button
            type="button"
            onClick={() => router.push(`/app/challenges/${challenge.id}`)}
            onMouseEnter={() => setBackHover(true)}
            onMouseLeave={() => setBackHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 9,
              border: '1px solid #E7E7EC',
              color: backHover ? '#0B0B0F' : '#3A3A44',
              background: backHover ? '#FAFAF8' : '#fff',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          {/* Lead identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(160deg,#4A3AD9,#2C2256)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {personaInitial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#0B0B0F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  lineHeight: 1.1,
                }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>{personaName}</span>
                {personaRoleCompany && (
                  <span style={{ fontWeight: 400, color: '#7A7A86', fontSize: 12.5 }}>
                    {'· '}
                    {personaRoleCompany}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 4,
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#1F8A5B',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1F8A5B', display: 'inline-block' }} />
                Online
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Stat pills */}
          <div
            data-r="scrollx full-sm"
            style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: 38, flexShrink: 0 }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 16px',
                borderLeft: '1px solid #E7E7EC',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9A9AA4',
                }}
              >
                Goal
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#F5A524',
                  marginTop: 2,
                  letterSpacing: '-0.01em',
                  textTransform: 'capitalize',
                }}
              >
                {goalLabel}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 16px',
                borderLeft: '1px solid #E7E7EC',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9A9AA4',
                }}
              >
                Messages
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0B0B0F',
                  marginTop: 2,
                }}
              >
                {messagesUsed}
                {' '}
                <span style={{ color: '#9A9AA4', fontWeight: 400 }}>{`/ ${cap}`}</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 16px',
                borderLeft: '1px solid #E7E7EC',
                borderRight: '1px solid #E7E7EC',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#9A9AA4',
                }}
              >
                Attempt
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0B0B0F',
                  marginTop: 2,
                }}
              >
                {`#${attempt.attemptNumber}`}
              </div>
            </div>
          </div>

          {/* End conversation */}
          <button
            type="button"
            onClick={end}
            disabled={ending || isClosed}
            onMouseEnter={() => setEndHover(true)}
            onMouseLeave={() => setEndHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 38,
              padding: '0 16px',
              border: '1px solid rgba(169,63,55,0.4)',
              borderRadius: 10,
              background: endHover && !ending && !isClosed ? 'rgba(169,63,55,0.12)' : 'rgba(169,63,55,0.06)',
              color: '#A93F37',
              fontFamily: 'Inter,sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: ending || isClosed ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              opacity: ending || isClosed ? 0.6 : 1,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M9 9l6 6" />
              <path d="m15 9-6 6" />
            </svg>
            {ending ? 'Ending…' : 'End conversation'}
          </button>
        </header>

        {/* ─── Mobile chrome ─ replaces the desktop header below 768. ───── */}
        <div className="play-mobile-chrome" style={{ flexShrink: 0 }}>
          <header
            style={{
              background: '#fff',
              borderBottom: '1px solid #E7E7EC',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              position: 'sticky',
              top: 0,
              zIndex: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => router.push(`/app/challenges/${challenge.id}`)}
                aria-label="Go back"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: 'none',
                  background: 'transparent',
                  color: '#7A7A86',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(160deg,#4A3AD9,#2C2256)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {personaInitial}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#22C55E',
                    border: '2px solid #fff',
                  }}
                />
              </div>
              <div style={{ minWidth: 0, lineHeight: 1.15 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0B0B0F',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {personaName}
                </h1>
                <p
                  style={{
                    margin: 0,
                    marginTop: 2,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                  }}
                >
                  Online
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: '#EEF2FF',
                  color: '#4338CA',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#6366F1',
                    animation: 'pulseDot 1.4s ease-in-out infinite',
                  }}
                />
                LIVE
              </div>
              <button
                type="button"
                onClick={end}
                disabled={ending || isClosed}
                aria-label="End conversation"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: 'none',
                  background: 'transparent',
                  color: '#EF4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: ending || isClosed ? 'not-allowed' : 'pointer',
                  opacity: ending || isClosed ? 0.5 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l6 6" />
                  <path d="m15 9-6 6" />
                </svg>
              </button>
            </div>
          </header>

          {/* Context summary row */}
          <section style={{ background: '#fff', borderBottom: '1px solid #F1F1F4' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '8px 14px',
                overflowX: 'auto',
                fontSize: 11.5,
                scrollbarWidth: 'none',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ color: '#9A9AA4', fontWeight: 600, letterSpacing: '0.04em' }}>GOAL:</span>
                <span style={{ color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>
                  {goalLabel}
                </span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ color: '#9A9AA4', fontWeight: 600, letterSpacing: '0.04em' }}>MESSAGES:</span>
                <span style={{ color: '#0B0B0F', fontWeight: 600 }}>{messagesUsed} / {cap}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ color: '#9A9AA4', fontWeight: 600, letterSpacing: '0.04em' }}>ATTEMPT:</span>
                <span style={{ color: '#0B0B0F', fontWeight: 600 }}>#{attempt.attemptNumber}</span>
              </div>
            </div>

            <details style={{ borderTop: '1px solid #F1F1F4' }}>
              <summary
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  fontSize: 11.5,
                  color: '#7A7A86',
                  fontWeight: 500,
                  cursor: 'pointer',
                  listStyle: 'none',
                }}
              >
                <span>Show Lead Details &amp; Goal</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div
                style={{
                  background: '#FAFAF8',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #FDE68A',
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        background: '#FEF3C7',
                        color: '#B45309',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                      </svg>
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#B45309',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {goalLabel}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#3A3A44' }}>
                    {challenge.goalDescription}
                  </p>
                </div>

                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #E7E7EC',
                    borderRadius: 12,
                    padding: 12,
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'linear-gradient(160deg,#4A3AD9,#2C2256)',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {personaInitial}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0B0B0F' }}>
                      {personaName}
                    </h4>
                    {personaRoleCompany && (
                      <p style={{ margin: '2px 0 6px', fontSize: 10.5, color: '#9A9AA4' }}>
                        {personaRoleCompany}
                      </p>
                    )}
                    {persona?.contextSnippet && (
                      <p
                        style={{
                          margin: 0,
                          padding: 8,
                          fontSize: 10.5,
                          color: '#7A7A86',
                          fontStyle: 'italic',
                          background: '#FAFAF8',
                          borderRadius: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        “{persona.contextSnippet}”
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </details>
          </section>
        </div>

        {/* Messages scroll area */}
        <div
          ref={scrollRef}
          data-play-thread
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 0 24px',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: '0 auto',
              padding: '0 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {/* SYSTEM kickoff line */}
            <div
              style={{
                textAlign: 'center',
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
                padding: '4px 0',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 36, height: 1, background: '#E7E7EC' }} />
                {`Conversation started · ${fmtTime(attempt.startedAt)}`}
                <span style={{ display: 'inline-block', width: 36, height: 1, background: '#E7E7EC' }} />
              </span>
            </div>

            {conversation.messages.length === 0 && (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#7A7A86',
                    textAlign: 'center',
                    padding: '32px 24px 16px',
                    gap: 14,
                  }}
                >
                  <div
                    className="play-mobile-coach"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: '#F1F1F4',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#C7C7CE',
                    }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="12" r="0.5" />
                      <circle cx="12" cy="12" r="0.5" />
                      <circle cx="16" cy="12" r="0.5" />
                      <path d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, maxWidth: 280 }}>
                    The lead is waiting. Send the first message to open the conversation.
                  </p>
                </div>
                <div
                  className="play-mobile-coach"
                  style={{
                    marginTop: 12,
                    background: '#EEF2FF',
                    border: '1px solid #E0E7FF',
                    borderRadius: 16,
                    padding: 14,
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      flexShrink: 0,
                      color: '#6366F1',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: '0 0 2px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#4338CA',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Coach Tip
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#312E81', lineHeight: 1.5 }}>
                      Listen first. Open-ended questions earn more rubric points than pitching.
                    </p>
                  </div>
                </div>
              </>
            )}

            {conversation.messages.map((m) => {
              if (m.sender === 'SYSTEM') {
                return (
                  <div
                    key={m.id}
                    style={{
                      textAlign: 'center',
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 10.5,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                      padding: '4px 0',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-block', width: 36, height: 1, background: '#E7E7EC' }} />
                      {m.content}
                      <span style={{ display: 'inline-block', width: 36, height: 1, background: '#E7E7EC' }} />
                    </span>
                  </div>
                );
              }
              const isMe = m.sender === 'SALESPERSON';
              const senderLabel = isMe ? 'You' : personaName;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#9A9AA4',
                      paddingLeft: isMe ? 0 : 14,
                      paddingRight: isMe ? 14 : 0,
                    }}
                  >
                    {senderLabel}
                  </div>
                  <div
                    style={{
                      maxWidth: 520,
                      background: isMe ? '#5B4BF5' : '#FAFAF8',
                      border: isMe ? 'none' : '1px solid #E7E7EC',
                      color: isMe ? '#fff' : '#0B0B0F',
                      padding: '13px 16px',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      boxShadow: isMe ? '0 1px 2px rgba(91,75,245,0.18)' : undefined,
                    }}
                  >
                    {m.content}
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: 10,
                        color: isMe ? 'rgba(255,255,255,0.65)' : '#9A9AA4',
                        marginTop: 6,
                        letterSpacing: '0.04em',
                        textAlign: isMe ? 'right' : 'left',
                      }}
                    >
                      {fmtTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator (lead is responding) */}
            {sending && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                    paddingLeft: 14,
                  }}
                >
                  {personaName}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '14px 18px',
                    background: '#FAFAF8',
                    border: '1px solid #E7E7EC',
                    borderRadius: '14px 14px 14px 4px',
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9A9AA4', animation: 'typing 1.4s 0s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9A9AA4', animation: 'typing 1.4s 0.2s infinite' }} />
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9A9AA4', animation: 'typing 1.4s 0.4s infinite' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 24px',
              fontSize: 12,
              color: '#A93F37',
              background: 'rgba(169,63,55,0.08)',
              borderTop: '1px solid rgba(169,63,55,0.2)',
            }}
          >
            {error}
          </div>
        )}

        {/* Input bar */}
        <footer
          data-play-composer
          style={{
            flexShrink: 0,
            padding: '16px 24px 20px',
            background: '#FFFFFF',
            borderTop: '1px solid #E7E7EC',
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* Mid-attempt coaching nudge — surfaces above the composer when
                the backend detects an antipattern (defer-loop, repetition,
                no-discovery, monologue). Dismissible per turn; auto-clears
                on next send. Slice: 2026-07-28. */}
            {coaching && (
              <div
                data-play-coaching
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  marginBottom: 10,
                  background: 'rgba(91,75,245,0.06)',
                  border: '1px solid rgba(91,75,245,0.25)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#3A2DC4',
                  lineHeight: 1.5,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
                <div style={{ flex: 1 }}>{coaching.tip}</div>
                <button
                  type="button"
                  onClick={() => setCoaching(null)}
                  aria-label="Dismiss coaching tip"
                  style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: 'none',
                    color: '#3A2DC4',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                background: inputFocused ? '#fff' : '#FAFAF8',
                border: `1px solid ${inputFocused ? '#5B4BF5' : '#E7E7EC'}`,
                borderRadius: 14,
                padding: '12px 14px 22px',
                boxShadow: inputFocused ? '0 0 0 3px rgba(91,75,245,0.14)' : undefined,
                transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 14,
                  bottom: 6,
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10.5,
                  letterSpacing: '0.03em',
                  color:
                    input.length >= 500
                      ? '#A93F37'
                      : input.length >= 450
                      ? '#F5A524'
                      : '#9A9AA4',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontWeight: 700 }}>{input.length}</span>
                {' / 500'}
              </span>
              <textarea
                value={input}
                onBeforeInput={(e) => {
                  // Native OS / mobile keyboard dictation fires an InputEvent
                  // with inputType === "insertFromDictation". Count those
                  // chars so the backend can exempt them from the superhuman
                  // typing check.
                  const ne = e.nativeEvent as InputEvent;
                  if (ne.inputType === 'insertFromDictation' && typeof ne.data === 'string') {
                    dictationCharsRef.current += ne.data.length;
                  }
                }}
                onChange={(e) => {
                  // Backend caps content at 500 chars (slice 125) — enforce client
                  // side too so the count + colour states match reality.
                  const next = e.target.value.slice(0, 500);
                  if (firstKeystrokeRef.current === null && next.length > 0) {
                    firstKeystrokeRef.current = Date.now();
                  }
                  setInput(next);
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData('text') ?? '';
                  pasteCountRef.current += 1;
                  pastedCharsRef.current += pasted.length;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={isClosed || sending}
                placeholder={
                  attempt.status === 'IN_PROGRESS'
                    ? 'Type your reply…'
                    : 'Conversation is closed.'
                }
                rows={2}
                maxLength={500}
                style={{
                  flex: 1,
                  resize: 'none',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#0B0B0F',
                  minHeight: 46,
                }}
              />

              {/* Mic button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={isClosed || sending}
                  onMouseEnter={() => setMicHover(true)}
                  onMouseLeave={() => setMicHover(false)}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  title={listening ? 'Stop recording' : 'Speak your reply'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid #E7E7EC',
                    background: listening ? 'rgba(169,63,55,0.10)' : micHover ? '#FAFAF8' : '#fff',
                    color: listening ? '#A93F37' : '#3A3A44',
                    cursor: isClosed || sending ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    animation: listening ? 'pulseDot 1.2s ease-in-out infinite' : undefined,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0" />
                    <line x1="12" x2="12" y1="18" y2="22" />
                    <line x1="8" x2="16" y1="22" y2="22" />
                  </svg>
                </button>
              )}

              {/* Send */}
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => setSendHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  height: 38,
                  padding: '0 16px',
                  border: 'none',
                  borderRadius: 10,
                  background: !canSend ? '#9A9AA4' : sendHover ? '#23232B' : '#0B0B0F',
                  color: '#fff',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: !canSend ? 'not-allowed' : 'pointer',
                  flexShrink: 0,
                  opacity: !canSend ? 0.6 : 1,
                }}
              >
                Send
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>

          </div>
        </footer>
      </div>

      {/* ============ RIGHT RAIL ============ */}
      <aside
        data-r="hide-sm"
        style={{
          overflowY: 'auto',
          background: '#FAFAF8',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          padding: '26px 22px 32px',
        }}
      >
        {/* Closdex brand strip (since no AppShell sidebar) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingBottom: 18,
            borderBottom: '1px solid #E7E7EC',
          }}
        >
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
          <span style={{ flex: 1 }} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 100,
              background: 'rgba(91,75,245,0.08)',
              border: '1px solid rgba(91,75,245,0.18)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B4BF5' }} />
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#3A2DC4',
              }}
            >
              {isClosed ? 'Closed' : 'Live'}
            </span>
          </span>
        </div>

        {/* Goal card */}
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#7A7A86',
              marginBottom: 10,
            }}
          >
            Your goal
          </div>
          <div
            style={{
              background: '#FFFBF2',
              border: '1px solid #F4E4C4',
              borderRadius: 12,
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
              <span
                style={{
                  width: 14,
                  height: 16,
                  background: '#F5A524',
                  display: 'inline-block',
                  clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#8A6A1A',
                  letterSpacing: '-0.01em',
                  textTransform: 'capitalize',
                }}
              >
                {goalLabel}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: '#7A7A86', lineHeight: 1.5 }}>
              {attempt.challenge.goalDescription || 'Be specific — vague commitments don\'t count.'}
            </div>
          </div>
        </div>

        {/* Persona */}
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#7A7A86',
              marginBottom: 12,
            }}
          >
            Persona
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(160deg,#4A3AD9,#2C2256)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {personaInitial}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0B0B0F' }}>{personaName}</div>
              {personaRoleCompany && (
                <div style={{ fontSize: 12, color: '#7A7A86', marginTop: 2, lineHeight: 1.45 }}>
                  {personaRoleCompany}
                </div>
              )}
              <div style={{ fontSize: 12, lineHeight: 1.55, color: '#7A7A86', marginTop: 9 }}>
                {'Personality is hidden — uncover it through the conversation.'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#7A7A86',
              marginBottom: 12,
            }}
          >
            Stats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid #E7E7EC' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 2px',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              <span style={{ fontSize: 12.5, color: '#7A7A86' }}>Messages used</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0B0B0F' }}>
                {messagesUsed}
                {' '}
                <span style={{ color: '#9A9AA4', fontWeight: 400 }}>{`/ ${cap}`}</span>
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 2px',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              <span style={{ fontSize: 12.5, color: '#7A7A86' }}>Attempt</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0B0B0F' }}>
                {`#${attempt.attemptNumber}`}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 2px',
              }}
            >
              <span style={{ fontSize: 12.5, color: '#7A7A86' }}>Started</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: '#0B0B0F' }}>
                {fmtTime(attempt.startedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Coach tip */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #E7E7EC',
            borderRadius: 12,
            padding: '16px 18px',
            display: 'flex',
            gap: 11,
            alignItems: 'flex-start',
            marginTop: 'auto',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'rgba(91,75,245,0.08)',
              color: '#5B4BF5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1M5.6 5.6l.7.7M3 12h1M21 12h-1M18.4 5.6l-.7.7M12 21a4 4 0 0 1-4-4c0-1.5.6-2.7 1.7-3.7C10.7 12.3 11 11.2 11 10a3 3 0 0 1 6 0c0 1.2.3 2.3 1.3 3.3C19.4 14.3 20 15.5 20 17a4 4 0 0 1-4 4Z" />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#3A2DC4',
                marginBottom: 5,
              }}
            >
              Coach tip
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.5, color: '#3A3A44' }}>
              Listen first. Open-ended questions earn more rubric points than pitching.
            </div>
          </div>
        </div>
      </aside>

      {/* Goal-achieved / conversation-closed modal — pops once status transitions
          away from IN_PROGRESS so the salesperson can still scroll back through
          the chat instead of being yanked to the result page. */}
      {closeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11,11,15,0.55)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
          onClick={() => setCloseModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '32px 32px 26px',
              boxShadow: '0 24px 64px rgba(11,11,15,0.32)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto',
                borderRadius: '50%',
                background: attempt.goalAchieved
                  ? 'rgba(31,138,91,0.12)'
                  : 'rgba(154,154,164,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: attempt.goalAchieved ? '#1F8A5B' : '#7A7A86',
              }}
            >
              {attempt.goalAchieved ? (
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: '-0.02em',
                  color: '#0B0B0F',
                }}
              >
                {attempt.goalAchieved ? 'Goal achieved!' : 'Conversation closed'}
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 13.5, color: '#5A5A66', lineHeight: 1.55 }}>
                {attempt.goalAchieved
                  ? 'Nice work. Scroll back through the conversation when you want to review what landed — or head to the result page for the full breakdown.'
                  : 'The conversation has ended. You can still scroll through it before heading to the result page.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  color: '#3A3A44',
                  border: '1px solid #E7E7EC',
                  borderRadius: 10,
                  padding: '11px 16px',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Review conversation
              </button>
              <button
                type="button"
                onClick={() => router.push(`/app/challenges/${attempt.challenge.id}/result?attempt=${attempt.id}`)}
                style={{
                  flex: 1,
                  background: '#0B0B0F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 16px',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
