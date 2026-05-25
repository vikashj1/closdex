'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { ApiError, JobSummary, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

interface ApplicationRow { id: string; status: string; job: JobSummary; createdAt: string }

export default function JobsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const [jRes, aRes] = await Promise.allSettled([
      api.jobs.list({ perPage: 30 }),
      api.applications.mine(),
    ]);
    if (jRes.status === 'fulfilled') setJobs(jRes.value.items);
    else setError(jRes.reason instanceof ApiError ? jRes.reason.message : 'Could not load jobs.');
    if (aRes.status === 'fulfilled') setApps(aRes.value);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  async function apply(jobId: string) {
    setApplying(jobId);
    try {
      await api.jobs.apply(jobId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Apply failed.');
    } finally {
      setApplying(null);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  const appByJob = new Map(apps.map((a) => [a.job.id, a]));
  const pipeline = [
    { l: 'Applied',     v: apps.filter((a) => a.status === 'APPLIED').length,     c: 'var(--cool)' },
    { l: 'Viewed',      v: apps.filter((a) => a.status === 'VIEWED').length,      c: 'var(--text-dim)' },
    { l: 'Shortlisted', v: apps.filter((a) => a.status === 'SHORTLISTED').length, c: 'var(--gold)' },
    { l: 'Interview',   v: apps.filter((a) => a.status === 'INTERVIEW').length,   c: 'var(--text-mute)' },
    { l: 'Offer',       v: apps.filter((a) => a.status === 'OFFER').length,       c: 'var(--emerald)' },
  ];

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>Jobs for you</h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
            {loading ? 'Loading…' : `${jobs.length} active listings`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="ghost" size="sm" icon={<Icon.filter />}>Filters</Btn>
          <Btn kind="ghost" size="sm">Applications ({apps.length})</Btn>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 18,
            padding: '10px 12px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--d-expert) 35%, transparent)',
            color: 'var(--d-expert)',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      )}

      <Card padding={18} style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Your application pipeline
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {pipeline.map((s) => (
            <div key={s.l} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-2)', borderLeft: `3px solid ${s.c}` }}>
              <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {loading ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>
          No active job listings.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((j) => {
            const existing = appByJob.get(j.id);
            const initials = j.company.name
              .split(/\s+/)
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            return (
              <Card key={j.id} padding={20} hover>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 12, background: 'var(--bg-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: 'var(--text)',
                      border: '1px solid var(--border-soft)',
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>{j.title}</h3>
                      {existing && (
                        <span
                          style={{
                            ...BADGE,
                            color: 'var(--cool)',
                            background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                            border: '1px solid color-mix(in oklch, var(--cool) 35%, transparent)',
                          }}
                        >
                          {existing.status}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-dim)', flexWrap: 'wrap', marginBottom: 8 }}>
                      <span><strong style={{ color: 'var(--text)' }}>{j.company.name}</strong></span>
                      {j.location && <span>• {j.location}</span>}
                      {j.workMode && <span>• {j.workMode}</span>}
                      {j.specializationTags.length > 0 && (
                        <span>• {j.specializationTags.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                    {(j.ctcMin || j.ctcMax) && (
                      <span
                        style={{
                          ...BADGE,
                          color: 'var(--emerald)',
                          background: 'color-mix(in oklch, var(--emerald) 12%, transparent)',
                          border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
                        }}
                      >
                        ₹{(j.ctcMin ?? 0).toLocaleString()} – ₹{(j.ctcMax ?? 0).toLocaleString()} LPA
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <Btn kind="ghost" size="sm" onClick={() => router.push(`/jobs/${j.id}`)}>
                      Details
                    </Btn>
                    {existing ? (
                      <Btn kind="secondary" size="sm">View status</Btn>
                    ) : (
                      <Btn
                        kind="primary"
                        size="sm"
                        icon={<Icon.arrow />}
                        onClick={() => apply(j.id)}
                        disabled={applying === j.id}
                      >
                        {applying === j.id ? 'Applying…' : 'Apply 1-click'}
                      </Btn>
                    )}
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

const BADGE: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
