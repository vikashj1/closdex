import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import type { DifficultyLevel } from '@/lib/constants';
import { pill } from './pill';

interface Props {
  go: (path: string) => void;
}

const PERSONAS: { e: string; n: string; desc: string; count: number; level: DifficultyLevel }[] = [
  { e: '❄️', n: 'The Cold Opener',     desc: 'First contact. Warm or shut down. Capture curiosity in 2 messages.',                count: 18, level: 'Rookie' },
  { e: '🛡️', n: 'The Skeptic',          desc: 'Heard every pitch. Wants proof, data, and a reason to keep listening.',           count: 14, level: 'Hard' },
  { e: '🚪', n: 'The Gatekeeper',       desc: 'Earn the warm intro to the actual decision-maker.',                                count: 9,  level: 'Hard' },
  { e: '💰', n: 'The Pricing Pushback', desc: "Loves the product. Says 'you're 2x cheaper alternatives'.",                       count: 12, level: 'Medium' },
  { e: '👻', n: 'The Ghoster',          desc: '60 days silent. Win the conversation back from the dead.',                         count: 7,  level: 'Medium' },
  { e: '🏛️', n: 'The Committee',        desc: 'Procurement, security, and the champion — all in one room.',                       count: 5,  level: 'Expert' },
];

export function PersonaShowcase({ go }: Props) {
  return (
    <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
        <div>
          <div style={pill('var(--gold)')}>80+ scenarios · 6 persona archetypes</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '16px 0 8px' }}>
            Practice the leads that actually scare you.
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, maxWidth: 580, margin: 0 }}>
            Every persona reacts dynamically — same scenario, different conversation, every time. Built from real call transcripts contributed by sales coaches.
          </p>
        </div>
        <Btn kind="ghost" size="md" icon={<Icon.arrow />} onClick={() => go('/challenges')}>Browse all 80+</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {PERSONAS.map((p) => (
          <Card key={p.n} padding={22} hover onClick={() => go('/signup')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ fontSize: 40 }}>{p.e}</div>
              <DifficultyTag level={p.level} size="sm" />
            </div>
            <h3 className="display" style={{ fontSize: 19, fontWeight: 700, margin: '0 0 6px' }}>{p.n}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, margin: '0 0 14px' }}>{p.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{p.count} variations</span>
              <span style={{ color: 'var(--gold)', fontSize: 12.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Practice this <Icon.arrow />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
