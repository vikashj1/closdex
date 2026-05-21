'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, ApiError, VerificationCompany } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING_REVIEW: { bg: 'color-mix(in oklch, var(--gold) 18%, transparent)', color: 'var(--gold)' },
  VERIFIED:       { bg: 'color-mix(in oklch, var(--emerald) 18%, transparent)', color: 'var(--emerald)' },
  REJECTED:       { bg: 'color-mix(in oklch, var(--d-expert) 18%, transparent)', color: 'var(--d-expert)' },
};

function VerificationBadge({ status }: { status: string }) {
  const colors = BADGE_COLORS[status] ?? { bg: 'var(--surface-2)', color: 'var(--text-mute)' };
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 4,
        background: colors.bg,
        color: colors.color,
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

export default function VerificationPage() {
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [pending, setPending] = useState<VerificationCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);

    api.admin.verification
      .listPending()
      .then((items) => {
        if (!cancelled) setPending(items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  async function handleApprove(company: VerificationCompany) {
    setActioning(company.id);
    try {
      await api.admin.verification.approve(company.id, notes[company.id]);
      setPending((prev) => prev.filter((c) => c.id !== company.id));
    } catch {
      // silently ignore
    } finally {
      setActioning(null);
    }
  }

  async function handleReject(company: VerificationCompany) {
    setActioning(company.id);
    try {
      await api.admin.verification.reject(company.id, notes[company.id]);
      setPending((prev) => prev.filter((c) => c.id !== company.id));
    } catch {
      // silently ignore
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Company Verification
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
            {pending.length}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-mute)' }}>
          Companies waiting for manual review before going live on the platform.
        </p>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
          Loading…
        </div>
      ) : pending.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-mute)', fontSize: 13.5 }}>
            No pending verifications. All caught up.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map((company) => (
            <Card key={company.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: company info */}
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-mute)',
                      marginBottom: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {company.industry && <span>{company.industry}</span>}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--cool)', textDecoration: 'none' }}
                      >
                        {company.website}
                      </a>
                    )}
                  </div>
                  <VerificationBadge status={company.verification} />
                </div>

                {/* Middle: notes textarea */}
                <div style={{ flex: '2 1 220px' }}>
                  <textarea
                    rows={2}
                    placeholder="Add approval/rejection notes…"
                    value={notes[company.id] ?? ''}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [company.id]: e.target.value }))
                    }
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 13,
                      color: 'var(--text)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Right: action buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  <Btn
                    kind="success"
                    size="sm"
                    disabled={actioning === company.id}
                    onClick={() => handleApprove(company)}
                  >
                    Approve
                  </Btn>
                  <Btn
                    kind="ghost"
                    size="sm"
                    disabled={actioning === company.id}
                    style={{ color: 'var(--d-expert)', borderColor: 'var(--d-expert)' }}
                    onClick={() => handleReject(company)}
                  >
                    Reject
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
