'use client';

import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { useAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { RankBadge } from '@/components/ui/RankBadge';
import { TextInput } from '@/components/ui/TextInput';
import { Stat } from '@/components/ui/Stat';

const RANK_OPTIONS: RankName[] = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
const SPEC_SUGGESTIONS = ['IT Sales', 'Cloud', 'DevTools', 'Cybersec', 'SaaS', 'FinTech', 'Healthcare'];

type Tier = 'BASIC' | 'FEATURED' | 'PREMIUM';

const TIERS: { value: Tier; name: string; price: string; desc: string; apps: string; best?: boolean }[] = [
  { value: 'BASIC',    name: 'Basic',    price: 'Included',  desc: 'Standard placement in jobs feed. Filtered by rank match only.',           apps: '8-15 / week' },
  { value: 'FEATURED', name: 'Featured', price: '₹2,499/wk', desc: 'Pinned to top of jobs feed for 7 days. Spotlight badge.',                 apps: '30-50 / week', best: true },
  { value: 'PREMIUM',  name: 'Premium',  price: '₹9,999/wk', desc: 'Featured + Email blast to matched salespersons + Talent reports.',        apps: '60-100 / week' },
];

interface FormState {
  title: string;
  description: string;
  location: string;
  salaryMinLpa: string;
  salaryMaxLpa: string;
  minRank: RankName;
  specializationTag: string;
  requiredSkillsRaw: string;
  experienceMinYears: string;
  listingTier: Tier;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  location: '',
  salaryMinLpa: '',
  salaryMaxLpa: '',
  minRank: 'Gold',
  specializationTag: '',
  requiredSkillsRaw: '',
  experienceMinYears: '',
  listingTier: 'BASIC',
};

export default function JobPostPage() {
  const router = useRouter();
  useRequireAuth('COMPANY');
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    const skills = form.requiredSkillsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) {
      setSubmitError('Please enter at least one required skill.');
      return;
    }

    const companyId = user?.companyMemberships?.[0]?.companyId;
    if (!companyId) {
      setSubmitError('No company found — please complete company setup first.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const dto = {
        companyId,
        title: form.title.trim(),
        description: form.description.trim(),
        requiredSkills: skills,
        specializationTag: form.specializationTag || SPEC_SUGGESTIONS[0],
        experienceMinYears: form.experienceMinYears ? Number(form.experienceMinYears) : 0,
        location: form.location.trim() || 'Remote',
        salaryMin: form.salaryMinLpa ? Math.round(Number(form.salaryMinLpa) * 100000) : undefined,
        salaryMax: form.salaryMaxLpa ? Math.round(Number(form.salaryMaxLpa) * 100000) : undefined,
        minRank: form.minRank.toUpperCase(),
        listingTier: form.listingTier,
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
              Be specific. Salespersons filter aggressively on title and description.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Title */}
              <div>
                <FieldLabel label="Job title" required />
                <TextInput
                  placeholder="Senior Account Executive — IT Sales"
                  value={form.title}
                  onChange={(v) => set('title', v)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel label="Job description" required hint="Min 10 characters" />
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity unique…"
                  rows={5}
                  style={{
                    ...INPUT_STYLE,
                    resize: 'vertical',
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Required skills */}
              <div>
                <FieldLabel label="Required skills" required hint="Comma-separated, e.g. B2B Sales, Salesforce, Cold Calling" />
                <TextInput
                  placeholder="B2B Sales, Cloud, Account Management"
                  value={form.requiredSkillsRaw}
                  onChange={(v) => set('requiredSkillsRaw', v)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Location */}
                <div>
                  <FieldLabel label="Location" />
                  <TextInput
                    placeholder="Bangalore"
                    value={form.location}
                    onChange={(v) => set('location', v)}
                  />
                </div>

                {/* Min experience */}
                <div>
                  <FieldLabel label="Min experience (years)" />
                  <TextInput
                    placeholder="3"
                    type="number"
                    value={form.experienceMinYears}
                    onChange={(v) => set('experienceMinYears', v)}
                  />
                </div>

                {/* Salary */}
                <div>
                  <FieldLabel label="Min CTC (LPA)" />
                  <TextInput
                    placeholder="18"
                    type="number"
                    value={form.salaryMinLpa}
                    onChange={(v) => set('salaryMinLpa', v)}
                  />
                </div>
                <div>
                  <FieldLabel label="Max CTC (LPA)" />
                  <TextInput
                    placeholder="28"
                    type="number"
                    value={form.salaryMaxLpa}
                    onChange={(v) => set('salaryMaxLpa', v)}
                  />
                </div>
              </div>

              {/* Min rank */}
              <div>
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

              {/* Specialization tag — single select */}
              <div>
                <FieldLabel label="Specialization" hint="Pick one" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {SPEC_SUGGESTIONS.map((tag) => (
                    <Chip
                      key={tag}
                      active={form.specializationTag === tag}
                      color="var(--cool)"
                      onClick={() => set('specializationTag', form.specializationTag === tag ? '' : tag)}
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
                disabled={submitting || !form.title.trim() || !form.description.trim()}
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

          {/* Listing tiers */}
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>Listing tier</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIERS.map((t) => {
                const selected = form.listingTier === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('listingTier', t.value)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      borderColor: selected ? 'var(--cool)' : t.best ? 'color-mix(in oklch, var(--cool) 45%, var(--border-soft))' : 'var(--border-soft)',
                      borderWidth: selected ? 2 : 1,
                      borderStyle: 'solid',
                      background: selected
                        ? 'color-mix(in oklch, var(--cool) 12%, var(--surface))'
                        : t.best
                          ? 'color-mix(in oklch, var(--cool) 5%, var(--surface))'
                          : 'var(--surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {t.best && !selected && (
                      <div style={{ fontSize: 10, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                        RECOMMENDED
                      </div>
                    )}
                    {selected && (
                      <div style={{ fontSize: 10, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>
                        ✓ SELECTED
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
                  </button>
                );
              })}
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
