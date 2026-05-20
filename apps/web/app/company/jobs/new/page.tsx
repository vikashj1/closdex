'use client';

import { CSSProperties, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { Field } from '@/components/ui/Field';
import { TextInput } from '@/components/ui/TextInput';
import { Stat } from '@/components/ui/Stat';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';

const STEPS = ['Job details', 'Requirements', 'Listing tier', 'Review'] as const;
const RANKS: RankName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];

const TIERS = [
  { name: 'Basic',    price: 'Included',  desc: 'Standard placement in jobs feed. Filtered by rank match only.', apps: '8-15 / week' },
  { name: 'Featured', price: '₹2,499/wk', desc: 'Pinned to top of jobs feed for 7 days. Spotlight badge.',       apps: '30-50 / week', best: true },
  { name: 'Premium',  price: '₹9,999/wk', desc: 'Featured + Email blast to matched salespersons + Talent reports.', apps: '60-100 / week' },
];

export default function JobPostPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Post a new role</h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
          Step {step} of {STEPS.length} — your Growth plan includes 5 active postings (0 used)
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: 10, marginBottom: 22 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 4, borderRadius: 999, background: i < step ? 'var(--cool)' : 'var(--surface-2)' }} />
            <div style={{ fontSize: 11.5, color: i < step ? 'var(--cool)' : 'var(--text-mute)', fontWeight: 600 }}>
              <span className="mono">{String(i + 1).padStart(2, '0')} </span>{s}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
        <Card padding={28}>
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <Btn kind="ghost" onClick={() => (step > 1 ? setStep(step - 1) : router.push('/company'))}>
              Back
            </Btn>
            <Btn
              kind="primary"
              icon={<Icon.arrow />}
              onClick={() => (step < STEPS.length ? setStep(step + 1) : router.push('/company'))}
              style={{ background: 'var(--cool)', color: 'white' }}
            >
              {step < STEPS.length ? 'Continue' : 'Publish job (₹2,499)'}
            </Btn>
          </div>
        </Card>

        {/* Side preview */}
        <div style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>Estimated reach</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Stat label="Matching candidates"    value="312"     accent="var(--cool)"    sub="Gold+ in Bangalore" />
              <Stat label="Currently 'Open to work'" value="89"    accent="var(--emerald)" sub="of matching pool" />
              <Stat label="Avg time to first applicant" value="4h" sub="for Featured tier" />
              <Stat label="Avg time to first hire"  value="18 days" sub="across Growth tier customers" />
            </div>
          </Card>
          <Card padding={18} style={{ marginTop: 14, background: 'var(--bg-2)' }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--text)' }}>Placement commission:</strong> 10% of first-year CTC on confirmed hires (Growth subscriber rate). 90-day replacement guarantee.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Step1() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Job details</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 22px', fontSize: 13 }}>
        Be specific. Salespersons filter aggressively on title and CTC.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Job title" required>
            <TextInput placeholder="Senior Account Executive — IT Sales" />
          </Field>
        </div>
        <Field label="Location" required>
          <TextInput placeholder="Bangalore" />
        </Field>
        <Field label="Employment type" required>
          <select style={INPUT_STYLE}>
            <option>Full-time</option>
            <option>Contract</option>
            <option>Part-time</option>
          </select>
        </Field>
        <Field label="Min CTC (LPA)">
          <TextInput placeholder="18" />
        </Field>
        <Field label="Max CTC (LPA)">
          <TextInput placeholder="24" />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Variable / OTE" hint="Helps Sales talent assess earning ceiling">
            <TextInput placeholder="30% of fixed, uncapped" />
          </Field>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Job description" required>
            <textarea
              rows={5}
              style={{ ...INPUT_STYLE, resize: 'vertical' }}
              placeholder="What will this person do? Who will they sell to? What's the team like?"
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function Step2() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Requirements</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 22px', fontSize: 13 }}>
        Set minimum rank threshold to filter your pipeline up-front.
      </p>
      <Field label="Minimum rank threshold" required hint="Only candidates at this rank or above can apply">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {RANKS.map((r) => (
            <button
              key={r}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: r === 'Gold' ? 'color-mix(in oklch, var(--cool) 18%, transparent)' : 'var(--bg-2)',
                border: `1px solid ${r === 'Gold' ? 'var(--cool)' : 'var(--border)'}`,
                color: r === 'Gold' ? 'var(--cool)' : 'var(--text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <RankBadge rank={r} size={14} />
              {r}+
            </button>
          ))}
        </div>
      </Field>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Experience required" required>
          <TextInput placeholder="3-6 years" />
        </Field>
        <Field label="Specializations" required>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['IT Sales', 'Cloud', 'DevTools', 'Cybersec'].map((s, i) => (
              <Chip key={s} active={i < 2} color="var(--cool)">{s} {i < 2 && '✕'}</Chip>
            ))}
            <Chip>+ Add</Chip>
          </div>
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Required goal-type performance" hint="Candidate must have completed challenges of this type">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Book Discovery Call', 'Send Proposal', 'Reach Decision-Maker'].map((g, i) => (
                <Chip key={g} active={i === 0} color="var(--cool)">{g} {i === 0 && '✕'}</Chip>
              ))}
            </div>
          </Field>
        </div>
      </div>
    </>
  );
}

