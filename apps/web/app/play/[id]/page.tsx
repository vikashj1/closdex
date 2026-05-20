'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';

/** Immersive conversation screen — deliberately lives outside the (app) route
 *  group so the AppShell sidebar doesn't intrude. The route is /play/[id]; the
 *  detail page links here. Scripted lead replies for now — wired to the AI lead
 *  service in slice 8. */
const SCRIPTED_LEAD = [
  "I've got 5 minutes. What's this about — and please don't pitch me a 'platform'.",
  "Datadog's already eating my budget. Why are you different in a way that isn't marketing slop?",
  'Fair. What does onboarding look like? My SREs spent 3 weeks fighting our last tool.',
  "Send me a one-pager. I'll look when I look.",
  '...okay, Thursday 4pm IST. 20 minutes. Don’t waste it.',
];

interface ChatMessage {
  from: 'lead' | 'me';
  text: string;
  time: string;
}

function fmtClock(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtMin(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'lead', text: 'Hi — got your note. Caught me on the way to a board call.', time: '10:02' },
  ]);
  const [input, setInput] = useState('');
  const [leadIdx, setLeadIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [time, setTime] = useState(540);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: 'me', text: input, time: fmtClock() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = SCRIPTED_LEAD[leadIdx] || "I'll review and revert. Got to go.";
      setMessages((m) => [...m, { from: 'lead', text: reply, time: fmtClock() }]);
      setLeadIdx((i) => i + 1);
      setTyping(false);
      if (leadIdx >= SCRIPTED_LEAD.length - 1) {
        setTimeout(() => router.push(`/challenges/${params.id}/result`), 1200);
      }
    }, 1400);
  };

  const userMsgCount = messages.filter((m) => m.from === 'me').length;

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
              onClick={() => router.push(`/challenges/${params.id}`)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m6 6-6-6 6-6" />
              </svg>
            </button>
            <Avatar name="Meera Krishnan" size={36} color="oklch(0.55 0.14 290)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Meera Krishnan <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>· CTO, Vector Pay</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--emerald)' }} /> Online
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <Pill label="Goal" value="Book Discovery Call" color="var(--gold)" />
            <Pill label="Messages" value={`${userMsgCount}/25`} color={userMsgCount > 18 ? 'var(--d-hard)' : 'var(--text)'} />
            <Pill label="Time" value={fmtMin(time)} color={time < 60 ? 'var(--d-expert)' : 'var(--text)'} mono />
            <Btn kind="danger" size="sm" onClick={() => router.push(`/challenges/${params.id}/result`)}>End conversation</Btn>
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
          {messages.map((m, i) => (
            <ChatBubble key={i} m={m} />
          ))}
          {typing && (
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

        {/* Action toolbar */}
        <div style={{ padding: '10px 22px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)', display: 'flex', gap: 8 }}>
          {[
            { icon: '📅', label: 'Calendar link' },
            { icon: '📎', label: 'Share doc' },
            { icon: '💰', label: 'Pricing' },
            { icon: '💡', label: 'Hint', note: '−10 pts' },
          ].map((a) => (
            <button
              key={a.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 7,
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <span>{a.icon}</span>
              {a.label}
              {a.note && <span style={{ fontSize: 9.5, color: 'var(--d-expert)', marginLeft: 4 }}>{a.note}</span>}
            </button>
          ))}
        </div>

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
              placeholder="Type your reply… (Enter to send · Shift+Enter for newline)"
              rows={2}
              style={{ flex: 1, resize: 'none', fontSize: 14, color: 'var(--text)' }}
            />
            <Btn kind="primary" icon={<Icon.send />} onClick={send}>Send</Btn>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-mute)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{input.length} chars · auto-saved</span>
            <span>↩ to send · use ⇧↩ for new line</span>
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
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>Book a 30-min discovery call</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>
              Specific time slot. Vague &quot;let me think&quot; doesn&apos;t count.
            </div>
          </Card>
        </div>

        <div>
          <div style={SIDE_LBL}>Lead refresher</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
            CTO at <strong style={{ color: 'var(--text)' }}>Vector Pay</strong>, 180 engineers, Series B fintech. Last tool flooded alerts; SOC2 audit in 8 weeks. Comparison-shops vs Datadog.
          </div>
        </div>

        <div>
          <div style={SIDE_LBL}>Live rubric tracking</div>
          {[
            { l: 'Discovery', v: 3 },
            { l: 'Objection handling', v: 2 },
            { l: 'Value articulation', v: 3 },
            { l: 'Conversational quality', v: 4 },
            { l: 'Goal execution', v: 1 },
          ].map((d) => (
            <div key={d.l} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>{d.l}</span>
                <span className="mono" style={{ color: 'var(--text-mute)' }}>{d.v}/5</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{ flex: 1, height: 5, borderRadius: 4, background: n <= d.v ? 'var(--gold)' : 'var(--surface-2)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card padding={12} style={{ background: 'var(--bg-2)' }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--gold)' }}>💡 Tip:</strong> Meera responds to specific, data-backed claims. Avoid the word &quot;revolutionary&quot;.
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Pill({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 9.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const isMe = m.from === 'me';
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
        }}
      >
        {m.text}
        <div style={{ fontSize: 10, color: isMe ? 'oklch(0.18 0.02 75 / 0.6)' : 'var(--text-mute)', marginTop: 4, textAlign: 'right' }}>
          {m.time}
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
