'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';

const DIMS = [
  { l: 'Discovery & Listening',     v: 4 },
  { l: 'Objection Handling',        v: 5 },
  { l: 'Value Articulation',        v: 4 },
  { l: 'Conversational Quality',    v: 5 },
  { l: 'Goal Execution',            v: 4 },
];

export default function ResultPage() {
  const router = useRouter();
  const total = DIMS.reduce((s, d) => s + d.v, 0);
  const qMult = total / 25;
  const baseScore = Math.round(400 * 1.2 * qMult);
  const speedBonus = 40;
  const firstTryBonus = 60;
  const final = baseScore + speedBonus + firstTryBonus;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '16px 0 36px', animation: 'fadeUp 0.4s ease' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
            color: 'var(--emerald)',
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 18,
            border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
          }}
        >
          <Icon.check /> GOAL ACHIEVED
        </div>
        <div className="display" style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--gold)' }}>
          +{final}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 8 }}>
          points earned · pushes you from #34 → #27 weekly
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Breakdown */}
        <Card padding={24}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Score breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
            {[
              { l: 'Base (Hard)',                   v: 400 },
              { l: '× Goal multiplier (Book Call)', v: '1.2x' },
              { l: '× Quality multiplier',          v: qMult.toFixed(2) + 'x' },
              { l: '= Base score',                  v: baseScore, em: true },
              { l: '+ Speed bonus (12/25 msgs)',    v: '+' + speedBonus },
              { l: '+ First-try bonus',             v: '+' + firstTryBonus },
              { l: '− Penalties',                   v: '0' },
            ].map((r) => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-soft)' }}>
                <span style={{ color: r.em ? 'var(--text)' : 'var(--text-dim)', fontWeight: r.em ? 700 : 400 }}>{r.l}</span>
                <span className="mono" style={{ fontWeight: 700, color: r.em ? 'var(--gold)' : 'var(--text)' }}>{r.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
              <span style={{ fontWeight: 700 }}>Final score</span>
              <span className="display mono" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 22 }}>{final}</span>
            </div>
          </div>
        </Card>

        {/* Radar */}
        <Card padding={24}>
          <h3 className="display" style={{ fontSize: 16, margin: '0 0 16px', fontWeight: 600 }}>Quality radar</h3>
          <RubricRadar dims={DIMS} />
        </Card>
      </div>

      {/* AI feedback */}
      <Card padding={24}>
        <h3 className="display" style={{ fontSize: 16, margin: '0 0 18px', fontWeight: 600 }}>AI coach feedback</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              What went well
            </div>
            {[
              'Strong open: led with a specific pain (alert fatigue) instead of feature talk.',
              "Handled the 'why not Datadog' objection with a concrete data point (log volume cost), no disparagement.",
              'Proposed two specific time slots — exactly what Meera responds to.',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--emerald)', marginTop: 2 }}><Icon.check /></span>{t}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--d-hard)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Gaps to close
            </div>
            {[
              "Missed an opening to dig into the SOC2 timeline — that's a procurement hook.",
              "Used 'platform' twice. Meera explicitly flagged this. Watch for prospect-allergic words.",
              "Didn't ask about her team's existing tool budget cycle — affects deal sizing later.",
            ].map((t) => (
              <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--d-hard)', marginTop: 2 }}>→</span>{t}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => router.push('/challenges')}>Next recommended</Btn>
        <Btn kind="secondary" size="lg" onClick={() => router.push('/dashboard')}>Back to dashboard</Btn>
        <Btn kind="ghost" size="lg" icon={<Icon.linkedin />}>Share on LinkedIn</Btn>
      </div>
    </div>
  );
}

function RubricRadar({ dims }: { dims: { l: string; v: number }[] }) {
  const cx = 130;
  const cy = 130;
  const r = 90;
  const n = dims.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * (v / 5),
    cy + Math.sin(angle(i)) * r * (v / 5),
  ];
  const poly = dims.map((d, i) => pt(i, d.v).join(',')).join(' ');

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <polygon
            key={lvl}
            points={dims.map((d, i) => pt(i, lvl).join(',')).join(' ')}
            fill="none"
            stroke="var(--border-soft)"
            strokeWidth="0.8"
          />
        ))}
        {dims.map((d, i) => {
          const [x, y] = pt(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-soft)" strokeWidth="0.8" />;
        })}
        <polygon points={poly} fill="color-mix(in oklch, var(--gold) 30%, transparent)" stroke="var(--gold)" strokeWidth="2" />
        {dims.map((d, i) => {
          const [x, y] = pt(i, d.v);
          return <circle key={i} cx={x} cy={y} r="4" fill="var(--gold)" />;
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {dims.map((d) => (
          <div key={d.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-dim)' }}>
            <span>{d.l}</span>
            <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{d.v}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}
