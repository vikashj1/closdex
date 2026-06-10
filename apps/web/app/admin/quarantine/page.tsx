'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, QuarantineDetail, QuarantineItem } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function FlagPill({ label, value, fired }: { label: string; value: string; fired: boolean }) {
  const color = fired ? 'var(--d-expert)' : 'var(--text-mute)';
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        background: `color-mix(in oklch, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
        color,
      }}
    >
      <span>{label}</span>
      <span className="mono" style={{ opacity: 0.85 }}>{value}</span>
    </div>
  );
}

export default function QuarantinePage() {
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [items, setItems] = useState<QuarantineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<QuarantineDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState<null | 'clear' | 'confirm'>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    api.admin.quarantine
      .list({ page, perPage: 20 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, page, reload]);

  async function openDetail(item: QuarantineItem) {
    setDetail(null);
    setReason('');
    setDetailLoading(true);
    try {
      const d = await api.admin.quarantine.get(item.id);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetail(null);
    setReason('');
  }

  async function handleClear() {
    if (!detail) return;
    setActing('clear');
    try {
      await api.admin.quarantine.clear(detail.id, reason || undefined);
      closeDetail();
      setReload((n) => n + 1);
    } finally {
      setActing(null);
    }
  }

  async function handleConfirm() {
    if (!detail) return;
    setActing('confirm');
    try {
      await api.admin.quarantine.confirm(detail.id, reason || undefined);
      closeDetail();
      setReload((n) => n + 1);
    } finally {
      setActing(null);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Quarantine review</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Attempts the anti-cheat heuristics flagged. Points and leaderboard updates are held until you act.
        </p>
      </header>

      <Card padding={0}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 130px 110px 110px 110px',
            padding: '12px 18px',
            fontSize: 11,
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <div>Salesperson · Challenge</div>
          <div>Score</div>
          <div>Suspicion</div>
          <div>Completed</div>
          <div></div>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13.5 }}>
            Quarantine queue is empty. No flagged attempts right now.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 110px 110px 110px',
                padding: '14px 18px',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-soft)',
                fontSize: 13,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{it.salesperson.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                  {it.salesperson.email} · {it.challenge.title}
                </div>
              </div>
              <div className="mono" style={{ fontWeight: 700 }}>{it.finalScore ?? '—'}</div>
              <div className="mono" style={{ color: 'var(--d-expert)', fontWeight: 700 }}>
                {it.suspicionScore ?? '—'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{timeAgo(it.completedAt)}</div>
              <div>
                <Btn kind="ghost" size="sm" onClick={() => openDetail(it)}>Review</Btn>
              </div>
            </div>
          ))
        )}
      </Card>

      {total > 20 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Btn kind="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </Btn>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Btn kind="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total}>
            Next
          </Btn>
        </div>
      )}

      {(detail || detailLoading) && (
        <>
          <div
            onClick={closeDetail}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 100,
              animation: 'fadeUp 0.18s ease both',
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(560px, 92vw)',
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border-soft)',
              zIndex: 101,
              padding: '22px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              overflowY: 'auto',
              boxShadow: '-12px 0 32px rgba(30,22,10,0.18)',
              animation: 'fadeInUp 0.22s ease both',
            }}
          >
            {detailLoading ? (
              <div style={{ color: 'var(--text-mute)' }}>Loading attempt…</div>
            ) : detail ? (
              <>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{detail.salesperson.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>
                      {detail.salesperson.email} · {detail.salesperson.rank}
                    </div>
                  </div>
                  <button onClick={closeDetail} style={{ background: 'transparent', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 18 }}>
                    ✕
                  </button>
                </header>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <FlagPill
                    label="Suspicion"
                    value={`${detail.suspicionScore ?? '—'}/100`}
                    fired
                  />
                  <FlagPill
                    label="Final"
                    value={`${detail.finalScore ?? 0}`}
                    fired={false}
                  />
                </div>

                {detail.suspicionFlags && (
                  <Card padding={14}>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
                      Flags
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <FlagPill
                        label="Paste ratio"
                        value={`${Math.round(detail.suspicionFlags.pasteRatio * 100)}%`}
                        fired={detail.suspicionFlags.pasteRatio > 0.5}
                      />
                      <FlagPill
                        label="Instant typing"
                        value={detail.suspicionFlags.instantTyping ? 'yes' : 'no'}
                        fired={detail.suspicionFlags.instantTyping}
                      />
                      <FlagPill
                        label="Superhuman speed"
                        value={detail.suspicionFlags.superhumanSpeed ? 'yes' : 'no'}
                        fired={detail.suspicionFlags.superhumanSpeed}
                      />
                      <FlagPill
                        label="Paste burst"
                        value={detail.suspicionFlags.pasteBurst ? 'yes' : 'no'}
                        fired={detail.suspicionFlags.pasteBurst}
                      />
                      <FlagPill
                        label="AI content"
                        value={`${Math.round(detail.suspicionFlags.aiContentLikeness * 100)}%`}
                        fired={detail.suspicionFlags.aiContentLikeness > 0.4}
                      />
                    </div>
                  </Card>
                )}

                <Card padding={14}>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
                    Conversation
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                    {detail.messages.map((m) => (
                      <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ fontSize: 10.5, color: 'var(--text-mute)', fontWeight: 700 }}>
                          {m.sender}
                          {m.clientMeta && (
                            <span style={{ marginLeft: 8, fontWeight: 500, opacity: 0.75 }}>
                              paste {m.clientMeta.pasteCount ?? 0} · pasted {m.clientMeta.pastedChars ?? 0}c · typed {m.clientMeta.totalTypingMs ?? 0}ms
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, padding: '6px 10px', borderRadius: 8, background: m.sender === 'SALESPERSON' ? 'color-mix(in oklch, var(--gold) 8%, transparent)' : 'var(--bg-2)' }}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11.5, color: 'var(--text-mute)', fontWeight: 600 }}>Note (optional, attached to audit log)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. paste ratio = 100%, confirmed cheat"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      fontSize: 13,
                      color: 'var(--text)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Btn
                    kind="success"
                    size="md"
                    onClick={handleClear}
                    disabled={acting !== null}
                  >
                    {acting === 'clear' ? 'Clearing…' : 'Clear quarantine — apply points'}
                  </Btn>
                  <Btn
                    kind="danger"
                    size="md"
                    onClick={handleConfirm}
                    disabled={acting !== null}
                  >
                    {acting === 'confirm' ? 'Saving…' : 'Confirm cheat'}
                  </Btn>
                </div>
              </>
            ) : null}
          </aside>
        </>
      )}
    </div>
  );
}
