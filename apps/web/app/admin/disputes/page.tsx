'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, DisputeSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

type StatusFilter = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | '';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'var(--gold)',
  UNDER_REVIEW: 'var(--cool)',
  RESOLVED: 'var(--emerald)',
  REJECTED: 'var(--d-expert)',
};

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Under review', value: 'UNDER_REVIEW' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: `color-mix(in oklch, ${STATUS_COLORS[status] ?? 'var(--text-mute)'} 18%, transparent)`,
        color: STATUS_COLORS[status] ?? 'var(--text-mute)',
        border: `1px solid color-mix(in oklch, ${STATUS_COLORS[status] ?? 'var(--text-mute)'} 35%, transparent)`,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function DisputesPage() {
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [items, setItems] = useState<DisputeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<DisputeSummary | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);

    api.admin.disputes
      .list({ status: statusFilter || undefined, page, perPage: 20 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, page, statusFilter]);

  function handleFilterChange(val: StatusFilter) {
    setStatusFilter(val);
    setPage(1);
  }

  function openPanel(item: DisputeSummary) {
    setSelected(item);
    setResolution('');
  }

  function closePanel() {
    setSelected(null);
    setResolution('');
  }

  async function handleResolve(status: 'RESOLVED' | 'REJECTED') {
    if (!selected) return;
    setResolving(true);
    try {
      const updated = await api.admin.disputes.resolve(selected.id, resolution, status);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      closePanel();
    } catch {
      // silently ignore for now
    } finally {
      setResolving(false);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Disputes
        </h1>
        <span
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            padding: '2px 10px',
            color: 'var(--text-dim)',
          }}
        >
          {total}
        </span>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--gold)' : 'var(--border-soft)'}`,
                background: active
                  ? 'color-mix(in oklch, var(--gold) 15%, transparent)'
                  : 'var(--surface)',
                color: active ? 'var(--gold)' : 'var(--text-dim)',
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            Loading disputes…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            No disputes found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['Status', 'Salesperson', 'Challenge', 'Reason', 'Created', 'Actions'].map(
                    (col) => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 11.5,
                          color: 'var(--text-mute)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border-soft)' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                      {item.salesperson.user.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>
                      {item.attempt.challenge.title}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: 'var(--text-dim)',
                        maxWidth: 260,
                      }}
                    >
                      {item.reason.length > 80
                        ? item.reason.slice(0, 80) + '…'
                        : item.reason}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: 'var(--text-mute)',
                        whiteSpace: 'nowrap',
                        fontSize: 12,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Btn size="sm" kind="ghost" onClick={() => openPanel(item)}>
                        Review
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Btn
            size="sm"
            kind="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </Btn>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Btn
            size="sm"
            kind="ghost"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Btn>
        </div>
      )}

      {/* Resolve drawer */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            onClick={closePanel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 49,
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100vh',
              width: 420,
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border-soft)',
              padding: 24,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              overflowY: 'auto',
            }}
          >
            {/* Close button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Review Dispute</h2>
              <button
                onClick={closePanel}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-mute)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Salesperson + challenge */}
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                {selected.salesperson.user.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                {selected.attempt.challenge.title}
              </div>
            </div>

            {/* Full reason */}
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Reason
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
              >
                {selected.reason}
              </div>
            </div>

            {/* Current status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Current status:</span>
              <StatusBadge status={selected.status} />
            </div>

            {/* Resolution notes textarea */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 8,
                }}
              >
                Resolution notes
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={5}
                placeholder="Write your resolution notes here…"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  outline: 'none',
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn
                kind="success"
                full
                disabled={resolving}
                onClick={() => handleResolve('RESOLVED')}
              >
                Resolve ✓
              </Btn>
              <Btn
                kind="danger"
                full
                disabled={resolving}
                onClick={() => handleResolve('REJECTED')}
              >
                Reject ✗
              </Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
