'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';

type Msg = Awaited<ReturnType<typeof api.admin.moderation.recent>>['items'][number];

const POLL_MS = 6000;

export default function AdminModerationPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [paused, setPaused] = useState(false);
  const latestRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset on filter change so the feed reloads from the top.
    latestRef.current = null;
    setMessages([]);
  }, [suspiciousOnly]);

  useEffect(() => {
    if (paused) return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await api.admin.moderation.recent({
          since: latestRef.current ?? undefined,
          limit: latestRef.current ? 200 : 100,
          suspiciousOnly,
        });
        if (cancelled) return;
        if (res.items.length > 0) {
          latestRef.current = res.items[0].createdAt;
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...res.items.filter((m) => !seen.has(m.id)), ...prev];
            return merged.slice(0, 300);
          });
        }
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Poll failed.');
      }
    }

    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [paused, suspiciousOnly]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Live moderation</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>
            Newest salesperson messages across every attempt. Polls every {POLL_MS / 1000}s.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
            <input type="checkbox" checked={suspiciousOnly} onChange={(e) => setSuspiciousOnly(e.target.checked)} />
            Suspicious only
          </label>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: paused ? 'var(--d-expert)' : 'var(--bg-2)',
              color: paused ? '#fff' : 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(200,50,50,0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <Card style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)' }}>
          {suspiciousOnly ? 'No suspicious messages in the feed yet.' : 'No messages yet. Feed refreshes automatically.'}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((m) => (
            <Card key={m.id} style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 4 }}>
                    <Link href={`/admin/users/${m.user.id}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}>
                      {m.user.name}
                    </Link>
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{m.user.email}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>· {m.challenge.title}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>· {m.challenge.difficulty.toLowerCase()}</span>
                    {m.attempt.quarantined && (
                      <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, background: 'var(--d-expert)', color: '#fff', fontWeight: 700, letterSpacing: '0.05em' }}>
                        QUARANTINED
                      </span>
                    )}
                    {m.pasteCount > 0 && (
                      <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,165,36,0.15)', color: '#8A6A1A', fontWeight: 700 }}>
                        PASTE {m.pasteCount}× / {m.pastedChars}c
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.content}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
