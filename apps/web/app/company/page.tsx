'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, JobSummary, TalentSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';

const ACTIVITY = [
  { t: 'Karan Mehta applied',            role: 'Senior AE — IT Sales',           time: '23m ago', c: 'var(--cool)' },
  { t: 'You shortlisted Priya Iyer',     role: 'Enterprise AE',                  time: '2h ago',  c: 'var(--gold)' },
  { t: 'Interview scheduled with Aarav', role: 'Senior AE — IT Sales · Fri 4pm', time: '5h ago',  c: 'var(--emerald)' },
  { t: 'Sneha Reddy declined offer',     role: 'Mid-Market AE',                  time: '1d ago',  c: 'var(--text-dim)' },
  { t: 'Job posted: SDR Manager',        role: '₹2,499/wk Featured tier',        time: '2d ago',  c: 'var(--text-mute)' },
];

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [candidates, setCandidates] = useState<TalentSummary[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyName = user?.companyMemberships?.[0]?.company.name ?? 'Your Company';

  useEffect(() => {
    if (authLoading || !user) return;
    setDataLoading(true);
    setError(null);

    Promise.all([
      api.jobs.list({ perPage: 50 }),
      api.talent.search({ perPage: 5 }),
    ])
      .then(([jobsRes, talentRes]) => {
        setJobs(jobsRes.items);
        setCandidates(talentRes.items);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard data.');
      })
      .finally(() => setDataLoading(false));
  }, [authLoading, user]);

  if (authLoading || dataLoading) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED' || j.status === 'ACTIVE');

  const KPIS = [
    { l: 'Active job postings',      v: String(activeJobs.length),  sub: `of ${jobs.length} total`,       c: 'var(--text)' },
    { l: 'New applications',         v: '47',                        sub: 'this week',                     c: 'var(--cool)' },
    { l: 'Shortlisted candidates',   v: '12',                        sub: 'across all roles',              c: 'var(--gold)' },
    { l: 'Hires this quarter',       v: '2',                         sub: '₹1.5L commission paid',         c: 'var(--emerald)' },
  ];

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>
            {companyName} · Talent Hub
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 13.5 }}>
            {activeJobs.length} active role{activeJobs.length !== 1 ? 's' : ''} · {candidates.length} candidates in pool
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="secondary" size="md" onClick={() => router.push('/company/talent')}>
            Browse leaderboard
          </Btn>
          <Btn kind="primary" size="md" icon={<Icon.briefcase />} onClick={() => router.push('/company/jobs/new')}>
            Post a job
          </Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {KPIS.map((k) => (
          <Card key={k.l} padding={18}>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {k.l}
            </div>
            <div className="display mono" style={{ fontSize: 30, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Top candidates */}
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Top recommended candidates</h3>
            <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>Top {candidates.length} in pool</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {candidates.map((c) => {
              const rankName = rankFromEnum(c.rank);
              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/company/talent/${encodeURIComponent(c.publicSlug)}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1.5fr 90px auto auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border-soft)',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar name={c.user.name} size={36} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.user.name}</span>
                      {c.openToWork && (
                        <span
                          style={{
                            fontSize: 9.5,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                            color: 'var(--emerald)',
                            fontWeight: 700,
                          }}
                        >
                          OPEN
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                      {c.location ?? 'Location unknown'}
                      {c.experienceYears != null ? ` · ${c.experienceYears}y exp` : ''}
                    </div>
                  </div>
                  <RankBadge rank={rankName} size={18} showLabel />
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {c.totalPoints.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                    {c.specializationTags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--surface-2)',
                          color: 'var(--text-dim)',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {candidates.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-mute)', padding: '20px 0', textAlign: 'center' }}>
                No candidates found in the talent pool yet.
              </div>
            )}
          </div>
        </Card>

        {/* Activity */}
        <Card padding={22}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: a.c, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.t}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{a.role}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Active jobs list */}
      {activeJobs.length > 0 && (
        <Card padding={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Active postings</h3>
            <Btn kind="ghost" size="sm" onClick={() => router.push('/company/jobs/new')}>+ Post new role</Btn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{job.title}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-mute)', marginLeft: 10 }}>
                    {job.location ?? 'Remote'} · {job.workMode ?? 'Any'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {job.ctcMin != null && job.ctcMax != null && (
                    <span className="mono" style={{ fontSize: 12, color: 'var(--emerald)' }}>
                      ₹{job.ctcMin}–{job.ctcMax} LPA
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                      color: 'var(--cool)',
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
