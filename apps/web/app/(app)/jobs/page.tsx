'use client';

import { CSSProperties } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';
import type { RankName } from '@/lib/constants';

type JobStatus = 'Applied' | 'Shortlisted';

interface Job {
  id: number;
  co: string;
  logo: string;
  role: string;
  loc: string;
  type: string;
  ctc: string;
  minRank: RankName;
  posted: string;
  featured?: boolean;
  applicants: number;
  status: JobStatus | null;
  locked?: boolean;
}

const JOBS: Job[] = [
  { id: 1, co: 'Razorpay',     logo: 'RP', role: 'Senior Account Executive — IT Sales',  loc: 'Bangalore',           type: 'Full-time', ctc: '₹18-24 LPA + 30% OTE',  minRank: 'Gold',     posted: '2d', featured: true, applicants: 47,  status: null },
  { id: 2, co: 'Zoho',         logo: 'ZH', role: 'SDR Lead — Mid-Market SaaS',           loc: 'Chennai / Remote',    type: 'Full-time', ctc: '₹14-18 LPA + commissions', minRank: 'Silver', posted: '4d', applicants: 124, status: 'Applied' },
  { id: 3, co: 'Freshworks',   logo: 'FW', role: 'Account Executive — Enterprise IT',   loc: 'Bangalore',           type: 'Full-time', ctc: '₹22-32 LPA + OTE',      minRank: 'Gold',     posted: '1w', applicants: 89,  status: null },
  { id: 4, co: 'Postman',      logo: 'PM', role: 'Inside Sales Representative',         loc: 'Remote (India)',      type: 'Full-time', ctc: '₹12-16 LPA',            minRank: 'Bronze',   posted: '3d', applicants: 211, status: 'Shortlisted' },
  { id: 5, co: 'Atlan',        logo: 'AT', role: 'Sales Development Rep — Data',        loc: 'Delhi NCR / Remote',  type: 'Full-time', ctc: '₹10-14 LPA',            minRank: 'Silver',   posted: '1w', applicants: 156, status: null },
  { id: 6, co: 'Mindtickle',   logo: 'MT', role: 'Senior Enterprise AE',                loc: 'Pune',                type: 'Full-time', ctc: '₹28-38 LPA + OTE',      minRank: 'Platinum', posted: '2w', applicants: 34,  status: null, locked: true },
];

const PIPELINE = [
  { l: 'Applied',     v: 3, c: 'var(--cool)' },
  { l: 'Viewed',      v: 7, c: 'var(--text-dim)' },
  { l: 'Shortlisted', v: 1, c: 'var(--gold)' },
  { l: 'Interview',   v: 0, c: 'var(--text-mute)' },
  { l: 'Offer',       v: 0, c: 'var(--emerald)' },
];

export default function JobsPage() {
  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>Jobs for you</h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            47 active listings · matched to your <RankBadge rank="Gold" size={12} /> Gold tier &amp; IT Sales specialization
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="ghost" size="sm" icon={<Icon.filter />}>Filters</Btn>
          <Btn kind="ghost" size="sm">Saved (4)</Btn>
          <Btn kind="ghost" size="sm">Applications (3)</Btn>
        </div>
      </div>

      {/* Status pipeline */}
      <Card padding={18} style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
          Your application pipeline
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {PIPELINE.map((s) => (
            <div key={s.l} style={{ padding: 12, borderRadius: 8, background: 'var(--bg-2)', borderLeft: `3px solid ${s.c}` }}>
              <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Job list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {JOBS.map((j) => (
          <Card key={j.id} padding={20} hover>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'var(--bg-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--text)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                {j.logo}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>{j.role}</h3>
                  {j.featured && (
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
                  )}
                  {j.status && (
                    <span
                      style={{
                        ...BADGE,
                        color: j.status === 'Shortlisted' ? 'var(--gold)' : 'var(--cool)',
                        background: `color-mix(in oklch, ${j.status === 'Shortlisted' ? 'var(--gold)' : 'var(--cool)'} 14%, transparent)`,
                        border: `1px solid color-mix(in oklch, ${j.status === 'Shortlisted' ? 'var(--gold)' : 'var(--cool)'} 35%, transparent)`,
                      }}
                    >
                      {j.status}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-dim)', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span><strong style={{ color: 'var(--text)' }}>{j.co}</strong></span>
                  <span>• {j.loc}</span>
                  <span>• {j.type}</span>
                  <span>• Posted {j.posted} ago</span>
                  <span>• {j.applicants} applicants</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    style={{
                      ...BADGE,
                      color: 'var(--emerald)',
                      background: 'color-mix(in oklch, var(--emerald) 12%, transparent)',
                      border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
                    }}
                  >
                    {j.ctc}
                  </span>
                  <span style={{ ...BADGE, color: 'var(--text-dim)', background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
                    <RankBadge rank={j.minRank} size={12} /> {j.minRank}+ required
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {j.locked ? (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>🔒 Reach Platinum to unlock</span>
                    <Btn kind="ghost" size="sm" style={{ opacity: 0.6 }}>Locked</Btn>
                  </>
                ) : j.status ? (
                  <Btn kind="secondary" size="sm">View status</Btn>
                ) : (
                  <>
                    <Btn kind="primary" size="sm" icon={<Icon.arrow />}>Apply 1-click</Btn>
                    <Btn kind="ghost" size="sm">Save</Btn>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const BADGE: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
