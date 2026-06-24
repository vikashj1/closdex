'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, JobSummary, api } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth';

// Jobs — Vikash dashboard redesign 2026-06-16.
// Visuals shipped on 06-16; this slice wires the cards to api.jobs.list and
// api.applications.mine so each card reflects whether the salesperson already
// applied. Filters (location / employment type / specialisation) are now state.

interface ApplicationRow {
  id: string;
  status: string;
  job: JobSummary;
  createdAt: string;
}

function fmtLpa(v: number | null | undefined): string {
  if (v == null) return '';
  const lpa = v / 100000;
  return Number.isInteger(lpa) ? `${lpa}` : lpa.toFixed(1);
}

function fmtSalaryRange(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `₹${fmtLpa(min)}–${fmtLpa(max)} LPA`;
  if (min != null) return `₹${fmtLpa(min)}+ LPA`;
  return `Up to ₹${fmtLpa(max)} LPA`;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const SPEC_TAGS = ['IT Sales', 'SaaS', 'FinTech', 'Cloud', 'Cybersec', 'DevTools', 'Healthcare'];
const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Internship'];

export default function JobsPage() {
  useRequireAuth('SALESPERSON');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — wired from the prototype's pill row.
  const [tab, setTab] = useState<'all' | 'saved'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        api.jobs.list({ perPage: 30, specializationTag: tagFilter || undefined }),
        api.applications.mine(),
        api.jobs.savedJobIds(),
      ]);
      if (cancelled) return;
      const jRes = results[0];
      if (jRes.status === 'fulfilled') {
        setJobs((jRes.value as { items: JobSummary[] }).items);
      } else {
        setError(jRes.reason instanceof ApiError ? jRes.reason.message : 'Could not load jobs.');
      }
      const aRes = results[1];
      if (aRes.status === 'fulfilled') setApps(aRes.value as ApplicationRow[]);
      const sRes = results[2];
      if (sRes.status === 'fulfilled') setSavedIds(new Set(sRes.value as string[]));
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, tagFilter]);

  const appliedSet = useMemo(() => new Set(apps.map((a) => a.job.id)), [apps]);

  const filteredJobs = useMemo(() => {
    const loc = locationFilter.trim().toLowerCase();
    const emp = employmentFilter.trim().toLowerCase();
    let pool = tab === 'saved' ? jobs.filter((j) => savedIds.has(j.id)) : jobs;
    if (loc) pool = pool.filter((j) => (j.location ?? '').toLowerCase().includes(loc));
    if (emp) {
      // employmentType isn't on JobSummary today, but the backend ships it on
      // some responses. Filter loosely when present, otherwise leave the row.
      pool = pool.filter((j) => {
        const et = (j as JobSummary & { employmentType?: string | null }).employmentType;
        return !et || et.toLowerCase().includes(emp);
      });
    }
    return pool;
  }, [jobs, tab, savedIds, locationFilter, employmentFilter]);

  const pipeline = useMemo(() => {
    const count = (status: string) => apps.filter((a) => a.status === status).length;
    return [
      { label: 'Applied', value: count('APPLIED'), accent: '#0B0B0F' },
      { label: 'Viewed', value: count('VIEWED'), accent: '#0B0B0F' },
      { label: 'Shortlisted', value: count('SHORTLISTED'), accent: '#0B0B0F' },
      { label: 'Interview', value: count('INTERVIEW'), accent: '#0B0B0F' },
      { label: 'Offer', value: count('OFFER'), accent: '#F5A524' },
    ];
  }, [apps]);

  // Lock body scroll while the mobile filter sheet is open + close on Escape.
  useEffect(() => {
    if (!filterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  return (
    <div data-resp-page="jobs">
      <div className="r-page" style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '30px',
          }}
        >
          <div>
            <h1
              className="r-title"
              style={{
                margin: '0',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: '700',
                fontSize: '33px',
                letterSpacing: '-0.03em',
                lineHeight: '1.05',
                color: '#0B0B0F',
              }}
            >
              Jobs for you
            </h1>
            <p
              style={{
                margin: '10px 0 0',
                fontFamily: "'Space Mono',monospace",
                fontSize: '11.5px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              {loading ? 'Loading…' : `${filteredJobs.length} listing${filteredJobs.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div data-r="wrap-sm" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              data-sheet-toggle
              className="r-filters-btn"
              onClick={() => setFilterOpen(true)}
              style={{
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 15px',
                border: '1px solid #E7E7EC',
                borderRadius: '10px',
                background: '#fff',
                fontFamily: 'Inter,sans-serif',
                fontSize: '13px',
                fontWeight: '600',
                color: '#3A3A44',
                cursor: 'pointer',
              }}
            >
              Filters
            </button>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                padding: '0 15px',
                border: `1px solid ${filterOpen ? '#0B0B0F' : '#E7E7EC'}`,
                borderRadius: '10px',
                background: filterOpen ? '#0B0B0F' : '#fff',
                fontFamily: 'Inter,sans-serif',
                fontSize: '13px',
                fontWeight: '600',
                color: filterOpen ? '#fff' : '#3A3A44',
                cursor: 'pointer',
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
                <line x1="21" x2="14" y1="4" y2="4" />
                <line x1="10" x2="3" y1="4" y2="4" />
                <line x1="21" x2="12" y1="12" y2="12" />
                <line x1="8" x2="3" y1="12" y2="12" />
                <line x1="21" x2="16" y1="20" y2="20" />
                <line x1="12" x2="3" y1="20" y2="20" />
                <line x1="14" x2="14" y1="2" y2="6" />
                <line x1="8" x2="8" y1="10" y2="14" />
                <line x1="16" x2="16" y1="18" y2="22" />
              </svg>
              Filters
            </button>
            <button
              onClick={() => router.push('/applications')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                height: '38px',
                padding: '0 16px',
                border: '1px solid #E7E7EC',
                borderRadius: '10px',
                background: '#fff',
                fontFamily: 'Inter,sans-serif',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0B0B0F',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Applications
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#fff',
                  background: '#5B4BF5',
                  borderRadius: '7px',
                  padding: '1px 7px',
                }}
              >
                {apps.length}
              </span>
            </button>
          </div>
        </div>

        {filterOpen && (
          <div
            onClick={() => setFilterOpen(false)}
            data-jobs-scrim
            data-sheet-close
            className="r-sheet-scrim"
            aria-hidden="true"
            style={{
              display: 'none',
              position: 'fixed',
              inset: 0,
              background: 'rgba(11,11,15,0.45)',
              zIndex: 90,
            }}
          />
        )}
        {filterOpen && (
          <div
            data-jobs-filter-panel
            className="r-sheet"
            style={{
              marginBottom: '24px',
              padding: '18px 20px',
              border: '1px solid #E7E7EC',
              borderRadius: '14px',
              background: '#FAFAFB',
              display: 'grid',
              gap: '18px',
            }}
          >
            <div
              data-jobs-filter-header
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #E7E7EC',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#0B0B0F',
                }}
              >
                Filters
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                aria-label="Close filters"
                style={{
                  width: '36px',
                  height: '36px',
                  border: '1px solid #E7E7EC',
                  borderRadius: '10px',
                  background: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#3A3A44',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  marginBottom: '8px',
                }}
              >
                Location
              </div>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="e.g. Bengaluru, Remote"
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  height: '36px',
                  padding: '0 12px',
                  border: '1px solid #E7E7EC',
                  borderRadius: '8px',
                  background: '#fff',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: '13px',
                  color: '#0B0B0F',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  marginBottom: '8px',
                }}
              >
                Employment type
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EMPLOYMENT_TYPES.map((t) => {
                  const active = employmentFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setEmploymentFilter(active ? '' : t)}
                      style={{
                        height: '30px',
                        padding: '0 13px',
                        borderRadius: '999px',
                        border: `1px solid ${active ? '#0B0B0F' : '#E7E7EC'}`,
                        background: active ? '#0B0B0F' : '#fff',
                        color: active ? '#fff' : '#3A3A44',
                        fontFamily: 'Inter,sans-serif',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#7A7A86',
                  marginBottom: '8px',
                }}
              >
                Specialisation
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SPEC_TAGS.map((t) => {
                  const active = tagFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setTagFilter(active ? '' : t)}
                      style={{
                        height: '30px',
                        padding: '0 13px',
                        borderRadius: '999px',
                        border: `1px solid ${active ? '#5B4BF5' : '#E7E7EC'}`,
                        background: active ? 'rgba(91,75,245,0.08)' : '#fff',
                        color: active ? '#3A2DC4' : '#3A3A44',
                        fontFamily: 'Inter,sans-serif',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {(locationFilter || employmentFilter || tagFilter) && (
              <button
                onClick={() => {
                  setLocationFilter('');
                  setEmploymentFilter('');
                  setTagFilter('');
                }}
                style={{
                  justifySelf: 'start',
                  height: '32px',
                  padding: '0 14px',
                  border: '1px solid #E7E7EC',
                  borderRadius: '8px',
                  background: '#fff',
                  fontFamily: 'Inter,sans-serif',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#3A3A44',
                  cursor: 'pointer',
                }}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#7A7A86',
            marginBottom: '14px',
          }}
        >
          Application pipeline
        </div>
        <section
          data-jobs-pipeline
          data-r="scrollx"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '24px 8px',
            borderTop: '1px solid #E7E7EC',
            borderBottom: '1px solid #E7E7EC',
            marginBottom: '40px',
          }}
        >
          <div
            className="r-hscroll"
            style={{ display: 'flex', alignItems: 'center', width: '100%' }}
          >
            {pipeline.map((step, idx) => (
              <PipelineStep
                key={step.label}
                label={step.label}
                value={step.value}
                accent={step.accent}
                showChevron={idx < pipeline.length - 1}
              />
            ))}
          </div>
        </section>

        <nav
          className="r-hscroll"
          data-jobs-tabs
          data-r="scrollx"
          style={{ display: 'flex', alignItems: 'center', gap: '26px', marginBottom: '8px' }}
        >
          <button
            onClick={() => setTab('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: tab === 'all' ? '#0B0B0F' : '#7A7A86',
              boxShadow: tab === 'all' ? 'inset 0 -2px 0 #0B0B0F' : 'none',
            }}
          >
            All Jobs
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: '700', color: tab === 'all' ? '#0B0B0F' : '#B6B6C0' }}>
              {jobs.length}
            </span>
          </button>
          <button
            onClick={() => setTab('saved')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '10px 2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter,sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              color: tab === 'saved' ? '#0B0B0F' : '#7A7A86',
              boxShadow: tab === 'saved' ? 'inset 0 -2px 0 #0B0B0F' : 'none',
            }}
          >
            Saved
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: '700', color: tab === 'saved' ? '#0B0B0F' : '#B6B6C0' }}>
              {savedIds.size}
            </span>
          </button>
        </nav>

        <div style={{ marginTop: '14px' }}>
          {loading ? (
            <ListMessage>Loading jobs…</ListMessage>
          ) : error ? (
            <ListMessage tone="error">{error}</ListMessage>
          ) : filteredJobs.length === 0 ? (
            <ListMessage>
              {tab === 'saved' ? 'No saved jobs yet — bookmark a listing to find it here.' : 'No jobs match the current filters.'}
            </ListMessage>
          ) : (
            filteredJobs.map((j, idx) => {
              const applied = appliedSet.has(j.id);
              const isSaved = savedIds.has(j.id);
              const isLast = idx === filteredJobs.length - 1;
              const salary = fmtSalaryRange(j.salaryMin, j.salaryMax);
              const employmentType = (j as JobSummary & { employmentType?: string | null }).employmentType ?? null;
              const requiredSkills = (j as JobSummary & { requiredSkills?: string[] }).requiredSkills ?? [];
              return (
                <div
                  key={j.id}
                  data-jobs-card
                  data-r="wrap-sm gap16-sm"
                  onClick={() => router.push(`/jobs/${j.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 4px',
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: isLast ? '1px solid #E7E7EC' : 'none',
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
                      fontWeight: '600',
                      fontSize: '14px',
                      flexShrink: '0',
                    }}
                  >
                    {initialsOf(j.company.name) || 'CO'}
                  </span>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#0B0B0F' }}>{j.title}</span>
                      {employmentType && (
                        <span
                          style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#3A3A44',
                            background: '#F1F1F4',
                            borderRadius: '999px',
                            padding: '2px 9px',
                          }}
                        >
                          {employmentType}
                        </span>
                      )}
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
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontWeight: '700', color: '#3A3A44' }}>{j.company.name}</span>
                      {j.location && (
                        <>
                          <span style={{ color: '#D8D8E0' }}>·</span>
                          <span>{j.location}</span>
                        </>
                      )}
                      {j.specializationTag && (
                        <>
                          <span style={{ color: '#D8D8E0' }}>·</span>
                          <span>{j.specializationTag}</span>
                        </>
                      )}
                    </div>
                    {requiredSkills.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {requiredSkills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            style={{
                              fontFamily: 'Inter,sans-serif',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: '#3A3A44',
                              background: '#F1F1F4',
                              borderRadius: '6px',
                              padding: '3px 8px',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {salary && (
                    <span
                      data-jobs-card-salary
                      style={{
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#0B0B0F',
                        flexShrink: '0',
                      }}
                    >
                      {salary}
                    </span>
                  )}
                  <span
                    data-jobs-card-bookmark
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      border: `1px solid ${isSaved ? '#5B4BF5' : '#E7E7EC'}`,
                      background: isSaved ? 'rgba(91,75,245,0.07)' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: '0',
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={isSaved ? '#5B4BF5' : 'none'}
                      stroke={isSaved ? '#5B4BF5' : '#7A7A86'}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <button
                    data-jobs-card-details
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/jobs/${j.id}`);
                    }}
                    style={{
                      height: '38px',
                      padding: '0 16px',
                      border: '1px solid #E7E7EC',
                      borderRadius: '10px',
                      background: '#fff',
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#3A3A44',
                      cursor: 'pointer',
                      flexShrink: '0',
                    }}
                  >
                    Details
                  </button>
                  {applied ? (
                    <span
                      data-jobs-card-cta
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '38px',
                        padding: '0 16px',
                        borderRadius: '999px',
                        background: 'rgba(31,138,91,0.1)',
                        color: '#1F8A5B',
                        fontFamily: "'Space Mono',monospace",
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        flexShrink: '0',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Applied
                    </span>
                  ) : (
                    <button
                      data-jobs-card-cta
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${j.id}`);
                      }}
                      style={{
                        height: '38px',
                        padding: '0 18px',
                        border: 'none',
                        borderRadius: '10px',
                        background: '#0B0B0F',
                        color: '#fff',
                        fontFamily: 'Inter,sans-serif',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        flexShrink: '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m13 2-3 7h4l-3 7" />
                        <path d="M3 12h2" />
                        <path d="M19 12h2" />
                      </svg>
                      Apply
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineStep({
  label,
  value,
  accent,
  showChevron,
}: {
  label: string;
  value: number;
  accent: string;
  showChevron: boolean;
}) {
  return (
    <>
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '7px', padding: '0 6px' }}>
        <span
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: '700',
            fontSize: '30px',
            letterSpacing: '-0.02em',
            color: accent,
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#7A7A86',
          }}
        >
          {label}
        </span>
      </div>
      {showChevron && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D8D8E0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: '0' }}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </>
  );
}

function ListMessage({ children, tone }: { children: React.ReactNode; tone?: 'error' }) {
  return (
    <div
      style={{
        padding: '48px 16px',
        textAlign: 'center',
        borderTop: '1px solid #E7E7EC',
        borderBottom: '1px solid #E7E7EC',
        fontFamily: 'Inter,sans-serif',
        fontSize: '13px',
        color: tone === 'error' ? '#B42E2E' : '#7A7A86',
      }}
    >
      {children}
    </div>
  );
}
