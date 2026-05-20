'use client';

import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { RankBadge } from '@/components/ui/RankBadge';
import { TextInput } from '@/components/ui/TextInput';
import { Stat } from '@/components/ui/Stat';
import { Icon } from '@/components/ui/Icon';

const RANK_OPTIONS: RankName[] = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'] as const;
const SPEC_SUGGESTIONS = ['IT Sales', 'Cloud', 'DevTools', 'Cybersec', 'SaaS', 'FinTech', 'Healthcare'];

const TIERS = [
  { name: 'Basic',    price: 'Included',  desc: 'Standard placement in jobs feed. Filtered by rank match only.',           apps: '8-15 / week' },
  { name: 'Featured', price: '₹2,499/wk', desc: 'Pinned to top of jobs feed for 7 days. Spotlight badge.',                 apps: '30-50 / week', best: true },
  { name: 'Premium',  price: '₹9,999/wk', desc: 'Featured + Email blast to matched salespersons + Talent reports.',        apps: '60-100 / week' },
];

interface FormState {
  title: string;
  location: string;
  workMode: string;
  ctcMin: string;
  ctcMax: string;
  minRank: RankName;
  specializationTags: string[];
  experienceMin: string;
}

const EMPTY: FormState = {
  title: '',
  location: '',
  workMode: 'Remote',
  ctcMin: '',
  ctcMax: '',
  minRank: 'Gold',
  specializationTags: [],
  experienceMin: '',
};

export default function JobPostPage() {
  const router = useRouter();
  useRequireAuth('COMPANY');

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleTag(tag: string) {
    set(
      'specializationTags',
      form.specializationTags.includes(tag)
        ? form.specializationTags.filter((t) => t !== tag)
        : [...form.specializationTags, tag],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const dto = {
        title: form.title.trim(),
        location: form.location.trim() || undefined,
        workMode: form.workMode || undefined,
        ctcMin: form.ctcMin ? Number(form.ctcMin) : undefined,
        ctcMax: form.ctcMax ? Number(form.ctcMax) : undefined,
        minRank: form.minRank.toUpperCase(),
        specializationTags: form.specializationTags.length > 0 ? form.specializationTags : undefined,
        experienceMin: form.experienceMin ? Number(form.experienceMin) : undefined,
      };

      const newJob = await api.jobs.create(dto);
      await api.jobs.publish(newJob.id);
      router.push('/company');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to post job. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Post a new role</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Fill in the details below. The job will go live immediately after posting.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        <form onSubmit={handleSubmit}>
          <Card padding={28}>
            <h2 className="display" style={{ fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Job details</h2>
            <p style={{ color: 'var(--text-dim)', margin: '0 0 22px', fontSize: 13 }}>
              Be specific. Salespersons filter aggressively on title and CTC.
            </p>

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

              {/* Work mode */}
              <div>
                <FieldLabel label="Work mode" />
                <select
                  style={INPUT_STYLE}
                  value={form.workMode}
                  onChange={(e) => set('workMode', e.target.value)}
                >
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* CTC */}
              <div>
                <FieldLabel label="Min CTC (LPA)" />
                <TextInput
                  placeholder="18"
                  type="number"
                  value={form.ctcMin}
                  onChange={(v) => set('ctcMin', v)}
                />
              </div>
              <div>
                <FieldLabel label="Max CTC (LPA)" />
                <TextInput
                  placeholder="28"
                  type="number"
                  value={form.ctcMax}
                  onChange={(v) => set('ctcMax', v)}
                />
              </div>

              {/* Min experience */}
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldLabel label="Minimum experience (years)" />
                <TextInput
                  placeholder="3"
                  type="number"
                  value={form.experienceMin}
                  onChange={(v) => set('experienceMin', v)}
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

              {/* Specialization tags */}
              <div style={{ gridColumn: '1 / -1' }}>
                <FieldLabel label="Specialization tags" hint="Select all that apply" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {SPEC_SUGGESTIONS.map((tag) => (
                    <Chip
                      key={tag}
                      active={form.specializationTags.includes(tag)}
                      color="var(--cool)"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
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
              <Btn kind="ghost" type="button" onClick={() => router.push('/company')}>
                Cancel
              </Btn>
              <Btn
                kind="primary"
                type="submit"
                disabled={submitting || !form.title.trim()}
                style={{ background: 'var(--cool)', color: 'white', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Posting…' : 'Publish job'}
              </Btn>
            </div>
          </Card>
        </form>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
          {/* Estimated reach */}
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>Estimated reach</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Stat label="Matching candidates"          value="312"     accent="var(--cool)"    sub="Gold+ in pool" />
              <Stat label="Currently open to work"       value="89"      accent="var(--emerald)" sub="of matching pool" />
              <Stat label="Avg time to first applicant"  value="4h"      sub="for Featured tier" />
              <Stat label="Avg time to first hire"       value="18 days" sub="across all customers" />
            </div>
          </Card>

          {/* Listing tiers — visual only */}
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>Listing tiers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    borderColor: t.best ? 'var(--cool)' : 'var(--border-soft)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    background: t.best
                      ? 'color-mix(in oklch, var(--cool) 8%, var(--surface))'
                      : 'var(--surface)',
                  }}
                >
                  {t.best && (
                    <div style={{ fontSize: 10, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                      RECOMMENDED
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span className="display" style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--cool)' }}>{t.price}</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '0 0 6px', lineHeight: 1.5 }}>{t.desc}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                    Est. applicants: <strong style={{ color: 'var(--text)' }}>{t.apps}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={18} style={{ background: 'var(--bg-2)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text)' }}>Placement commission:</strong> 10% of first-year CTC on confirmed hires. 90-day replacement guarantee.
            </div>
          </Card>
        </div>
      </div>
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
