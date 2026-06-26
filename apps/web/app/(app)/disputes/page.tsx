'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, DisputeSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

// My Disputes — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML; data wired to api.disputes.listMine().

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
type StatusFilter = 'ALL' | DisputeStatus;

const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under review',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

// New-design palette — same hues used across the dashboard prototype.
const STATUS_DOT: Record<DisputeStatus, string> = {
  OPEN: '#F5A524',          // amber
  UNDER_REVIEW: '#5B4BF5',  // indigo
  RESOLVED: '#2E8B57',      // emerald
  REJECTED: '#A93F37',      // expert red
};

const STATUS_TEXT: Record<DisputeStatus, string> = {
  OPEN: '#8A5A00',
  UNDER_REVIEW: '#3A2DC2',
  RESOLVED: '#1F6B40',
  REJECTED: '#7A2B25',
};

const STATUS_BG: Record<DisputeStatus, string> = {
  OPEN: '#FBEFD3',
  UNDER_REVIEW: '#E7E3FE',
  RESOLVED: '#DCEEE4',
  REJECTED: '#F3D9D6',
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function snippet(text: string, max = 110) {
  const t = (text ?? '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

function StatusPill({ status }: { status: DisputeStatus }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '4px 10px',
        borderRadius: '999px',
        background: STATUS_BG[status],
        color: STATUS_TEXT[status],
        fontFamily: "'Space Mono',monospace",
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: STATUS_DOT[status],
          display: 'inline-block',
        }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function DisputesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.disputes
      .listMine()
      .then((res) => {
        if (cancelled) return;
        setDisputes(res);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? 'Failed to load disputes.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const counts = useMemo(() => {
    const acc: Record<StatusFilter, number> = {
      ALL: disputes.length,
      OPEN: 0,
      UNDER_REVIEW: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };
    for (const d of disputes) acc[d.status] += 1;
    return acc;
  }, [disputes]);

  const visible = useMemo(
    () => (filter === 'ALL' ? disputes : disputes.filter((d) => d.status === filter)),
    [disputes, filter],
  );

  if (authLoading || !user) return null;

  const goToAttempt = (d: DisputeSummary) =>
    router.push(`/app/challenges/${d.attempt.challenge.id}/result?attempt=${d.attempt.id}`);

  return (
    <div data-resp-page="disputes">
      <div className="r-page" style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        {/* Header */}
        <div style={{ marginBottom: '8px' }}>
          <h1
            className="r-title"
            style={{
              margin: '0',
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: '33px',
              letterSpacing: '-0.03em',
              lineHeight: '1.05',
              color: '#0B0B0F',
            }}
          >
            My Disputes
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: '15px', color: '#7A7A86' }}>
            Disputes you&rsquo;ve raised about AI scoring on completed challenges.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              marginTop: '40px',
              borderTop: '1px solid #E7E7EC',
              padding: '96px 24px',
              textAlign: 'center',
              color: '#9A9AA4',
              fontFamily: "'Space Mono',monospace",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Loading disputes&hellip;
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              marginTop: '40px',
              borderTop: '1px solid #E7E7EC',
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#A93F37',
                marginBottom: '12px',
              }}
            >
              Couldn&rsquo;t load disputes
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: '#7A7A86' }}>{error}</p>
          </div>
        )}

        {/* Empty (no disputes at all) */}
        {!loading && !error && disputes.length === 0 && (
          <div
            style={{
              marginTop: '40px',
              borderTop: '1px solid #E7E7EC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '96px 24px 100px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#F3F3F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '26px',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9A9AA4"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c2 0 4 1.5 6 1.5a6 6 0 0 0 2.4-.5 1 1 0 0 1 1.4.9V14a1 1 0 0 1-.6.9A6 6 0 0 1 14 15.5c-2 0-4-1.5-6-1.5a6 6 0 0 0-4 1.3" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
                marginBottom: '16px',
              }}
            >
              Dispute history
            </div>
            <h2
              style={{
                margin: '0',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize: '26px',
                letterSpacing: '-0.02em',
                color: '#0B0B0F',
              }}
            >
              No disputes yet
            </h2>
            <p
              style={{
                margin: '14px 0 0',
                fontSize: '14.5px',
                lineHeight: '1.6',
                color: '#7A7A86',
                maxWidth: '430px',
              }}
            >
              If you disagree with an AI score, you can raise a dispute from the result page of any
              completed challenge.
            </p>
            <button
              type="button"
              data-disputes-empty-cta
              data-r="btnfull"
              onClick={() => router.push('/attempts')}
              style={{
                marginTop: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0B0B0F',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 18px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v5h5" />
                <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                <path d="M12 7v5l3 2" />
              </svg>
              View my attempts
            </button>
          </div>
        )}

        {/* Populated state */}
        {!loading && !error && disputes.length > 0 && (
          <>
            {/* Filter tabs */}
            <div
              className="r-hscroll"
              data-disputes-filter-tabs
              data-r="scrollx"
              style={{
                marginTop: '34px',
                display: 'flex',
                alignItems: 'center',
                gap: '26px',
                borderBottom: '1px solid #E7E7EC',
                flexWrap: 'wrap',
              }}
            >
              {(
                [
                  ['ALL', 'All'],
                  ['OPEN', STATUS_LABEL.OPEN],
                  ['UNDER_REVIEW', STATUS_LABEL.UNDER_REVIEW],
                  ['RESOLVED', STATUS_LABEL.RESOLVED],
                  ['REJECTED', STATUS_LABEL.REJECTED],
                ] as Array<[StatusFilter, string]>
              ).map(([key, label]) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '10px 2px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: active ? '#0B0B0F' : '#7A7A86',
                      boxShadow: active ? 'inset 0 -2px 0 #0B0B0F' : 'none',
                    }}
                  >
                    {label}
                    <span
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#B6B6C0',
                      }}
                    >
                      {counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ruled table */}
            <div style={{ marginTop: '18px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 110px',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '0 4px 12px',
                  borderBottom: '1px solid #E7E7EC',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                  }}
                >
                  Challenge
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#9A9AA4',
                    textAlign: 'right',
                  }}
                >
                  Raised
                </div>
              </div>

              {/* Filtered-empty state */}
              {visible.length === 0 ? (
                <div
                  style={{
                    padding: '64px 24px',
                    textAlign: 'center',
                    color: '#7A7A86',
                    fontSize: '14px',
                    borderBottom: '1px solid #E7E7EC',
                  }}
                >
                  No {STATUS_LABEL[filter as DisputeStatus]?.toLowerCase() ?? ''} disputes.
                </div>
              ) : (
                visible.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => goToAttempt(d)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 160px 110px',
                      gap: '20px',
                      alignItems: 'center',
                      padding: '17px 4px',
                      borderBottom: '1px solid #E7E7EC',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#E7E7EC',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#0B0B0F',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {d.attempt.challenge.title}
                      </div>
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '13px',
                          color: '#7A7A86',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {snippet(d.reason)}
                      </div>
                    </div>
                    <div>
                      <StatusPill status={d.status} />
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '12px',
                        color: '#7A7A86',
                      }}
                    >
                      {fmtDate(d.createdAt)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
