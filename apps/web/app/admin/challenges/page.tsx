'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { api, ChallengeSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { difficultyFromEnum } from '@/lib/constants';

type StatusFilter = '' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'var(--gold)',
  PUBLISHED: 'var(--emerald)',
  ARCHIVED:  'var(--text-mute)',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'var(--text-mute)';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: `color-mix(in oklch, ${color} 18%, transparent)`,
        color,
        border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
      }}
    >
      {status}
    </span>
  );
}

const COL_HEADERS = [
  'Title', 'Category', 'Difficulty', 'Goal type', 'Points', 'Messages', 'Status', 'Actions',
];

export default function AdminChallengesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [items, setItems] = useState<ChallengeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);

    api.admin.challenges
      .list({ status: statusFilter || undefined, page })
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

  async function handlePublish(id: string) {
    setActing(id);
    try {
      const updated = await api.admin.challenges.publish(id);
      setItems((prev) => prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c)));
    } catch {
      // silently ignore
    } finally {
      setActing(null);
    }
  }

  async function handleArchive(id: string) {
    setActing(id);
    try {
      const updated = await api.admin.challenges.archive(id);
      setItems((prev) => prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c)));
    } catch {
      // silently ignore
    } finally {
      setActing(null);
    }
  }

  const perPage = 50;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Challenges
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
        <div style={{ marginLeft: 'auto' }}>
          <Btn kind="primary" size="sm" onClick={() => router.push('/admin/challenges/new')}>
            New challenge →
          </Btn>
        </div>
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
            Loading challenges…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            No challenges found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {COL_HEADERS.map((col) => (
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
                {items.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>

                    {/* Title */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, maxWidth: 220 }}>
                      <span
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={c.title}
                      >
                        {c.title}
                      </span>
                      {c.persona.name && (
                        <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 400 }}>
                          {c.persona.name}
                          {c.persona.company ? ` · ${c.persona.company}` : ''}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {c.category}
                    </td>

                    {/* Difficulty */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <DifficultyTag level={difficultyFromEnum(c.difficulty)} size="sm" />
                    </td>

                    {/* Goal type */}
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {c.goalType}
                    </td>

                    {/* Points */}
                    <td
                      style={{
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--gold)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.basePoints}
                    </td>

                    {/* Messages */}
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {c.maxMessages}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Btn
                          size="sm"
                          kind="ghost"
                          onClick={() => router.push(`/admin/challenges/${c.id}/edit`)}
                        >
                          Edit
                        </Btn>

                        {c.status === 'DRAFT' && (
                          <Btn
                            size="sm"
                            kind="ghost"
                            disabled={acting === c.id}
                            style={{ color: 'var(--cool)', borderColor: 'var(--cool)' }}
                            onClick={() => handlePublish(c.id)}
                          >
                            Publish
                          </Btn>
                        )}

                        {c.status === 'PUBLISHED' && (
                          <Btn
                            size="sm"
                            kind="ghost"
                            disabled={acting === c.id}
                            style={{ color: 'var(--text-mute)', borderColor: 'var(--border-soft)' }}
                            onClick={() => handleArchive(c.id)}
                          >
                            Archive
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
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
