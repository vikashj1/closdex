'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, DisputeSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const STATUS_META: Record<string, { label: string; color: string }> = {
  OPEN:         { label: 'Open',         color: 'var(--gold)' },
  UNDER_REVIEW: { label: 'Under review', color: 'var(--cool)' },
  RESOLVED:     { label: 'Resolved',     color: 'var(--emerald)' },
  REJECTED:     { label: 'Rejected',     color: 'var(--d-expert)' },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, color: 'var(--text-mute)' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: `color-mix(in oklch, ${meta.color} 18%, transparent)`,
        color: meta.color,
        border: `1px solid color-mix(in oklch, ${meta.color} 35%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function DisputesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.disputes.listMine()
      .then(setDisputes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Disputes</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Disputes you've raised about AI scoring on completed challenges
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-mute)' }}>Loading…</div>
      ) : disputes.length === 0 ? (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏳</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No disputes yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 20 }}>
            If you disagree with an AI score, you can raise a dispute from the result page.
          </div>
          <Btn kind="secondary" size="sm" onClick={() => router.push('/attempts')}>
            View my attempts
          </Btn>
        </Card>
      ) : (
        <Card padding={0}>
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 100px 90px',
              padding: '10px 20px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              borderBottom: '1px solid var(--border-soft)',
            }}
          >
            <div>Challenge</div>
            <div>Status</div>
            <div>Raised</div>
            <div>Action</div>
          </div>

          {disputes.map((d, i) => {
            const isLast = i === disputes.length - 1;
            return (
              <div
                key={d.id}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--border-soft)',
                }}
              >
                {/* Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 100px 90px',
                    padding: '14px 20px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{d.attempt.challenge.title}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-mute)',
                        marginTop: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 420,
                      }}
                    >
                      {d.reason}
                    </div>
                  </div>
                  <div><StatusBadge status={d.status} /></div>
                  <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{fmtDate(d.createdAt)}</div>
                  <div>
                    <Btn
                      kind="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/challenges/${d.attempt.challenge.id}/result?attempt=${d.attempt.id}`)
                      }
                    >
                      View
                    </Btn>
                  </div>
                </div>

                {/* Resolution note if resolved/rejected */}
                {(d.status === 'RESOLVED' || d.status === 'REJECTED') && d.resolution && (
                  <div
                    style={{
                      margin: '0 20px 14px',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: `color-mix(in oklch, ${STATUS_META[d.status].color} 8%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${STATUS_META[d.status].color} 22%, transparent)`,
                      fontSize: 12.5,
                      color: 'var(--text-dim)',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: STATUS_META[d.status].color }}>
                      {d.status === 'RESOLVED' ? 'Resolution' : 'Rejection reason'}:{' '}
                    </span>
                    {d.resolution}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
