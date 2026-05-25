'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, JobSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { RankBadge } from '@/components/ui/RankBadge';
import { TextInput } from '@/components/ui/TextInput';

const RANK_OPTIONS: RankName[] = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
const SPEC_SUGGESTIONS = ['IT Sales', 'Cloud', 'DevTools', 'Cybersec', 'SaaS', 'FinTech', 'Healthcare'];

interface FormState {
  title: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  minRank: RankName;
  specializationTag: string;
  experienceMinYears: string;
}

export default function JobEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  useRequireAuth('COMPANY');

  const [job, setJob] = useState<JobSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    api.jobs.get(jobId)
      .then((j) => {
        setJob(j);
        setForm({
          title: j.title ?? '',
          location: j.location ?? '',
          salaryMin: j.salaryMin != null ? String(j.salaryMin) : '',
          salaryMax: j.salaryMax != null ? String(j.salaryMax) : '',
          minRank: j.minRank
            ? ((j.minRank.charAt(0) + j.minRank.slice(1).toLowerCase()) as RankName)
            : 'Gold',
          specializationTag: j.specializationTag ?? '',
          experienceMinYears: j.experienceMinYears != null ? String(j.experienceMinYears) : '',
        });
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : 'Could not load job.');
      });
  }, [jobId]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => prev ? { ...prev, [k]: v } : prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !jobId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.jobs.update(jobId, {
        title: form.title.trim() || undefined,
        location: form.location.trim() || undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        minRank: form.minRank.toUpperCase(),
        specializationTag: form.specializationTag || undefined,
        experienceMinYears: form.experienceMinYears ? Number(form.experienceMinYears) : undefined,
      });
      router.push('/company/jobs');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to save changes.');
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        {loadError}
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ padding: 32, color: 'var(--text-mute)', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 700 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Edit job</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Changes take effect immediately. Status transitions (pause/close/repost) are on the jobs list.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card padding={28}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel label="Job title" required />
              <TextInput
                placeholder="Senior Account Executive — IT Sales"
                value={form.title}
                onChange={(v) => set('title', v)}
                required
              />
            </div>

            {/* Location */}
            <div>
              <FieldLabel label="Location" />
              <TextInput
                placeholder="Bangalore"
                value={form.location}
                onChange={(v) => set('location', v)}
              />
            </div>

            {/* Specialization tag */}
            <div>
              <FieldLabel label="Specialization" />
              <select
                style={INPUT_STYLE}
                value={form.specializationTag}
                onChange={(e) => set('specializationTag', e.target.value)}
              >
                <option value="">— none —</option>
                {SPEC_SUGGESTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <FieldLabel label="Min CTC (LPA)" />
              <TextInput
                placeholder="18"
                type="number"
                value={form.salaryMin}
                onChange={(v) => set('salaryMin', v)}
              />
            </div>
            <div>
              <FieldLabel label="Max CTC (LPA)" />
              <TextInput
                placeholder="28"
                type="number"
                value={form.salaryMax}
                onChange={(v) => set('salaryMax', v)}
              />
            </div>

            {/* Min experience */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel label="Minimum experience (years)" />
              <TextInput
                placeholder="3"
                type="number"
                value={form.experienceMinYears}
                onChange={(v) => set('experienceMinYears', v)}
              />
            </div>

            {/* Min rank */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FieldLabel label="Minimum rank threshold" hint="Only candidates at this rank or above can apply" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {RANK_OPTIONS.map((r) => {
                  const active = form.minRank === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set('minRank', r)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: active ? 'color-mix(in oklch, var(--cool) 18%, transparent)' : 'var(--bg-2)',
                        border: `1px solid ${active ? 'var(--cool)' : 'var(--border)'}`,
                        color: active ? 'var(--cool)' : 'var(--text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <RankBadge rank={r} size={14} />
                      {r}+
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {submitError && (
            <div
              style={{
                marginTop: 16,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'color-mix(in oklch, red 12%, transparent)',
                border: '1px solid color-mix(in oklch, red 30%, transparent)',
                color: 'var(--text-dim)',
                fontSize: 13,
              }}
            >
              {submitError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <Btn kind="ghost" type="button" onClick={() => router.push('/company/jobs')}>
              Cancel
            </Btn>
            <Btn
              kind="primary"
              type="submit"
              disabled={submitting || !form.title.trim()}
              style={{ background: 'var(--cool)', color: 'white', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </Btn>
          </div>
        </Card>
      </form>
    </div>
  );
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)' }}>
        {label}
        {required && <span style={{ color: 'var(--cool)', marginLeft: 3 }}>*</span>}
      </span>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-mute)', marginLeft: 8 }}>{hint}</span>}
    </div>
  );
}

const INPUT_STYLE: CSSProperties = {
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13.5,
  color: 'var(--text)',
  width: '100%',
};
