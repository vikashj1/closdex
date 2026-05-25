'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, JobSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
}

function StatusBadge({ status }: { status: string }) {
  let color = 'var(--text-mute)';
  let bg = 'var(--bg-2)';
  if (status === 'PUBLISHED' || status === 'ACTIVE') {
    color = 'var(--emerald)';
    bg = 'color-mix(in oklch, var(--emerald) 14%, transparent)';
  } else if (status === 'DRAFT') {
    color = 'var(--gold)';
    bg = 'color-mix(in oklch, var(--gold) 14%, transparent)';
  }
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 5,
        background: bg,
        color,
        letterSpacing: '0.05em',
      }}
    >
      {status}
    </span>
  );
}

export default function CompanyJobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [items, setItems] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const companyId = user?.companyMemberships?.[0]?.companyId;

  function reload() {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    api.jobs
      .list({ companyId, perPage: 100 })
      .then((res) => {
        setItems(res.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Could not load jobs.');
        setLoading(false);
      });
  }

  useEffect(() => {
    if (authLoading || !user) return;
    if (!companyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.jobs
      .list({ companyId, perPage: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load jobs.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, user, companyId]);

  async function doAction(jobId: string, action: 'publish' | 'pause' | 'close' | 'repost') {
    setActionBusy(jobId + ':' + action);
    setActionError(null);
    try {
      await api.jobs[action](jobId);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : `Failed to ${action} job.`);
    } finally {
      setActionBusy(null);
    }
  }

  if (authLoading) {
    return (
      <div style={{ padding: 32, color: 'var(--text-mute)', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (!companyId) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        Company profile not set up. Please complete your company onboarding first.
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
          Job Postings
        </h1>
        <Btn
          kind="primary"
          size="md"
          style={{ background: 'var(--cool)', color: 'white' }}
          onClick={() => router.push('/company/jobs/new')}
        >
          Post new role
        </Btn>
      </div>

      {/* Action error */}
      {actionError && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--r-master) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--r-master) 30%, transparent)',
            color: 'var(--text-dim)',
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 16, lineHeight: 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--r-master) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--r-master) 30%, transparent)',
            color: 'var(--text-dim)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
          Loading jobs…
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div
          style={{
            padding: '64px 32px',
            textAlign: 'center',
            color: 'var(--text-mute)',
            fontSize: 14,
            background: 'var(--bg-2)',
            borderRadius: 12,
            border: '1px dashed var(--border)',
          }}
        >
          No jobs posted yet. Post your first role to start receiving applications.
        </div>
      )}

      {/* Job cards */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((job) => (
            <Card key={job.id} padding={20}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                {/* Left: main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</span>
                    {job.workMode && (
                      <Chip color="var(--cool)">{job.workMode}</Chip>
                    )}
                    <StatusBadge status={job.status} />
                  </div>

                  {/* Location + CTC */}
                  <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>
                    {job.location && (
                      <span>{job.location}</span>
                    )}
                    {job.ctcMin != null && job.ctcMax != null && (
                      <span className="mono" style={{ marginLeft: job.location ? 12 : 0, color: 'var(--emerald)' }}>
                        ₹{job.ctcMin}–{job.ctcMax} LPA
                      </span>
                    )}
                  </div>

                  {/* Specialization tags */}
                  {job.specializationTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {job.specializationTags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: actions + meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <Btn
                    kind="ghost"
                    size="sm"
                    onClick={() => router.push(`/company/jobs/${job.id}/applications`)}
                  >
                    View applicants
                  </Btn>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {job.status === 'DRAFT' && (
                      <Btn
                        kind="ghost"
                        size="sm"
                        disabled={actionBusy === job.id + ':publish'}
                        onClick={() => doAction(job.id, 'publish')}
                        style={{ color: 'var(--emerald)', borderColor: 'var(--emerald)' }}
                      >
                        {actionBusy === job.id + ':publish' ? 'Publishing…' : 'Publish'}
                      </Btn>
                    )}
                    {(job.status === 'PUBLISHED' || job.status === 'ACTIVE' || job.status === 'LIVE') && (
                      <>
                        <Btn
                          kind="ghost"
                          size="sm"
                          disabled={actionBusy === job.id + ':pause'}
                          onClick={() => doAction(job.id, 'pause')}
                        >
                          {actionBusy === job.id + ':pause' ? 'Pausing…' : 'Pause'}
                        </Btn>
                        <Btn
                          kind="ghost"
                          size="sm"
                          disabled={actionBusy === job.id + ':close'}
                          onClick={() => doAction(job.id, 'close')}
                          style={{ color: 'var(--text-mute)' }}
                        >
                          {actionBusy === job.id + ':close' ? 'Closing…' : 'Close'}
                        </Btn>
                      </>
                    )}
                    {(job.status === 'PAUSED' || job.status === 'CLOSED') && (
                      <Btn
                        kind="ghost"
                        size="sm"
                        disabled={actionBusy === job.id + ':repost'}
                        onClick={() => doAction(job.id, 'repost')}
                        style={{ color: 'var(--cool)' }}
                      >
                        {actionBusy === job.id + ':repost' ? 'Reposting…' : 'Repost'}
                      </Btn>
                    )}
                    <Btn
                      kind="ghost"
                      size="sm"
                      onClick={() => router.push(`/company/jobs/${job.id}/edit`)}
                    >
                      Edit
                    </Btn>
                  </div>
                  {job.postedAt && (
                    <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                      Posted {relativeTime(job.postedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
