'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, JobSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

// Applications — Vikash dashboard redesign 2026-06-16, wired 2026-06-18.
// Visual port of the new HTML, now backed by api.applications.mine().

interface ApplicationRow {
  id: string;
  status: string;
  job: JobSummary;
  createdAt: string;
}

type StatusFilter =
  | 'ALL'
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED';

const FILTER_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Offered', value: 'OFFER' },
  { label: 'Hired', value: 'HIRED' },
  { label: 'Rejected', value: 'REJECTED' },
];

interface StatusStyle {
  bg: string;
  fg: string;
  label: string;
  showCheck?: boolean;
}

function styleForStatus(status: string): StatusStyle {
  const s = status.toUpperCase();
  switch (s) {
    case 'HIRED':
      return { bg: 'rgba(31,138,91,0.1)', fg: '#1F8A5B', label: 'Hired', showCheck: true };
    case 'OFFER':
    case 'OFFERED':
      return { bg: 'rgba(196,148,45,0.12)', fg: '#A07A1F', label: 'Offer' };
    case 'INTERVIEW':
      return { bg: 'rgba(115,80,200,0.12)', fg: '#6A4DBF', label: 'Interview' };
    case 'SHORTLISTED':
      return { bg: 'rgba(58,45,196,0.1)', fg: '#3A2DC4', label: 'Shortlisted' };
    case 'REJECTED':
      return { bg: 'rgba(196,45,45,0.1)', fg: '#B23030', label: 'Rejected' };
    case 'APPLIED':
    default:
      return { bg: 'rgba(11,11,15,0.06)', fg: '#3A3A44', label: 'Applied' };
  }
}

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatAppliedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [items, setItems] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    if (!user) return;
    let alive = true;
    setLoading(true);
    setError(null);
    api.applications
      .mine()
      .then((rows) => {
        if (!alive) return;
        setItems(rows);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || 'Could not load applications.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length };
    for (const row of items) {
      const k = row.status.toUpperCase();
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [items]);

  const displayed = useMemo(() => {
    if (statusFilter === 'ALL') return items;
    return items.filter((a) => a.status.toUpperCase() === statusFilter);
  }, [items, statusFilter]);

  if (authLoading || !user) {
    return (
      <div style={{ padding: 40, color: '#7A7A86', fontSize: 14 }}>Loading…</div>
    );
  }

  return (
    <div data-resp-page="applications">
      <div className="r-page" style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '28px',
          }}
        >
          <h1
            className="r-title"
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: '33px',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#0B0B0F',
            }}
          >
            My Applications <span style={{ color: '#B6B6C0' }}>({items.length})</span>
          </h1>
          <a
            onClick={(e) => {
              e.preventDefault();
              router.push('/coming-soon');
            }}
            href="/coming-soon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#3A2DC4',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Browse jobs
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Filter pills */}
        <div
          className="r-hscroll"
          data-applications-filter-pills
          data-r="scrollx"
          style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}
        >
          {FILTER_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            const count = counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '100px',
                  border: active ? '1px solid #0B0B0F' : '1px solid #E7E7EC',
                  background: active ? '#0B0B0F' : '#fff',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : '#3A3A44',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: active ? 'rgba(255,255,255,0.7)' : '#B6B6C0',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div>
          {loading ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#7A7A86',
                fontSize: 13.5,
                borderTop: '1px solid #E7E7EC',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              Loading your applications…
            </div>
          ) : error ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#B23030',
                fontSize: 13.5,
                borderTop: '1px solid #E7E7EC',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              {error}
            </div>
          ) : displayed.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#7A7A86',
                fontSize: 13.5,
                borderTop: '1px solid #E7E7EC',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              {statusFilter === 'ALL' ? (
                <>
                  You haven&apos;t applied to any jobs yet.{' '}
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/coming-soon');
                    }}
                    href="/coming-soon"
                    style={{ color: '#3A2DC4', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Browse open jobs →
                  </a>
                </>
              ) : (
                <>No applications with this status.</>
              )}
            </div>
          ) : (
            displayed.map((app, idx) => {
              const j = app.job;
              const styles = styleForStatus(app.status);
              const initials = initialsFrom(j.company.name);
              const appliedDate = formatAppliedDate(app.createdAt);
              const isFirst = idx === 0;
              return (
                <div
                  key={app.id}
                  data-applications-row
                  data-r="wrap-sm gap16-sm"
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/jobs/${j.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/jobs/${j.id}`);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 4px',
                    borderTop: isFirst ? '1px solid #E7E7EC' : 'none',
                    borderBottom: '1px solid #E7E7EC',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '11px',
                      background: '#0B0B0F',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: 600,
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {initials || '—'}
                  </span>
                  <div data-applications-meta data-rec-title style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: '#0B0B0F' }}>{j.title}</span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '2px 9px 2px 7px',
                          borderRadius: '100px',
                          background: styles.bg,
                          color: styles.fg,
                          fontFamily: "'Space Mono',monospace",
                          fontSize: '9.5px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {styles.showCheck && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        {styles.label}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '11px',
                        letterSpacing: '0.03em',
                        color: '#7A7A86',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#3A3A44' }}>{j.company.name}</span>
                      {j.location && (
                        <>
                          <span style={{ color: '#D8D8E0' }}>·</span>
                          <span>{j.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div data-applications-date style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '9.5px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#9A9AA4',
                        marginBottom: '4px',
                      }}
                    >
                      Applied
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '12.5px', color: '#3A3A44' }}>
                      {appliedDate}
                    </div>
                  </div>
                  <a
                    data-applications-view
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/jobs/${j.id}`);
                    }}
                    href={`/jobs/${j.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#3A2DC4',
                      textDecoration: 'none',
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  >
                    View job
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
