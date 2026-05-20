'use client';

import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import { DIFFICULTY } from '@/lib/constants';

/** Detail page is stubbed with "The Skeptical CTO" content for now. Slice 8
 *  (API wiring) will pull the row by `params.id` from `GET /api/challenges/:id`. */
export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div style={{ padding: '24px 32px' }}>
      <button
        onClick={() => router.push('/challenges')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 12.5,
          marginBottom: 14,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Icon.arrow /></span> Back to challenges
      </button>

      {/* Header strip */}
      <Card padding={0} style={{ overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ height: 5, background: DIFFICULTY.Hard.color }} />
        <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <DifficultyTag level="Hard" />
              <span
                style={{
                  ...BADGE_BASE,
                  color: 'var(--gold)',
                  background: 'color-mix(in oklch, var(--gold) 14%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--gold) 35%, transparent)',
                }}
              >
                ★ Challenge of the Day
              </span>
              <span style={{ fontSize: 11.5, color: 'var(--text-mute)', fontFamily: 'JetBrains Mono' }}>
                CHL-{String(params.id).padStart(3, '0')} · IT_SALES
              </span>
            </div>
            <h1 className="display" style={{ fontSize: 32, margin: '0 0 8px', fontWeight: 700, letterSpacing: '-0.025em' }}>
              The Skeptical CTO
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: 0, fontSize: 14.5, lineHeight: 1.5, maxWidth: 720 }}>
              You&apos;re an Account Executive at LumenLogs, a DevOps observability platform. Your task: convince
              Meera Krishnan, CTO at Vector Pay, to commit to a 30-minute discovery call this week. She&apos;s burned
              by two previous tools.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display mono" style={{ fontSize: 38, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>+480</div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>base × goal mult</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.user /> Lead persona</h3>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <Avatar name="Meera Krishnan" size={56} color="oklch(0.55 0.14 290)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Meera Krishnan</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>CTO · Vector Pay (Series B Fintech, 180 engineers)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 16, fontSize: 12.5, color: 'var(--text-dim)' }}>
              <div><strong style={{ color: 'var(--text)' }}>Personality:</strong> Direct, time-poor, comparison-shopping. Replies in 1-2 sentences. Doesn&apos;t suffer hype.</div>
              <div><strong style={{ color: 'var(--text)' }}>Pain points:</strong> Last tool flooded with alerts. Eng wasted 14 hours on tuning. Compliance audit due in 8 weeks.</div>
              <div><strong style={{ color: 'var(--text)' }}>Likely objections:</strong> Pricing vs Datadog, migration effort, vendor lock-in, log volume cost.</div>
              <div><strong style={{ color: 'var(--text)' }}>Decision criteria:</strong> Time-to-value, integration speed, predictable pricing, SOC2.</div>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.target /> Your goal</h3>
            <div
              style={{
                padding: '14px 16px',
                background: 'color-mix(in oklch, var(--gold) 10%, transparent)',
                border: '1px solid color-mix(in oklch, var(--gold) 30%, transparent)',
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--gold)', marginBottom: 6 }}>
                Book a 30-minute discovery call.
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                Lead must explicitly agree to a specific time slot. Vague &quot;let me think about it&quot; doesn&apos;t count.
              </div>
            </div>
            <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-dim)' }}>
              <strong style={{ color: 'var(--text)' }}>Success criteria (evaluated by AI):</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                <li>Uncovers at least 2 pain points through open-ended questions</li>
                <li>Addresses pricing objection with empathy + evidence</li>
                <li>Differentiates from named competitors without disparaging</li>
                <li>Proposes specific time options, not &quot;when works for you?&quot;</li>
              </ul>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.clock /> Constraints</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 8 }}>
              {[
                { lbl: 'Time limit',       val: '15 minutes',  sub: 'Soft timer' },
                { lbl: 'Message limit',    val: '25 messages', sub: 'Pre-counted in UI' },
                { lbl: 'Attempts allowed', val: '3',           sub: 'Decay 100% / 70% / 49%' },
              ].map((c) => (
                <div key={c.lbl}>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.lbl}</div>
                  <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{c.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.bolt /> Scoring breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {[
                { l: 'Base points',          v: '400',       note: 'Hard tier' },
                { l: '× Goal multiplier',    v: '1.2x',      note: 'Book Discovery Call' },
                { l: '× Quality multiplier', v: '0.0 – 1.0', note: '5-dimension AI rubric' },
                { l: '+ Speed bonus',        v: '+10% base', note: 'If < 60% messages used' },
                { l: '+ First-try bonus',    v: '+15% base', note: 'Cleared on attempt 1' },
                { l: '− Spam penalty',       v: '−50',       note: 'Pushy/unsolicited' },
              ].map((r) => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 8, borderBottom: '1px dashed var(--border-soft)' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.l}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{r.note}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 14, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>Max possible</div>
              <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>~622 pts</div>
            </div>
          </Card>

          <Card padding={22}>
            <h3 className="display" style={DET_H}><Icon.book /> Related tutorials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {[
                'MEDDIC for SaaS discovery calls',
                'Handling pricing objections without flinching',
                'Differentiation patterns vs Datadog/New Relic',
              ].map((t) => (
                <a
                  key={t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: 'var(--bg-2)',
                    fontSize: 12.5,
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <Icon.book />{t}<span style={{ marginLeft: 'auto', color: 'var(--text-mute)' }}>→</span>
                </a>
              ))}
            </div>
          </Card>

          <Card
            padding={20}
            style={{
              background: 'color-mix(in oklch, var(--gold) 12%, var(--surface))',
              borderColor: 'color-mix(in oklch, var(--gold) 30%, transparent)',
            }}
          >
            <Btn kind="primary" full size="lg" icon={<Icon.bolt />} onClick={() => router.push(`/play/${params.id}`)}>
              Start challenge
            </Btn>
            <Btn kind="ghost" full size="md" style={{ marginTop: 10 }}>Save for later</Btn>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', textAlign: 'center', marginTop: 12 }}>
              Once started, abandoning costs −25 pts.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const DET_H: CSSProperties = {
  fontSize: 13,
  margin: '0 0 4px',
  fontWeight: 600,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const BADGE_BASE: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
