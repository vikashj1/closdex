import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';
import { pill } from './pill';

interface Props {
  go: (path: string) => void;
}

export function ProductShowcase({ go }: Props) {
  return (
    <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={pill('var(--gold)')}>Inside the arena</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '16px 0 18px' }}>
            See what an at-bat looks like.
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--text-dim)', lineHeight: 1.55, margin: '0 0 14px' }}>
            Realistic chat with a dynamic AI lead. A transparent rubric that scores every message. A scoreboard companies actually watch. Daily streaks that compound into rank.
          </p>
          <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: 'var(--text-dim)' }}>
            {BULLETS.map((b) => (
              <li key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--gold)', marginTop: 2, flexShrink: 0 }}><Icon.check /></span>{b}
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="primary" size="md" icon={<Icon.bolt />} onClick={() => go('/signup')}>Get started — free</Btn>
            <Btn kind="ghost" size="md" icon={<Icon.book />}>Watch 90-sec tour</Btn>
          </div>
        </div>

        {/* 2-column UI preview collage — staggered entrance + soft float */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="reveal-up" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both, floatY 6s ease-in-out 0.8s infinite' }}>
              <UIPreviewChat />
            </div>
            <div className="reveal-up d-200" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.2s both, floatY 6.8s ease-in-out 1.4s infinite' }}>
              <UIPreviewLeaderboard />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="reveal-up d-100" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.1s both, floatY 7.2s ease-in-out 1.1s infinite' }}>
              <UIPreviewScore />
            </div>
            <div className="reveal-up d-300" style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) 0.3s both, floatY 6.4s ease-in-out 1.7s infinite' }}>
              <UIPreviewHeatmap />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const BULLETS = [
  'Live message-count, timer, and goal indicator on every challenge',
  'Five-dimension AI rubric with side-panel tracking',
  'Public profile · shareable rank URL · activity heatmap',
  'End-of-challenge feedback: strengths, gaps, next-best challenge',
];

function UIFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card padding={0} style={{ overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--d-expert)', opacity: 0.5 }} />
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--d-medium)', opacity: 0.5 }} />
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--emerald)', opacity: 0.5 }} />
        </div>
        <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-mute)', letterSpacing: '0.08em' }}>{label}</span>
        <div style={{ width: 18 }} />
      </div>
      {children}
    </Card>
  );
}

function UIPreviewChat() {
  const msgs: { side: 'lead' | 'me'; text: string }[] = [
    { side: 'lead', text: "I've got 5 minutes. What's this about — and please don't pitch me a 'platform'." },
    { side: 'me', text: "Fair. You're on Datadog right? What's your monthly log volume — the bit making your CFO nervous?" },
    { side: 'lead', text: 'Right question. ~$40K/mo. What are you proposing?' },
    { side: 'me', text: '20-min Thursday demo. Three customers your size cut log spend 40% without losing trace fidelity.' },
  ];
  return (
    <UIFrame label="CLOSDEX · CONVERSATION">
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name="Meera Krishnan" size={26} color="oklch(0.55 0.14 290)" />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700 }}>Meera Krishnan</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-mute)' }}>CTO · Vector Pay</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in oklch, var(--gold) 12%, transparent)' }}>GOAL · BOOK CALL</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-mute)' }}>4/25</span>
        </div>
      </div>
      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg)' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.side === 'me' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                maxWidth: '84%',
                padding: '6px 10px',
                borderRadius: m.side === 'me' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                background: m.side === 'me' ? 'var(--gold)' : 'var(--surface)',
                color: m.side === 'me' ? 'oklch(0.18 0.02 75)' : 'var(--text)',
                border: m.side === 'me' ? 'none' : '1px solid var(--border-soft)',
                fontSize: 10.5,
                lineHeight: 1.4,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: '10px 10px 10px 3px', background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--text-mute)', animation: `typing 1.4s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </UIFrame>
  );
}

function UIPreviewScore() {
  const dims: { l: string; v: number }[] = [
    { l: 'Discovery', v: 4 },
    { l: 'Objection handling', v: 5 },
    { l: 'Value articulation', v: 4 },
    { l: 'Goal execution', v: 4 },
  ];
  return (
    <UIFrame label="CLOSDEX · RESULT">
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9.5, color: 'var(--emerald)', fontWeight: 700, letterSpacing: '0.08em' }}>✓ GOAL ACHIEVED</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 2 }}>The Skeptical CTO · Hard</div>
          </div>
          <div className="display mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}>+522</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10.5, marginBottom: 10 }}>
          {[
            { l: 'Base × Goal × Quality', v: '422' },
            { l: '+ Speed bonus', v: '+40' },
            { l: '+ First-try', v: '+60' },
          ].map((r) => (
            <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
              <span>{r.l}</span>
              <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
          {dims.map((d) => (
            <div key={d.l} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, marginBottom: 2 }}>
                <span style={{ color: 'var(--text-mute)' }}>{d.l}</span>
                <span className="mono" style={{ color: 'var(--gold)', fontWeight: 700 }}>{d.v}/5</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= d.v ? 'var(--gold)' : 'var(--surface-2)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </UIFrame>
  );
}

function UIPreviewLeaderboard() {
  const rows: { r: number; name: string; rank: RankName; pts: number }[] = [
    { r: 1, name: 'Aarav Sharma', rank: 'Master', pts: 38420 },
    { r: 2, name: 'Priya Iyer', rank: 'Master', pts: 36110 },
    { r: 3, name: 'Karan Mehta', rank: 'Diamond', pts: 28940 },
    { r: 4, name: 'Sneha Reddy', rank: 'Diamond', pts: 22180 },
    { r: 5, name: 'Rohan Gupta', rank: 'Platinum', pts: 17850 },
  ];
  return (
    <UIFrame label="CLOSDEX · LEADERBOARD">
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.trophy /> Weekly · IT Sales</span>
        <span style={{ fontSize: 9.5, color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--emerald)' }} /> live
        </span>
      </div>
      <div style={{ padding: '8px 14px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rows.map((row) => (
          <div key={row.r} style={{ display: 'grid', gridTemplateColumns: '22px 1fr auto auto', gap: 8, alignItems: 'center', fontSize: 11 }}>
            <span className="mono" style={{ color: row.r <= 3 ? 'var(--gold)' : 'var(--text-mute)', fontWeight: 700 }}>#{row.r}</span>
            <span style={{ fontWeight: 500 }}>{row.name}</span>
            <RankBadge rank={row.rank} size={12} />
            <span className="mono" style={{ fontWeight: 700 }}>{row.pts.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </UIFrame>
  );
}

function UIPreviewHeatmap() {
  return (
    <UIFrame label="CLOSDEX · ACTIVITY">
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div>
            <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>148</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)' }}>challenges · last 26 weeks</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon.fire /> 5-day streak
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>longest: 12 days</div>
          </div>
        </div>
        <ActivityHeatmap weeks={20} compact showLabels={false} showLegend={false} />
      </div>
    </UIFrame>
  );
}
