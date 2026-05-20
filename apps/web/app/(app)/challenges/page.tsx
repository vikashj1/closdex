'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import { DIFFICULTY, type DifficultyLevel } from '@/lib/constants';

type StatusFilter = 'All' | 'Not attempted' | 'In progress' | 'Completed' | 'Locked';
type DiffFilter = 'All' | DifficultyLevel;

interface Challenge {
  id: number;
  title: string;
  level: DifficultyLevel;
  goal: string;
  goalMult: number;
  points: number;
  time: string;
  featured?: boolean;
  brief: string;
}

const ALL_CHALLENGES: Challenge[] = [
  { id: 1, title: 'The Skeptical CTO',                          level: 'Hard',   goal: 'Book Discovery Call', goalMult: 1.2, points: 480,  time: '15 min', featured: true, brief: 'Pitch DevOps observability to a busy Series B fintech CTO.' },
  { id: 2, title: 'Email sequence: warm reply',                 level: 'Easy',   goal: 'Book follow-up',      goalMult: 1.0, points: 110,  time: '8 min',  brief: 'Marketing-qualified lead replied positively. Convert to a meeting.' },
  { id: 3, title: 'Gatekeeper bypass: enterprise IT',           level: 'Hard',   goal: 'Reach decision-maker',goalMult: 1.5, points: 600,  time: '12 min', brief: 'EA blocks every direct ask. Earn a warm intro to the VP IT.' },
  { id: 4, title: 'Re-engage the ghosted prospect',             level: 'Medium', goal: 'Win-back',            goalMult: 1.6, points: 320,  time: '10 min', brief: "Lost in 'we'll circle back next quarter' limbo for 60 days." },
  { id: 5, title: 'Pricing pushback — defend value',            level: 'Medium', goal: 'Send Proposal',       goalMult: 1.4, points: 280,  time: '15 min', brief: "Prospect loves the product but says 'you're 2x competitor X'." },
  { id: 6, title: 'Multi-stakeholder demo close',               level: 'Expert', goal: 'Close the Deal',      goalMult: 2.0, points: 1600, time: '20 min', brief: 'Procurement, security, and the user-champion all in one room.' },
  { id: 7, title: 'Cold outbound: SMB SaaS',                    level: 'Rookie', goal: 'Qualify Lead',        goalMult: 1.0, points: 50,   time: '5 min',  brief: 'First contact. Build curiosity, capture pain, qualify lightly.' },
  { id: 8, title: 'Renewal under pressure',                     level: 'Expert', goal: 'Close the Deal',      goalMult: 2.0, points: 1600, time: '18 min', brief: 'Anchor customer threatening churn. Save it or lose 18% of ARR.' },
  { id: 9, title: 'Cybersecurity sale to non-technical buyer',  level: 'Hard',   goal: 'Send Proposal',       goalMult: 1.4, points: 560,  time: '14 min', brief: "Buyer doesn't understand EDR vs MDR vs XDR. Don't lose them." },
];

const DIFFICULTIES: DiffFilter[] = ['All', 'Rookie', 'Easy', 'Medium', 'Hard', 'Expert'];
const STATUSES: StatusFilter[] = ['All', 'Not attempted', 'In progress', 'Completed', 'Locked'];
const GOALS = ['Qualify', 'Book call', 'Proposal', 'Decision-maker', 'Close', 'Win-back'];

export default function ChallengesPage() {
  const router = useRouter();
  const [diff, setDiff] = useState<DiffFilter>('All');
  const [status, setStatus] = useState<StatusFilter>('All');

  const filtered = diff === 'All' ? ALL_CHALLENGES : ALL_CHALLENGES.filter((c) => c.level === diff);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 0, minHeight: 'calc(100vh - 60px)' }}>
      {/* Filter sidebar */}
      <aside
        style={{
          borderRight: '1px solid var(--border-soft)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          background: 'var(--bg)',
        }}
      >
        <div>
          <div style={FILTER_LBL}><Icon.filter /> Difficulty</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: diff === d ? 'var(--surface-2)' : 'transparent',
                  color: 'var(--text)',
                  fontSize: 12.5,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d !== 'All' && (
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: DIFFICULTY[d as DifficultyLevel].color }} />
                  )}
                  {d}
                </span>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>
                  {d === 'All' ? ALL_CHALLENGES.length : ALL_CHALLENGES.filter((c) => c.level === d).length}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={FILTER_LBL}>Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '7px 10px',
                  borderRadius: 7,
                  border: 'none',
                  background: status === s ? 'var(--surface-2)' : 'transparent',
                  color: 'var(--text)',
                  fontSize: 12.5,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={FILTER_LBL}>Goal type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {GOALS.map((g) => (
              <Chip key={g}>{g}</Chip>
            ))}
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Challenge library</h1>
            <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
              Showing {filtered.length} challenges · IT Sales vertical
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Sort by</span>
            <button style={SORT_BTN}>Trending <Icon.chevDown /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {filtered.map((c) => (
            <Card
              key={c.id}
              hover
              onClick={() => router.push(`/challenges/${c.id}`)}
              padding={0}
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: 4, background: DIFFICULTY[c.level].color }} />
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <DifficultyTag level={c.level} size="sm" />
                  {c.featured && (
                    <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em' }}>★ FEATURED</span>
                  )}
                </div>
                <div>
                  <h3 className="display" style={{ fontSize: 17, margin: '0 0 6px', fontWeight: 600, letterSpacing: '-0.01em' }}>{c.title}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0, lineHeight: 1.5 }}>{c.brief}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-mute)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.target /> Goal</span>
                    <span style={{ color: 'var(--text-dim)' }}>{c.goal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--text-mute)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.clock /> Duration</span>
                    <span style={{ color: 'var(--text-dim)' }}>{c.time}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <div className="display mono" style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 22 }}>+{c.points}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>max points</div>
                  </div>
                  <Btn kind="secondary" size="sm" icon={<Icon.arrow />}>Start</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

const FILTER_LBL: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const SORT_BTN: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12.5,
  fontWeight: 600,
};
