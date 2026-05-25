'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, JobSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { rankFromEnum, type RankName } from '@/lib/constants';

interface Application {
  id: string;
  status: string;
  salesperson: {
    id: string;
    publicSlug: string;
    rank: string;
    totalPoints: number;
    user: { name: string };
  };
}

const STATUS_COLOR: Record<string, string> = {
  APPLIED:     'var(--text-mute)',
  VIEWED:      'var(--text-dim)',
  SHORTLISTED: 'var(--gold)',
  INTERVIEW:   'var(--cool)',
  OFFERED:     'var(--d-expert)',
  HIRED:       'var(--emerald)',
  REJECTED:    'var(--r-master)',
};

// Valid next states per current status (mirrors backend APPLICATION_TRANSITIONS)
const NEXT_STATES: Record<string, string[]> = {
  APPLIED:     ['SHORTLISTED', 'REJECTED'],
  VIEWED:      ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW:   ['OFFERED', 'REJECTED'],
  OFFERED:     ['HIRED', 'REJECTED'],
};

const LABEL: Record<string, string> = {
  SHORTLISTED: 'Shortlist',
  INTERVIEW:   'Interview',
  OFFERED:     'Make Offer',
  HIRED:       'Hire',
  REJECTED:    'Reject',
};

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [job, setJob] = useState<JobSummary | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function load(cancelled?: { current: boolean }) {
    if (!jobId) return;
    Promise.all([api.jobs.get(jobId), api.jobs.listApplications(jobId)])
      .then(([j, apps]) => {
        if (cancelled?.current) return;
        setJob(j);
        setApplications(apps);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled?.current) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load applications.');
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!user || !jobId) return;
    const ref = { current: false };
    load(ref);
    return () => { ref.current = true; };
  }, [user, jobId]);

  async function advance(appId: string, nextStatus: string) {
    setBusy(appId + ':' + nextStatus);
    setActionError(null);
    try {
      const updated = await api.applications.updateStatus(appId, nextStatus);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Status update failed.');
    } finally {
      setBusy(null);
    }
  }

  if (authLoading || !user || loading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--r-master)', marginBottom: 14 }}>{error}</div>
        <Btn kind="ghost" onClick={() => router.push('/company/jobs')}>← Back to jobs</Btn>
      </div>
    );
  }

  const stageCounts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Back + title */}
      <div style={{ marginBottom: 22 }}>
        <Btn kind="ghost" size="sm" onClick={() => router.push('/company/jobs')} style={{ marginBottom: 10 }}>
          ← Job postings
        </Btn>
        <h1 className="display" style={{ fontSize: 26, margin: '0 0 4px', fontWeight: 700 }}>
          {job?.title ?? 'Applications'}
        </h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: 0 }}>
          {applications.length} applicant{applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pipeline summary strip */}
      {applications.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'].map(stage => {
            const count = stageCounts[stage] ?? 0;
            if (count === 0) return null;
            const color = STATUS_COLOR[stage] ?? 'var(--text-mute)';
            return (
              <div key={stage} style={{ padding: '5px 12px', borderRadius: 8, background: `color-mix(in oklch, ${color} 12%, transparent)`, border: `1px solid color-mix(in oklch, ${color} 25%, transparent)`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.05em' }}>{stage}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: 'color-mix(in oklch, red 10%, transparent)', border: '1px solid color-mix(in oklch, red 25%, transparent)', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* Empty state */}
      {applications.length === 0 && (
        <Card padding={32} style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-mute)', fontSize: 14 }}>No applications yet for this role.</div>
        </Card>
      )}

      {/* Applicant cards */}
      {applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map((app) => {
            const rankName = rankFromEnum(app.salesperson.rank as any) as RankName;
            const statusColor = STATUS_COLOR[app.status] ?? 'var(--text-mute)';
            const nextStates = NEXT_STATES[app.status] ?? [];
            return (
              <Card key={app.id} padding={18}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  {/* Applicant info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <Avatar name={app.salesperson.user.name} size={36} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{app.salesperson.user.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <RankBadge rank={rankName} size={14} />
                        <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                          {app.salesperson.totalPoints.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* Current status badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      background: `color-mix(in oklch, ${statusColor} 14%, transparent)`,
                      color: statusColor,
                      border: `1px solid color-mix(in oklch, ${statusColor} 30%, transparent)`,
                    }}>
                      {app.status}
                    </span>

                    {/* Pipeline advance buttons */}
                    {nextStates.filter(s => s !== 'REJECTED').map(s => (
                      <Btn key={s} kind="ghost" size="sm"
                        disabled={!!busy}
                        onClick={() => advance(app.id, s)}
                        style={{ color: STATUS_COLOR[s] ?? 'var(--cool)', fontSize: 12 }}>
                        {busy === app.id + ':' + s ? '…' : LABEL[s]}
                      </Btn>
                    ))}

                    {/* Reject (always last, muted) */}
                    {nextStates.includes('REJECTED') && (
                      <Btn kind="ghost" size="sm"
                        disabled={!!busy}
                        onClick={() => advance(app.id, 'REJECTED')}
                        style={{ color: 'var(--text-mute)', fontSize: 12 }}>
                        {busy === app.id + ':REJECTED' ? '…' : 'Reject'}
                      </Btn>
                    )}

                    {/* View profile */}
                    <Btn kind="ghost" size="sm"
                      onClick={() => router.push(`/company/talent/${encodeURIComponent(app.salesperson.publicSlug)}`)}>
                      Profile →
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
