'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, JobDetail } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { rankFromEnum } from '@/lib/constants';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'var(--gold)',
  LIVE:      'var(--emerald)',
  PUBLISHED: 'var(--emerald)',
  ACTIVE:    'var(--emerald)',
  PAUSED:    'var(--text-mute)',
  CLOSED:    'var(--text-mute)',
};

export default function CompanyJobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  useRequireAuth('COMPANY');

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    api.jobs.get(jobId)
      .then(setJob)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Could not load job.'))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }
  if (error || !job) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>{error ?? 'Job not found.'}</div>;
  }

  const statusColor = STATUS_COLORS[job.status] ?? 'var(--text-mute)';
  const salaryText = (job.salaryMin || job.salaryMax)
    ? `₹${((job.salaryMin ?? 0) / 100000).toLocaleString()} – ₹${((job.salaryMax ?? 0) / 100000).toLocaleString()} LPA`
    : null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <button
          onClick={() => router.push('/company/jobs')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 12.5, padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          ← All jobs
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: `color-mix(in oklch, ${statusColor} 18%, transparent)`,
                  color: statusColor, border: `1px solid color-mix(in oklch, ${statusColor} 35%, transparent)`,
                }}
              >
                {job.status}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>{job.company.name}</span>
              {job.location && <span style={{ fontSize: 12.5, color: 'var(--text-mute)' }}>· {job.location}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Btn kind="ghost" size="sm" onClick={() => router.push(`/company/jobs/${jobId}/applications`)}>
              View applicants
            </Btn>
            <Btn kind="primary" size="sm" onClick={() => router.push(`/company/jobs/${jobId}/edit`)}
              style={{ background: 'var(--cool)', color: 'white' }}>
              Edit
            </Btn>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {job.description && (
            <Card padding={24}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Description
              </h3>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
                {job.description}
              </div>
            </Card>
          )}

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <Card padding={24}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Required skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {job.requiredSkills.map((s) => (
                  <Chip key={s} color="var(--cool)">{s}</Chip>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card padding={20}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              {salaryText && (
                <DetailRow label="Salary" value={salaryText} accent="var(--emerald)" />
              )}
              {job.location && <DetailRow label="Location" value={job.location} />}
              {job.specializationTag && <DetailRow label="Specialization" value={job.specializationTag} />}
              {job.minRank && (
                <DetailRow label="Min rank" value={`${rankFromEnum(job.minRank)}+`} />
              )}
              {job.experienceMinYears != null && (
                <DetailRow label="Min experience" value={`${job.experienceMinYears} years`} />
              )}
              {job.employmentType && (
                <DetailRow label="Type" value={job.employmentType.replace('_', ' ')} />
              )}
              {job.listingTier && (
                <DetailRow label="Tier" value={job.listingTier} />
              )}
              {job.applicationDeadline && (
                <DetailRow
                  label="Deadline"
                  value={new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
      <span style={{ color: 'var(--text-mute)', fontSize: 11.5 }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent ?? 'var(--text)', fontSize: 12.5 }}>{value}</span>
    </div>
  );
}
