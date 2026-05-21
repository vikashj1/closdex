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
  APPLIED: 'var(--text-mute)',
  SHORTLISTED: 'var(--gold)',
  OFFERED: 'var(--cool)',
  HIRED: 'var(--emerald)',
  REJECTED: 'var(--r-master)',
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

  useEffect(() => {
    if (!user || !jobId) return;
    let cancelled = false;
    Promise.all([api.jobs.get(jobId), api.jobs.listApplications(jobId)])
      .then(([j, apps]) => {
        if (cancelled) return;
        setJob(j);
        setApplications(apps);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load applications.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, jobId]);

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

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
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

      {applications.length === 0 ? (
        <Card padding={32} style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-mute)', fontSize: 14 }}>No applications yet for this role.</div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applications.map((app) => {
            const rankName = rankFromEnum(app.salesperson.rank as any) as RankName;
            const statusColor = STATUS_COLOR[app.status] ?? 'var(--text-mute)';
            return (
              <Card key={app.id} padding={18} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: `color-mix(in oklch, ${statusColor} 14%, transparent)`,
                    color: statusColor,
                    border: `1px solid color-mix(in oklch, ${statusColor} 30%, transparent)`,
                  }}>
                    {app.status}
                  </span>
                  <Btn
                    kind="ghost"
                    size="sm"
                    onClick={() => router.push(`/company/talent/${encodeURIComponent(app.salesperson.publicSlug)}`)}
                  >
                    View profile →
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