function Step3() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Choose your listing tier</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 22px', fontSize: 13 }}>
        Featured postings get 4x more qualified applicants on average.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {TIERS.map((t) => (
          <Card
            key={t.name}
            padding={18}
            style={{
              borderColor: t.best ? 'var(--cool)' : 'var(--border-soft)',
              background: t.best ? 'color-mix(in oklch, var(--cool) 8%, var(--surface))' : 'var(--surface)',
            }}
          >
            {t.best && <div style={{ fontSize: 10, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>★ RECOMMENDED</div>}
            <h4 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>{t.name}</h4>
            <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--cool)', margin: '8px 0' }}>
              {t.price}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, margin: '0 0 12px' }}>{t.desc}</p>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
              Est. applicants: <strong style={{ color: 'var(--text)' }}>{t.apps}</strong>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Step4() {
  return (
    <>
      <h2 className="display" style={{ fontSize: 22, margin: '0 0 6px', fontWeight: 700 }}>Preview &amp; publish</h2>
      <p style={{ color: 'var(--text-dim)', margin: '0 0 22px', fontSize: 13 }}>This is what salespersons will see.</p>
      <Card padding={18} style={{ background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, oklch(0.55 0.15 240), oklch(0.45 0.12 200))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontFamily: 'Space Grotesk',
            }}
          >
            RP
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <h4 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Senior Account Executive — IT Sales</h4>
              <span
                style={{
                  ...BADGE,
                  color: 'var(--gold)',
                  background: 'color-mix(in oklch, var(--gold) 14%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--gold) 35%, transparent)',
                }}
              >
                ★ Featured
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>Razorpay · Bangalore · Full-time · 3-6 yrs</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span
                style={{
                  ...BADGE,
                  color: 'var(--emerald)',
                  background: 'color-mix(in oklch, var(--emerald) 12%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
                }}
              >
                ₹18-24 LPA + 30% OTE
              </span>
              <span style={{ ...BADGE, color: 'var(--text-dim)', background: 'var(--bg)', border: '1px solid var(--border-soft)' }}>
                <RankBadge rank="Gold" size={12} /> Gold+ required
              </span>
            </div>
          </div>
        </div>
      </Card>
      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 10,
          background: 'color-mix(in oklch, var(--cool) 10%, transparent)',
          border: '1px solid color-mix(in oklch, var(--cool) 25%, transparent)',
          fontSize: 12.5,
          color: 'var(--text-dim)',
        }}
      >
        <strong style={{ color: 'var(--cool)' }}>Listing tier:</strong> Featured (₹2,499/wk) · Charged to card ending in 4242 on publish.
      </div>
    </>
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

const BADGE: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
