'use client';

import { useRouter } from 'next/navigation';
import { CSSProperties, ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Stat } from '@/components/ui/Stat';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { Icon } from '@/components/ui/Icon';
import type { DifficultyLevel } from '@/lib/constants';

const DIMENSIONS = [
  { l: 'Discovery & Listening',  v: 4.6, c: 'var(--emerald)' },
  { l: 'Objection Handling',     v: 4.2, c: 'var(--emerald)' },
  { l: 'Value Articulation',     v: 4.0, c: 'var(--gold)' },
  { l: 'Conversational Quality', v: 4.4, c: 'var(--emerald)' },
  { l: 'Goal Execution',         v: 3.8, c: 'var(--gold)' },
];

interface NotableWin {
  t: string;
  level: DifficultyLevel;
  s: number;
  ach: boolean;
  when: string;
}

const NOTABLE_WINS: NotableWin[] = [
  { t: 'Renewal under pressure',        level: 'Expert', s: 1480, ach: true, when: '1d ago' },
  { t: 'Multi-stakeholder demo close',  level: 'Expert', s: 1322, ach: true, when: '3d ago' },
  { t: 'Cybersec to non-tech buyer',    level: 'Hard',   s: 612,  ach: true, when: '5d ago' },
];

/** Stub candidate detail. Slice 8 fetches by params.id from GET /api/talent/:id. */
export default function CandidateProfilePage() {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => router.push('/company/talent')}
        style={{
          margin: '20px 32px 0',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-dim)',
          fontSize: 12.5,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Icon.arrow /></span> Back to talent search
      </button>

      <div
        style={{
          height: 120,
          background: 'linear-gradient(135deg, color-mix(in oklch, var(--cool) 30%, var(--bg-2)) 0%, var(--bg-2) 100%)',
          position: 'relative',
          marginTop: 14,
        }}
      >
        <div className="stripe-ph" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>

      <div style={{ padding: '0 32px 40px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginTop: -48 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name="Karan Mehta" size={104} color="oklch(0.55 0.16 30)" />
            <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
              <RankBadge rank="Diamond" size={40} />
            </div>
          </div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Karan Mehta</h1>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                  color: 'var(--emerald)',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                ● OPEN TO WORK
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--cool)',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--cool) 30%, transparent)',
                  fontWeight: 700,
                }}
              >
                88% FIT to your &quot;Senior AE — IT Sales&quot;
              </span>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              <strong style={{ color: 'var(--r-diamond)' }}>Diamond tier · #3 weekly</strong> · Pune · 5 yrs · IT Sales / Cloud Infra
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 6 }}>
              Expects ₹22-28 LPA · 30-day notice · last active 2h ago
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="ghost" size="md">Save to shortlist</Btn>
            <Btn kind="secondary" size="md">Message</Btn>
            <Btn kind="primary" size="md" icon={<Icon.briefcase />} style={{ background: 'var(--cool)', color: 'white' }}>
              Invite to apply
            </Btn>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            marginTop: 28,
            padding: '20px 0',
            borderTop: '1px solid var(--border-soft)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <Stat label="Total points"    value="28,940"     accent="var(--gold)" />
          <Stat label="Weekly rank"     value="#3"         sub="of 2,481" accent="var(--cool)" />
          <Stat label="Challenges"      value="142"        sub="49 hard+ tier" />
          <Stat label="Win rate"        value="72%"        sub="avg goal achieved" accent="var(--emerald)" />
          <Stat label="Best dimension"  value="Discovery"  sub="avg 4.6/5" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginTop: 22 }}>
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>
              Verified performance · last 90 days
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {DIMENSIONS.map((d) => (
                <div key={d.l}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12.5 }}>
                    <span>{d.l}</span>
                    <span className="mono" style={{ color: d.c, fontWeight: 700 }}>{d.v.toFixed(1)} / 5.0</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (d.v / 5) * 100 + '%', background: d.c, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-soft)' }}>
              <h4
                className="display"
                style={{ fontSize: 13, margin: '0 0 12px', fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Notable wins
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {NOTABLE_WINS.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'var(--bg-2)',
                    }}
                  >
                    <DifficultyTag level={c.level} size="sm" />
                    <span style={{ fontSize: 12.5 }}>{c.t}</span>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>+{c.s}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{c.when}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Career intent</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                <Row k="Status"       v={<span style={{ color: 'var(--emerald)' }}>Open to work</span>} />
                <Row k="Locations"    v="Pune, Bangalore, Remote" />
                <Row k="Expected CTC" v="₹22-28 LPA" />
                <Row k="Notice"       v="30 days" />
                <Row k="Sectors"      v="SaaS, Cloud, DevTools" />
                <Row k="Avoid"        v="Cold-call only roles" />
              </div>
            </Card>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Resume &amp; contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a style={RESUME_LINK}>📄 karan_mehta_resume.pdf</a>
                <a style={RESUME_LINK}>🔗 linkedin.com/in/karan-mehta</a>
                <a style={RESUME_LINK}>✉️ Unlocked on shortlist</a>
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 8,
                  background: 'color-mix(in oklch, var(--cool) 10%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--cool) 25%, transparent)',
                  fontSize: 11.5,
                  color: 'var(--text-dim)',
                }}
              >
                Contact details unlock when you shortlist or message. Profile view consumed:{' '}
                <strong style={{ color: 'var(--cool)' }}>1 of 250/month</strong>.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-mute)' }}>{k}</span>
      <span style={{ textAlign: 'right' }}>{v}</span>
    </div>
  );
}

const RESUME_LINK: CSSProperties = {
  display: 'block',
  padding: '10px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  fontSize: 12.5,
  color: 'var(--text-dim)',
  cursor: 'pointer',
  border: '1px solid var(--border-soft)',
};
