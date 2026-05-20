import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';
import { pill } from './pill';

interface Props {
  go: (path: string) => void;
}

const LADDER: { rank: RankName; min: number }[] = [
  { rank: 'Grandmaster', min: 70000 },
  { rank: 'Master',      min: 35000 },
  { rank: 'Diamond',     min: 18000 },
  { rank: 'Platinum',    min: 9000 },
  { rank: 'Gold',        min: 4000 },
  { rank: 'Silver',      min: 1500 },
  { rank: 'Bronze',      min: 500 },
  { rank: 'Rookie',      min: 0 },
];

export function FinalCTABanner({ go }: Props) {
  return (
    <section style={{ padding: '0 64px 64px' }}>
      <Card
        padding={0}
        style={{
          overflow: 'hidden',
          background: 'linear-gradient(135deg, color-mix(in oklch, var(--gold) 22%, var(--bg)) 0%, color-mix(in oklch, var(--gold) 8%, var(--bg-2)) 100%)',
          borderColor: 'color-mix(in oklch, var(--gold) 35%, var(--border))',
          position: 'relative',
        }}
      >
        <svg
          style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}
          width="400"
          height="400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M3 18 L9 18 L11 12 L13 18 L19 18 L15 6 L9 6 Z" fill="var(--gold)" />
        </svg>
        <div style={{ padding: '64px 56px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={pill('var(--gold)')}>Founding cohort · 10 spots left</div>
            <h2 className="display" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1, margin: '16px 0 18px' }}>
              The leaderboard is live.<br /><span style={{ color: 'var(--gold)' }}>What&apos;s your rank?</span>
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-dim)', lineHeight: 1.55, maxWidth: 540, margin: '0 0 28px' }}>
              First 100 sign-ups get a permanent <strong style={{ color: 'var(--gold)' }}>Founding Member</strong> badge on their public profile and lifetime access to private leaderboards.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go('/signup')}>Start competing — free</Btn>
              <Btn kind="secondary" size="lg" icon={<Icon.briefcase />} onClick={() => go('/company')}>Hire top talent</Btn>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 18, fontSize: 12, color: 'var(--text-mute)' }}>
              <span>✓ No credit card</span>
              <span>✓ 5-min onboarding</span>
              <span>✓ Cancel anytime — but you won&apos;t want to</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>The climb</div>
            {LADDER.map((row, i) => (
              <div
                key={row.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: 'color-mix(in oklch, var(--surface) 80%, transparent)',
                  border: '1px solid var(--border-soft)',
                  opacity: 1 - i * 0.06,
                }}
              >
                <RankBadge rank={row.rank} size={18} />
                <span className="display" style={{ fontSize: 13, fontWeight: 600 }}>{row.rank}</span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)', marginLeft: 10 }}>{row.min.toLocaleString()}+ pts</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
