'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, AttemptDetail, api } from '@/lib/api';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputBaseRef = useRef('');
  // Anti-cheat telemetry — reset each time a message ships.
  const firstKeystrokeRef = useRef<number | null>(null);
  const pasteCountRef = useRef(0);
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
      for (let i = 0; i < e.results.length; i++) {
        const txt = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTxt += txt;
        else interimTxt += txt;
      }
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
      if (res.attempt.status !== 'IN_PROGRESS') {
        router.push(`/app/challenges/${res.attempt.challenge.id}/result?attempt=${res.attempt.id}`);
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
          new messages arrive. */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #E7E7EC', minWidth: 0, minHeight: 0, height: '100vh' }}>
        {/* Top bar */}
        <header
          style={{
            height: 64,
            flexShrink: 0,
            borderBottom: '1px solid #E7E7EC',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 24px',
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
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: 38, flexShrink: 0 }}>
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

        {/* Messages scroll area */}
        <div
          ref={scrollRef}
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
              <div style={{ color: '#7A7A86', textAlign: 'center', padding: 40, fontSize: 13 }}>
                The lead is waiting. Send the first message to open the conversation.
              </div>
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
          style={{
            flexShrink: 0,
            padding: '16px 24px 20px',
            background: '#FFFFFF',
            borderTop: '1px solid #E7E7EC',
          }}
        >
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                background: inputFocused ? '#fff' : '#FAFAF8',
                border: `1px solid ${inputFocused ? '#5B4BF5' : '#E7E7EC'}`,
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: inputFocused ? '0 0 0 3px rgba(91,75,245,0.14)' : undefined,
                transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
              }}
            >
              <textarea
                value={input}
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
                    ? 'Type your reply… (Enter to send · Shift+Enter for newline)'
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

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 9,
                fontFamily: "'Space Mono',monospace",
                fontSize: 10.5,
                color: '#9A9AA4',
                letterSpacing: '0.03em',
              }}
            >
              <span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      input.length >= 500
                        ? '#A93F37'
                        : input.length >= 450
                        ? '#F5A524'
                        : '#3A3A44',
                  }}
                >
                  {input.length}
                </span>
                {' / 500'}
              </span>
              <span>↩ Send  ·  ⇧↩ New line</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ============ RIGHT RAIL ============ */}
      <aside
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
    </div>
  );
}
