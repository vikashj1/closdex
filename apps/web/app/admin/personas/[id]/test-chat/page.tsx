'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, ApiError } from '@/lib/api';

interface Turn { sender: 'SALESPERSON' | 'LEAD'; content: string }
interface PersonaLite {
  id: string;
  name: string;
  role: string;
  company: string;
  contextSnippet: string;
}

export default function PersonaTestChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [persona, setPersona] = useState<PersonaLite | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const p = await api.admin.personas.get(id);
        setPersona(p);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load persona.');
      }
    })();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const nextHistory: Turn[] = [...history, { sender: 'SALESPERSON', content: text }];
    setHistory(nextHistory);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const res = await api.admin.personas.testChat(id, history, text);
      setHistory([...nextHistory, { sender: 'LEAD', content: res.reply }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Send failed.');
      setHistory(history); // rollback the salesperson turn
    } finally {
      setSending(false);
    }
  }

  function reset() {
    if (history.length === 0) return;
    if (!window.confirm('Reset conversation? This clears the test chat.')) return;
    setHistory([]);
    setError(null);
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <div style={{ marginBottom: 12 }}>
        <Link href="/admin/personas" style={{ color: 'var(--text-mute)', fontSize: 12.5, textDecoration: 'none' }}>
          ← All personas
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Test chat: {persona?.name ?? 'Loading…'}
        </h1>
        <Btn kind="ghost" size="sm" onClick={reset} disabled={history.length === 0}>Reset</Btn>
      </div>
      {persona && (
        <div style={{ marginBottom: 20, fontSize: 12.5, color: 'var(--text-mute)' }}>
          {persona.role} at {persona.company} · {persona.contextSnippet}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div
          ref={scrollRef}
          style={{
            height: 460,
            overflowY: 'auto',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'var(--bg)',
          }}
        >
          {history.length === 0 && !sending && (
            <div style={{ margin: 'auto', color: 'var(--text-mute)', fontSize: 13 }}>
              Send a message to start. This chat is not persisted — no attempt, no scoring.
            </div>
          )}
          {history.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.sender === 'SALESPERSON' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                padding: '9px 13px',
                borderRadius: 12,
                background: m.sender === 'SALESPERSON' ? '#5B4BF5' : 'var(--bg-2)',
                color: m.sender === 'SALESPERSON' ? '#fff' : 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div style={{ alignSelf: 'flex-start', padding: '9px 13px', color: 'var(--text-mute)', fontSize: 12.5 }}>
              {persona?.name ?? 'Persona'} is typing…
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-soft)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={`Message ${persona?.name ?? '…'}`}
            disabled={sending || !persona}
            style={{
              flex: 1,
              resize: 'none',
              minHeight: 40,
              maxHeight: 140,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13.5,
              fontFamily: 'inherit',
            }}
            rows={2}
          />
          <Btn onClick={send} disabled={sending || !input.trim() || !persona}>
            {sending ? 'Sending…' : 'Send'}
          </Btn>
        </div>
      </Card>

      {error && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(200,50,50,0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
          {error}
        </div>
      )}
    </div>
  );
}
