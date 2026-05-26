'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, JobSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

interface ApplicationRow { id: string; status: string; job: JobSummary; createdAt: string }

type StatusFilter = '' | 'APPLIED' | 'VIEWED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';

const STATUS_COLORS: Record<string, string> = {
  APPLIED:    'var(--text-dim)',
  VIEWED:     'var(--text-dim)',
  SHORTLISTED:'var(--cool)',
  INTERVIEW:  'var(--gold)',
  OFFERED:    'var(--emerald)',
  HIRED:      'var(--emerald)',
  REJECTED:   'var(--text-mute)',
};

const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: '' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Offered', value: 'OFFERED' },
  { label: 'Hired', value: 'HIRED' },
  { label: 'Rejected', value: 'REJECTED' },
];

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'var(--text-dim)';
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

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [items, setItems] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  useEffect(() => {
    if (!user) return;
    api.applications.mine()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const displayed = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((a) => a.status === statusFilter);
  }, [items, statusFilter]);

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          My Applications
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
          {items.length}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <Btn kind="primary" size="sm" onClick={() => router.push('/jobs')}>Browse jobs →</Btn>
        </div>
      </div>

      {/* Status filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_TABS.map((t) => {
          const active = statusFilter === t.value;
          const count = t.value ? items.filter((a) => a.status === t.value).length : items.length;
          return (
            <button
              key={t.value}
              onClick={() => setStatusFilter(t.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--cool)' : 'var(--border-soft)'}`,
                background: active
                  ? 'color-mix(in oklch, var(--cool) 15%, transparent)'
                  : 'var(--surface)',
                color: active ? 'var(--cool)' : 'var(--text-dim)',
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {t.label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Loading…</div>
      ) : displayed.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
          {statusFilter
            ? `No applications with status "${statusFilter}".`
            : (
              <>
                No applications yet.{' '}
                <a
                  style={{ color: 'var(--cool)', cursor: 'pointer' }}
                  onClick={() => router.push('/jobs')}
                >
                  Browse open jobs →
                </a>
              </>
            )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map((a) => {
            const j = a.job;
            const initials = j.company.name
              .split(/\s+/)
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const appliedDate = new Date(a.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });
            return (
              <Card key={a.id} padding={18}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'var(--bg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'var(--text)',
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{j.title}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                      <strong style={{ color: 'var(--text)' }}>{j.company.name}</strong>
                      {j.location && <span> · {j.location}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 3 }}>
                      Applied {appliedDate}
                    </div>
                  </div>
                  <Btn kind="ghost" size="sm" onClick={() => router.push(`/jobs/${j.id}`)}>
                    View job →
                  </Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
