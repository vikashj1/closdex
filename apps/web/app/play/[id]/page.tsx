'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputBaseRef = useRef('');

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

  async function send() {
    if (!input.trim() || !attempt || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setError(null);
    try {
      const res = await api.attempts.send(attempt.id, text);
      setAttempt(res.attempt);
      if (res.attempt.status !== 'IN_PROGRESS') {
        router.push(`/challenges/${res.attempt.challenge.id}/result?attempt=${res.attempt.id}`);
      }
    } catch (err) {
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
      router.push(`/challenges/${attempt.challenge.id}/result?attempt=${attempt.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not end the attempt.');
      setEnding(false);
    }
  }

  if (authLoading || !user || loading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading conversation…</div>;
  }
  if (!attempt) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--text-mute)' }}>{error ?? 'Attempt not found.'}</div>
        <Btn kind="ghost" onClick={() => router.push('/challenges')} style={{ marginTop: 14 }}>
          ← Back to challenges
        </Btn>
      </div>
    );
  }

  const { challenge, conversation, messagesUsed } = attempt;
  const persona = challenge.persona;
  const cap = challenge.maxMessages;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-soft)' }}>
        {/* Top bar */}
        <div
          style={{
            padding: '12px 22px',
            borderBottom: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push(`/challenges/${challenge.id}`)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m6 6-6-6 6-6" />
              </svg>
            </button>
            <Avatar name={persona?.name ?? 'Lead'} size={36} color="oklch(0.55 0.14 290)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {persona?.name ?? 'Lead'}
                {persona?.role && (
                  <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}> · {persona.role}</span>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--emerald)' }} /> Online
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Pill label="Goal" value={challenge.goalType.replace(/_/g, ' ')} color="var(--gold)" />
            <Pill
              label="Messages"
              value={`${messagesUsed}/${cap}`}
              color={messagesUsed >= cap * 0.75 ? 'var(--d-hard)' : 'var(--text)'}
            />
            <Pill label="Attempt" value={`#${attempt.attemptNumber}`} />
            <Btn kind="danger" size="sm" onClick={end} disabled={ending}>
              {ending ? 'Ending…' : 'End conversation'}
            </Btn>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 80px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'var(--bg)',
          }}
        >
          {conversation.messages.length === 0 && (
            <div style={{ color: 'var(--text-mute)', textAlign: 'center', padding: 40, fontSize: 13 }}>
              The lead is waiting. Send the first message to open the conversation.
            </div>
          )}
          {conversation.messages.map((m) => (
            <ChatBubble key={m.id} sender={m.sender} content={m.content} time={fmtTime(m.createdAt)} />
          ))}
          {sending && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 14px',
                background: 'var(--surface)',
                borderRadius: '14px 14px 14px 4px',
                width: 'fit-content',
                border: '1px solid var(--border-soft)',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--text-mute)', animation: `typing 1.4s ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: '8px 22px',
              fontSize: 12,
              color: 'var(--d-expert)',
              background: 'color-mix(in oklch, var(--d-expert) 10%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 22px 22px', background: 'var(--bg-2)' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-end',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={attempt.status !== 'IN_PROGRESS' || sending}
              placeholder={
                attempt.status === 'IN_PROGRESS'
                  ? 'Type your reply… (Enter to send · Shift+Enter for newline)'
                  : 'Conversation is closed.'
              }
              rows={2}
              style={{ flex: 1, resize: 'none', fontSize: 14, color: 'var(--text)' }}
            />
            {speechSupported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={attempt.status !== 'IN_PROGRESS' || sending}
                title={listening ? 'Stop recording' : 'Speak your reply'}
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  background: listening
                    ? 'color-mix(in oklch, var(--d-expert) 22%, transparent)'
                    : 'var(--bg-2)',
                  color: listening ? 'var(--d-expert)' : 'var(--text-dim)',
                  cursor: attempt.status !== 'IN_PROGRESS' || sending ? 'not-allowed' : 'pointer',
                  animation: listening ? 'pulseDot 1.2s ease-in-out infinite' : undefined,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </button>
            )}
            <Btn
              kind="primary"
              icon={<Icon.send />}
              onClick={send}
              disabled={attempt.status !== 'IN_PROGRESS' || sending || !input.trim()}
            >
              Send
            </Btn>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-mute)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{input.length} chars</span>
            <span>↩ to send · ⇧↩ for new line</span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={SIDE_LBL}>Your goal</div>
          <Card
            padding={14}
            style={{ background: 'color-mix(in oklch, var(--gold) 10%, transparent)', borderColor: 'color-mix(in oklch, var(--gold) 25%, transparent)' }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>
              {challenge.goalType.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
              Be specific. Vague commitments don&apos;t count.
            </div>
          </Card>
        </div>

        <div>
          <div style={SIDE_LBL}>Persona</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text)' }}>{persona?.name ?? 'Lead'}</strong>
            {persona?.role && <> · {persona.role}</>}
            {persona?.company && <> · {persona.company}</>}.
            Personality is hidden — uncover it through the conversation.
          </div>
        </div>

        <div>
          <div style={SIDE_LBL}>Stats</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
            Messages used: <strong style={{ color: 'var(--text)' }}>{messagesUsed}</strong> / {cap}<br />
            Attempt: <strong style={{ color: 'var(--text)' }}>#{attempt.attemptNumber}</strong><br />
            Started: <span className="mono">{fmtTime(attempt.startedAt)}</span>
          </div>
        </div>

        <Card padding={12} style={{ background: 'var(--bg-2)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--gold)' }}>Tip:</strong> Listen first. Open-ended questions earn
            more rubric points than pitching.
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 9.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function ChatBubble({ sender, content, time }: { sender: string; content: string; time: string }) {
  const isMe = sender === 'SALESPERSON';
  const isSystem = sender === 'SYSTEM';
  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-mute)', fontSize: 11.5, padding: '8px 0' }}>
        {content}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.25s ease' }}>
      <div
        style={{
          maxWidth: '62%',
          background: isMe ? 'var(--gold)' : 'var(--surface)',
          color: isMe ? 'oklch(0.18 0.02 75)' : 'var(--text)',
          padding: '10px 14px',
          borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          border: isMe ? 'none' : '1px solid var(--border-soft)',
          fontSize: 13.5,
          lineHeight: 1.45,
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
        <div style={{ fontSize: 10, color: isMe ? 'oklch(0.18 0.02 75 / 0.6)' : 'var(--text-mute)', marginTop: 4, textAlign: 'right' }}>
          {time}
        </div>
      </div>
    </div>
  );
}

const SIDE_LBL: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 8,
  fontWeight: 600,
};
