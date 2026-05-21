'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, AuditLogEntry } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

export default function AuditLogPage() {
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);

    api.admin.audit
      .list({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        page,
        perPage: 30,
      })
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
  }, [user, page, entityFilter, actionFilter]);

  function handleEntityChange(val: string) {
    setEntityFilter(val);
    setPage(1);
  }

  function handleActionChange(val: string) {
    setActionFilter(val);
    setPage(1);
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  const totalPages = Math.ceil(total / 30);

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Audit Log
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Entity type
          </label>
          <input
            type="text"
            value={entityFilter}
            onChange={(e) => handleEntityChange(e.target.value)}
            placeholder="e.g. challenge, user"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--text)',
              outline: 'none',
              width: 200,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Action
          </label>
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => handleActionChange(e.target.value)}
            placeholder="e.g. create, update"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 13,
              color: 'var(--text)',
              outline: 'none',
              width: 200,
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            Loading audit log…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            No entries found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['Time', 'Actor', 'Action', 'Entity', 'Entity ID'].map((col) => (
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      background: idx % 2 === 0 ? 'transparent' : 'var(--bg-2)',
                    }}
                  >
                    <td
                      style={{
                        padding: '11px 16px',
                        color: 'var(--text-mute)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{entry.actor.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                        {entry.actor.email}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border-soft)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: 'var(--text-dim)', fontWeight: 500 }}>
                      {entry.entity}
                    </td>
                    <td
                      style={{
                        padding: '11px 16px',
                        color: 'var(--text-mute)',
                        fontSize: 11.5,
                        fontFamily: 'monospace',
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.entityId ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {total > 30 && (
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
            Page {page} of {totalPages}
          </span>
          <Btn
            size="sm"
            kind="ghost"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Btn>
        </div>
      )}
    </div>
  );
}
