'use client';

import { useState } from 'react';
import { Btn } from '@/components/ui/Btn';
import { Icon } from '@/components/ui/Icon';
import { pill } from './pill';

const FAQS = [
  {
    q: 'Is Closdex really free for salespersons?',
    a: 'Yes. Phase 1 is 100% free for salespersons — no paywalls, no premium tier, no "unlock to apply" tricks. Companies pay listing fees and a 12.5% placement commission on confirmed hires. That covers the AI compute, the platform, and the team.',
  },
  {
    q: 'How realistic are the AI leads, really?',
    a: 'Each persona has a backstory, objection set, communication pattern, and decision criteria built from real call transcripts contributed by working sales coaches. The same scenario produces different conversations each time — the lead reacts to what you actually say, not a scripted branch.',
  },
  {
    q: 'Can companies trust the leaderboard as a hiring signal?',
    a: 'The rubric is published and the formula is public. Every score is auditable. We run ML gaming-detection on copy-paste patterns and scripted plays, and salespersons can dispute scores for human review within 48 hours. Companies see the full performance breakdown, not just a top-line number.',
  },
  {
    q: 'Which sales verticals are supported?',
    a: 'Phase 1 launches with IT Sales (Cloud, DevTools, Cybersecurity, IT Services, Hardware, Networking). SaaS, BFSI, FMCG, EdTech, Real Estate, Insurance, and Healthcare come in Phase 2 once we hit product-market fit in IT Sales.',
  },
  {
    q: 'What does it cost to hire someone?',
    a: 'Free browse — view the leaderboard and limited profiles at no cost. Paid plans start at ₹4,999/mo (Starter) for one active posting. Placement commission is 12.5% of first-year fixed CTC on confirmed hires, with 10% for Scale subscribers and custom Enterprise rates. 90-day replacement OR 50% refund.',
  },
  {
    q: 'How long does it take to get hired?',
    a: 'Median time from first profile view to a confirmed offer in our closed beta has been 18 days. The variance is wide — top-quartile candidates often get interview requests within 72 hours of switching their profile to "open to work".',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ padding: '80px 64px', borderTop: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 56 }}>
        <div>
          <div style={pill('var(--gold)')}>Questions</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', margin: '16px 0 16px', lineHeight: 1.1 }}>
            The things people ask before signing up.
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 24px' }}>
            Didn&apos;t find your answer? We reply to every email personally.
          </p>
          <Btn kind="ghost" size="md">hello@closdex.com</Btn>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                  padding: '18px 4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span className="display" style={{ fontSize: 16, fontWeight: 600, color: open === i ? 'var(--gold)' : 'var(--text)' }}>{f.q}</span>
                <span style={{ color: 'var(--text-mute)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <Icon.chevDown />
                </span>
              </button>
              {open === i && (
                <div style={{ padding: '0 4px 18px', fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, animation: 'fadeUp 0.2s ease' }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
