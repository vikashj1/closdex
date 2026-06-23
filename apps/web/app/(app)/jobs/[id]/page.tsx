'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, JobDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';

function fmtLpa(v: number): string {
  const lpa = v / 100000;
  return '₹' + (Number.isInteger(lpa) ? lpa : lpa.toFixed(1)) + ' LPA';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const { user, loading: authLoading } = useAuth();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const [backHover, setBackHover] = useState(false);
  const [applyHover, setApplyHover] = useState(false);

  useEffect(() => {
    if (authLoading || !jobId) return;
    const calls: Promise<unknown>[] = [api.jobs.get(jobId)];
    if (user) calls.push(api.applications.mine());
    Promise.all(calls)
      .then((results) => {
        setJob(results[0] as JobDetail);
        if (user) {
          const myApps = results[1] as Array<{ job: { id: string } }>;
          setApplied(myApps.some(a => a.job.id === jobId));
        }
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : 'Could not load job.');
      });
  }, [authLoading, user, jobId]);

  async function handleApply() {
    if (!jobId) return;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
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
    return (
      <main style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 80px', color: '#7A7A86', fontSize: 14 }}>
          Loading…
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 80px' }}>
          <div style={{ color: '#D14343', marginBottom: 14, fontSize: 14 }}>{loadError}</div>
          <button
            onClick={() => router.push('/jobs')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: '#7A7A86',
              fontFamily: 'Inter,sans-serif',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back to jobs
          </button>
        </div>
      </main>
    );
  }

  if (!job) return null;

  const salaryStr = job.salaryMin && job.salaryMax
    ? `${fmtLpa(job.salaryMin)} – ${fmtLpa(job.salaryMax)}`
    : null;

  const minRankName = job.minRank
    ? (rankFromEnum(job.minRank as any) as RankName)
    : null;

  return (
    <main data-resp-page="job-detail" style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 40px 80px' }}>

        {/* Back link */}
        <button
          onClick={() => router.push('/jobs')}
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: backHover ? '#0B0B0F' : '#7A7A86',
            fontFamily: 'Inter,sans-serif',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 18,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to jobs
        </button>

        {/* Title card */}
        <section style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: 28, background: '#FFFFFF', marginBottom: 16 }}>
          <div data-job-detail-title-row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0B0B0F' }}>
                {job.title}
              </h1>
              <div style={{ fontSize: 15, color: '#5A5A66', fontWeight: 500, marginBottom: 16 }}>
                {job.company.name}
                {job.company.industry && (
                  <span style={{ color: '#9A9AA4', fontWeight: 400 }}> · {job.company.industry}</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {job.location && (
                  <span style={{ padding: '5px 11px', borderRadius: 100, background: '#FAFAF8', border: '1px solid #E7E7EC', color: '#3A3A44', fontSize: 12.5, fontWeight: 500 }}>
                    {job.location}
                  </span>
                )}
                {job.employmentType && (
                  <span style={{ padding: '5px 11px', borderRadius: 100, background: '#FAFAF8', border: '1px solid #E7E7EC', color: '#3A3A44', fontSize: 12.5, fontWeight: 500 }}>
                    {job.employmentType.replace('_', ' ')}
                  </span>
                )}
                {salaryStr && (
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: '#1F8A5B', marginLeft: 4 }}>
                    {salaryStr}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Apply button / Applied pill */}
            <div data-job-detail-apply-slot style={{ flexShrink: 0 }}>
              {applied ? (
                <div style={{
                  padding: '11px 22px',
                  borderRadius: 10,
                  background: 'rgba(31,138,91,0.10)',
                  border: '1px solid rgba(31,138,91,0.30)',
                  color: '#1F8A5B',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  Applied ✓
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  onMouseEnter={() => setApplyHover(true)}
                  onMouseLeave={() => setApplyHover(false)}
                  style={{
                    background: applyHover && !applying ? '#4A3BE0' : '#5B4BF5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '11px 22px',
                    fontFamily: 'Inter,sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: applying ? 'default' : 'pointer',
                    opacity: applying ? 0.7 : 1,
                    minWidth: 110,
                  }}
                >
                  {applying ? 'Applying…' : 'Apply now'}
                </button>
              )}
            </div>

          </div>

          {applyError && (
            <div style={{
              marginTop: 14,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12.5,
              background: 'rgba(209,67,67,0.08)',
              color: '#5A5A66',
              border: '1px solid rgba(209,67,67,0.25)',
            }}>
              {applyError}
            </div>
          )}
        </section>

        {/* Job details grid */}
        <section style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 18px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#0B0B0F' }}>
            Job details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '18px 24px' }}>

            {job.experienceMinYears != null && (
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: 6 }}>
                  Min experience
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0B0B0F' }}>
                  {job.experienceMinYears}+ years
                </div>
              </div>
            )}

            {minRankName && (
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: 6 }}>
                  Min rank
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M7 0.5 13 3v5c0 4-3 6.5-6 7.5-3-1-6-3.5-6-7.5V3L7 0.5Z" fill="#C58A3E" stroke="#8A6A1A" strokeWidth="0.8" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0B0B0F' }}>{minRankName}+</span>
                </div>
              </div>
            )}

            {job.listingTier && job.listingTier !== 'BASIC' && (
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: 6 }}>
                  Listing tier
                </div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#8A6A1A' }}>
                  {job.listingTier}
                </div>
              </div>
            )}

            {job.applicationDeadline && (
              <div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: 6 }}>
                  Apply by
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0B0B0F' }}>
                  {fmtDate(job.applicationDeadline)}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* About the role */}
        {job.description && (
          <section style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#0B0B0F' }}>
              About the role
            </h3>
            <p style={{ margin: 0, fontSize: 13.5, color: '#3A3A44', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </p>
          </section>
        )}

        {/* Skills & specialization */}
        {((job.requiredSkills && job.requiredSkills.length > 0) || job.specializationTag) && (
          <section style={{ border: '1px solid #E7E7EC', borderRadius: 14, padding: '22px 24px', background: '#FFFFFF' }}>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#0B0B0F' }}>
                  Required skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {job.requiredSkills.map(s => (
                    <span key={s} style={{ padding: '5px 11px', borderRadius: 100, background: '#FAFAF8', border: '1px solid #E7E7EC', color: '#3A3A44', fontSize: 12.5, fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.specializationTag && (
              <div>
                <h3 style={{ margin: '0 0 12px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#0B0B0F' }}>
                  Specialization
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ padding: '5px 11px', borderRadius: 100, background: 'rgba(91,75,245,0.08)', border: '1px solid rgba(91,75,245,0.25)', color: '#3A2DC4', fontSize: 12.5, fontWeight: 600 }}>
                    {job.specializationTag}
                  </span>
                </div>
              </div>
            )}

          </section>
        )}

      </div>

      {/* Mobile-only sticky CTA — pinned to viewport bottom on phones.
          Hidden on tablet+ via .r-sticky-cta media query (CSS in globals.css). */}
      <div className="r-sticky-cta" data-job-detail-sticky-cta>
        {applied ? (
          <div style={{
            padding: '12px 22px',
            borderRadius: 10,
            background: 'rgba(31,138,91,0.10)',
            border: '1px solid rgba(31,138,91,0.30)',
            color: '#1F8A5B',
            fontFamily: 'Inter,sans-serif',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
          }}>
            Applied ✓
          </div>
        ) : (
          <button
            onClick={handleApply}
            disabled={applying}
            style={{
              background: '#5B4BF5',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 22px',
              fontFamily: 'Inter,sans-serif',
              fontSize: 14,
              fontWeight: 600,
              cursor: applying ? 'default' : 'pointer',
              opacity: applying ? 0.7 : 1,
              width: '100%',
            }}
          >
            {applying ? 'Applying…' : 'Apply now'}
          </button>
        )}
      </div>
    </main>
  );
}
