'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, JobDetail } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { RankBadge } from '@/components/ui/RankBadge';
import { rankFromEnum, type RankName } from '@/lib/constants';

function fmtLpa(v: number): string {
  const lpa = v / 100000;
  return '₹' + (Number.isInteger(lpa) ? lpa : lpa.toFixed(1)) + ' LPA';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !jobId) return;
    Promise.all([api.jobs.get(jobId), api.applications.mine()])
      .then(([j, myApps]) => {
        setJob(j);
        setApplied(myApps.some(a => a.job.id === jobId));
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : 'Could not load job.');
      });
  }, [user, jobId]);

  async function handleApply() {
    if (!jobId) return;
    setApplying(true); setApplyError(null);
    try {
      await api.jobs.apply(jobId);
      setApplied(true);
    } catch (err) {
      setApplyError(err instanceof ApiError ? err.message : 'Apply failed.');
    } finally {
      setApplying(false);
    }
  }

  if (authLoading || (!job && !loadError)) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  if (loadError) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--r-master)', marginBottom: 14 }}>{loadError}</div>
        <Btn kind="ghost" onClick={() => router.push('/jobs')}>← Back to jobs</Btn>
      </div>
    );
  }

  if (!job) return null;

  const salaryStr = job.salaryMin && job.salaryMax
    ? `${fmtLpa(job.salaryMin)} – ${fmtLpa(job.salaryMax)}`
    : job.ctcMin && job.ctcMax
    ? `₹${job.ctcMin}–${job.ctcMax} LPA`
    : null;

  const minRankName = job.minRank
    ? (rankFromEnum(job.minRank as any) as RankName)
    : null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820 }}>
      {/* Back */}
      <Btn kind="ghost" size="sm" onClick={() => router.push('/jobs')} style={{ marginBottom: 18 }}>
        ← Jobs
      </Btn>

      {/* Title card */}
      <Card padding={28} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h1 className="display" style={{ fontSize: 26, margin: '0 0 8px', fontWeight: 700, lineHeight: 1.2 }}>
              {job.title}
            </h1>
            <div style={{ fontSize: 15, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 12 }}>
              {job.company.name}
              {job.company.industry && (
                <span style={{ fontSize: 12.5, fontWeight: 400, color: 'var(--text-mute)', marginLeft: 8 }}>
                  · {job.company.industry}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {job.location && <Chip>{job.location}</Chip>}
              {job.workMode && <Chip color="var(--cool)">{job.workMode}</Chip>}
              {job.employmentType && <Chip>{job.employmentType.replace('_', ' ')}</Chip>}
              {salaryStr && (
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--emerald)', alignSelf: 'center' }}>
                  {salaryStr}
                </span>
              )}
            </div>
          </div>

          {/* Apply button */}
          <div style={{ flexShrink: 0 }}>
            {applied ? (
              <div style={{ padding: '10px 20px', borderRadius: 10, background: 'color-mix(in oklch, var(--emerald) 12%, transparent)', border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)', color: 'var(--emerald)', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                ✓ Applied
              </div>
            ) : (
              <Btn kind="primary" size="md"
                style={{ background: 'var(--cool)', color: 'white', minWidth: 110, opacity: applying ? 0.7 : 1 }}
                disabled={applying}
                onClick={handleApply}>
                {applying ? 'Applying…' : 'Apply now'}
              </Btn>
            )}
          </div>
        </div>

        {applyError && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, fontSize: 12.5, background: 'color-mix(in oklch, red 10%, transparent)', color: 'var(--text-dim)', border: '1px solid color-mix(in oklch, red 25%, transparent)' }}>
            {applyError}
          </div>
        )}
      </Card>

      {/* Details grid */}
      <Card padding={24} style={{ marginBottom: 18 }}>
        <h2 className="display" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 18px' }}>Job details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '18px 24px' }}>
          {job.experienceMinYears != null && (
            <Detail label="Min experience" value={`${job.experienceMinYears}+ years`} />
          )}
          {minRankName && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Min rank
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RankBadge rank={minRankName} size={14} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{minRankName}+</span>
              </div>
            </div>
          )}
          {job.listingTier && job.listingTier !== 'BASIC' && (
            <Detail label="Listing tier" value={job.listingTier} />
          )}
          {job.applicationDeadline && (
            <Detail label="Apply by" value={fmtDate(job.applicationDeadline)} />
          )}
        </div>
      </Card>

      {/* Description */}
      {job.description && (
        <Card padding={24} style={{ marginBottom: 18 }}>
          <h2 className="display" style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>About the role</h2>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {job.description}
          </p>
        </Card>
      )}

      {/* Skills & tags */}
      {((job.requiredSkills && job.requiredSkills.length > 0) || (job.specializationTags && job.specializationTags.length > 0) || job.specializationTag) && (
        <Card padding={24}>
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Required skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.requiredSkills.map(s => <Chip key={s}>{s}</Chip>)}
              </div>
            </div>
          )}
          {(job.specializationTags?.length > 0 || job.specializationTag) && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Specialization
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {job.specializationTag && <Chip color="var(--cool)">{job.specializationTag}</Chip>}
                {job.specializationTags?.filter(t => t !== job.specializationTag).map(t => <Chip key={t} color="var(--cool)">{t}</Chip>)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
