'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, ApiError, AttemptDetail, MeResponse } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth';

// Signed-in Jobs surface — three cards: personalized rank header, Job
// Readiness Score, Sprint hype. Spec: Vikash 2026-07-17. Real data pulled
// from users.me, attempts.listMine, leaderboards.list. All copy is exact.

const RANK_ORDER = ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster'] as const;
type Rank = (typeof RANK_ORDER)[number];

// Approximate point thresholds for each rank. Kept local because backend
// currently keeps the ladder in seed/config only.
const RANK_THRESHOLDS: Record<Rank, number> = {
  Rookie: 0,
  Bronze: 100,
  Silver: 500,
  Gold: 1500,
  Platinum: 3500,
  Diamond: 7000,
  Master: 15000,
  Grandmaster: 30000,
};

function normalizeRank(raw: string | undefined | null): Rank {
  if (!raw) return 'Rookie';
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return (RANK_ORDER as readonly string[]).includes(cap) ? (cap as Rank) : 'Rookie';
}

function nextRankOf(rank: Rank): Rank | null {
  const idx = RANK_ORDER.indexOf(rank);
  return idx >= 0 && idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null;
}

export default function AppJobsPage() {
  useRequireAuth('SALESPERSON');
  const { user } = useAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [attempts, setAttempts] = useState<AttemptDetail[] | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [totalRanked, setTotalRanked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      api.users.me(),
      api.attempts.listMine(),
      api.leaderboards.list({ period: 'all-time', limit: 500 }),
    ]).then((results) => {
      if (results[0].status === 'fulfilled') setMe(results[0].value);
      if (results[1].status === 'fulfilled') setAttempts(results[1].value);
      if (results[2].status === 'fulfilled') {
        const entries = results[2].value.entries;
        setTotalRanked(entries.length);
        // Find user's row by publicSlug once we have `me`; fall back to name.
        const meRes = results[0].status === 'fulfilled' ? results[0].value : null;
        if (meRes?.salesperson?.publicSlug) {
          const row = entries.find((e) => e.salesperson.publicSlug === meRes.salesperson!.publicSlug);
          setPosition(row?.position ?? null);
        }
      }
      const firstErr = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (firstErr) setError(firstErr.reason instanceof ApiError ? firstErr.reason.message : 'Could not load your Jobs data.');
    });
  }, [user]);

  const firstName = (me?.name ?? user?.email?.split('@')[0] ?? 'there').split(' ')[0];
  const rank: Rank = normalizeRank(me?.salesperson?.rank);
  const totalPoints = me?.salesperson?.totalPoints ?? 0;
  const nextRank = nextRankOf(rank);
  const pointsToNextRank = nextRank ? Math.max(0, RANK_THRESHOLDS[nextRank] - totalPoints) : 0;
  const percentile = position && totalRanked ? Math.max(1, Math.round((position / totalRanked) * 100)) : null;
  const streakDays = me?.salesperson?.currentStreakDays ?? 0;

  // ── Job Readiness Score ─────────────────────────────────────────────
  const readiness = useMemo(() => {
    const sp = me?.salesperson;
    const profileComplete = Boolean(
      me?.name && me?.location && sp?.headline && sp?.bio && sp?.experienceYears != null && sp?.specializationTags?.length,
    );
    const reachedBronze = RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf('Bronze');
    const activeRecently = streakDays > 0 || (attempts ?? []).some((a) => {
      const when = a.completedAt ?? a.startedAt;
      if (!when) return false;
      const daysAgo = (Date.now() - new Date(when).getTime()) / 86400000;
      return daysAgo <= 7;
    });
    const completed20 = (attempts ?? []).filter((a) => a.status === 'COMPLETED').length >= 20;
    const boxes = [profileComplete, reachedBronze, activeRecently, completed20];
    return {
      score: Math.round((boxes.filter(Boolean).length / boxes.length) * 100),
      profileComplete,
      reachedBronze,
      activeRecently,
      completed20,
    };
  }, [me, attempts, rank, streakDays]);

  // ── Counter animation for the score ─────────────────────────────────
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (readiness.score === displayScore) return;
    const start = displayScore;
    const target = readiness.score;
    const t0 = performance.now();
    const dur = 1200;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [readiness.score]);

  const eligible = RANK_ORDER.indexOf(rank) >= RANK_ORDER.indexOf('Bronze');

  const showLoading = !me && !error;
  return (
    <main
      data-sp-jobs
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#FFFFFF',
        color: '#0B0B0F',
        padding: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 3vw, 32px)' }}>

        {/* SECTION 1 — Personalized Status Header */}
        <Fade in={mounted} delay={0}>
          {showLoading ? (
            <SkeletonCard height={200} />
          ) : (
            <StatusHeader
              firstName={firstName}
              rank={rank}
              pointsToNextRank={pointsToNextRank}
              percentile={percentile}
            />
          )}
        </Fade>

        {/* SECTION 2 — Job Readiness Score */}
        <Fade in={mounted} delay={100}>
          {showLoading ? (
            <SkeletonCard height={260} />
          ) : (
            <ReadinessCard
              displayScore={displayScore}
              targetScore={readiness.score}
              profileComplete={readiness.profileComplete}
              reachedBronze={readiness.reachedBronze}
              activeRecently={readiness.activeRecently}
              completed20={readiness.completed20}
            />
          )}
        </Fade>

        {/* SECTION 3 — Hiring Sprint Card */}
        <Fade in={mounted} delay={300}>
          {showLoading ? (
            <SkeletonCard height={280} />
          ) : (
            <SprintCard rank={rank} position={position} eligible={eligible} />
          )}
        </Fade>

        {error && (
          <div role="alert" style={{ fontSize: 13, color: '#A93F37' }}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   Section 1 — Personalized Status Header
============================================================ */
function StatusHeader({
  firstName,
  rank,
  pointsToNextRank,
  percentile,
}: {
  firstName: string;
  rank: Rank;
  pointsToNextRank: number;
  percentile: number | null;
}) {
  const rookie = rank === 'Rookie';
  const midtier = rank === 'Bronze' || rank === 'Silver';

  let heading: React.ReactNode = '';
  let body: React.ReactNode = '';
  let ctaLabel = '';
  let ctaHref = '';

  if (rookie) {
    heading = <>Hey {firstName}, your job feed unlocks at Bronze rank.</>;
    body = (
      <>
        You're <strong style={{ fontWeight: 600 }}>{pointsToNextRank}</strong> points away from Bronze. Once you rank up, companies can find your profile and reach out directly. Keep competing — the top 100 salespersons get first access when hiring opens.
      </>
    );
    ctaLabel = 'Take a Challenge';
    ctaHref = '/app/challenges';
  } else if (midtier) {
    heading = <>You're on the radar, {firstName}.</>;
    body = (
      <>
        Your {rank} rank puts you in the top {percentile != null ? `${percentile}%` : '—'} of salespersons on Closdex. Companies are actively onboarding — when they start hiring, ranked salespersons like you appear first in their talent searches. <strong style={{ fontWeight: 600 }}>Keep your rank fresh.</strong> Companies filter by recent activity.
      </>
    );
    ctaLabel = "Take Today's Challenge";
    ctaHref = '/app/challenges';
  } else {
    heading = <>{firstName}, you're in the top {percentile != null ? `${percentile}%` : '—'}. Stay there.</>;
    body = (
      <>
        Your {rank} rank is exactly what companies will look for first. We're finalizing partnerships with hiring companies now — your profile will be among the first shown. Rankings shift daily. <strong style={{ fontWeight: 600 }}>Every challenge you complete protects your position.</strong>
      </>
    );
    ctaLabel = 'Defend Your Rank';
    ctaHref = '/app/challenges';
  }

  return (
    <section
      data-sp-jobs-status
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #3A2DC4 0%, #6E5FF7 100%)',
        color: '#FFFFFF',
        borderRadius: 16,
        padding: 'clamp(24px, 3vw, 40px)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 'clamp(16px, 3vw, 32px)',
        alignItems: 'center',
      }}
    >
      {/* Decorative shape top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 165, 36, 0.35) 0%, rgba(245, 165, 36, 0) 65%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ minWidth: 0, position: 'relative' }}>
        <h1
          style={{
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(22px, 3vw, 34px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            margin: 0,
          }}
        >
          {heading}
        </h1>
        <p
          style={{
            marginTop: 14,
            fontSize: 'clamp(14.5px, 1.4vw, 17px)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.9)',
            maxWidth: 600,
          }}
        >
          {body}
        </p>
      </div>
      <Link
        href={ctaHref}
        data-sp-jobs-cta
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: '#FFFFFF',
          color: '#3A2DC4',
          fontWeight: 600,
          fontSize: 15,
          padding: '14px 22px',
          borderRadius: 12,
          textDecoration: 'none',
          minHeight: 44,
          boxShadow: '0 10px 24px -12px rgba(58, 45, 196, 0.55)',
          whiteSpace: 'nowrap',
        }}
      >
        {ctaLabel} →
      </Link>
      <style>{`
        @media (max-width: 768px) {
          [data-sp-jobs-status] { grid-template-columns: 1fr !important; }
          [data-sp-jobs-status] [data-sp-jobs-cta] { width: 100%; }
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   Section 2 — Job Readiness Score
============================================================ */
function ReadinessCard({
  displayScore,
  targetScore,
  profileComplete,
  reachedBronze,
  activeRecently,
  completed20,
}: {
  displayScore: number;
  targetScore: number;
  profileComplete: boolean;
  reachedBronze: boolean;
  activeRecently: boolean;
  completed20: boolean;
}) {
  return (
    <section
      data-sp-jobs-readiness
      style={{
        background: '#FFFFFF',
        border: '1px solid #E7E7EC',
        borderRadius: 16,
        padding: 'clamp(24px, 3vw, 32px)',
        boxShadow: '0 4px 20px -12px rgba(11, 11, 15, 0.05)',
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 40%) 1fr',
        gap: 'clamp(24px, 3vw, 40px)',
        alignItems: 'start',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#0B0B0F',
          }}
        >
          Your Job Readiness
        </div>
        <div style={{ fontSize: 13, color: '#7A7A86', marginTop: 4, lineHeight: 1.5 }}>
          Higher scores appear first when companies search.
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 22 }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, system-ui, sans-serif',
              fontSize: 'clamp(48px, 6vw, 64px)',
              fontWeight: 800,
              color: '#6E5FF7',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {displayScore}
          </span>
          <span style={{ fontSize: 22, color: '#9A9AA4', marginLeft: 6, fontWeight: 500 }}>/100</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={targetScore}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            marginTop: 18,
            width: '80%',
            height: 12,
            borderRadius: 999,
            background: '#F0F0F5',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${displayScore}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6E5FF7, #F5A524)',
              borderRadius: 999,
              transition: 'width 40ms linear',
            }}
          />
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: 'Space Mono, ui-monospace, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#7A7A86',
            marginBottom: 14,
          }}
        >
          Your Progress
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReadinessRow done={profileComplete} label="Profile complete" delay={100} />
          <ReadinessRow done={reachedBronze} label="Reached Bronze rank" delay={200} />
          <ReadinessRow done={activeRecently} label="Ranked in last 7 days" delay={300} />
          <ReadinessRow done={completed20} label="Completed 20+ challenges" delay={400} />
        </ul>

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid #F0F0F5',
          }}
        >
          <div style={{ fontSize: 13.5, color: '#7A7A86', lineHeight: 1.55 }}>
            Complete these to maximize visibility when companies start hiring.
          </div>
          <Link
            href="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 12,
              fontSize: 14,
              fontWeight: 600,
              color: '#3A2DC4',
              textDecoration: 'none',
            }}
          >
            See what's missing
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          [data-sp-jobs-readiness] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function ReadinessRow({ done, label, delay }: { done: boolean; label: string; delay: number }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: 0,
        animation: `spJobsFadeIn 400ms ease-out ${delay}ms forwards`,
      }}
    >
      {done ? (
        <span
          aria-label="Complete"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1F8A5B',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12 6 6L20 6" />
          </svg>
        </span>
      ) : (
        <span
          aria-label="Not yet"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '1.5px solid #D8D8E0',
            flexShrink: 0,
          }}
        />
      )}
      <span style={{ fontSize: 15, color: '#3A3A44' }}>{label}</span>
      <style>{`
        @keyframes spJobsFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </li>
  );
}

/* ============================================================
   Section 3 — Hiring Sprint Card
============================================================ */
function SprintCard({ rank, position, eligible }: { rank: Rank; position: number | null; eligible: boolean }) {
  return (
    <section
      data-sp-jobs-sprint
      style={{
        position: 'relative',
        background:
          'radial-gradient(700px 400px at 100% 0%, rgba(245, 165, 36, 0.18), transparent 60%),' +
          'radial-gradient(500px 300px at 0% 100%, rgba(110, 95, 247, 0.18), transparent 60%),' +
          'linear-gradient(135deg, #14101F 0%, #2C2256 100%)',
        color: '#FFFFFF',
        borderRadius: 16,
        padding: 'clamp(24px, 3vw, 40px)',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          background: 'rgba(245, 165, 36, 0.16)',
          color: '#F5A524',
          fontFamily: 'Space Mono, ui-monospace, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          padding: '5px 12px',
          borderRadius: 999,
          marginBottom: 16,
        }}
      >
        Upcoming
      </span>
      <h2
        style={{
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: 'clamp(24px, 3.4vw, 40px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: '0 0 12px',
        }}
      >
        Sales Hiring Sprint 2026
      </h2>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 16px' }}>
        India's first sales hiring event — coming soon.
      </p>
      <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: 720 }}>
        Companies will interview our top-ranked salespersons over one week. Only Bronze+ are eligible. The higher your rank, the earlier you're seen.
      </p>

      <div
        data-sp-jobs-sprint-stats
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 26,
        }}
      >
        <StatBlock
          label="Your Current Rank"
          value={<span>{rank} {position ? <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>(#{position})</span> : null}</span>}
        />
        <StatBlock
          label="Sprint Eligibility"
          value={eligible ? <span style={{ color: '#22C55E' }}>✓ Eligible</span> : <span style={{ color: '#F5A524' }}>Rank up to unlock</span>}
        />
      </div>

      <Link
        href="/coming-soon"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: '#F5A524',
          color: '#0B0B0F',
          fontWeight: 700,
          fontSize: 15,
          padding: '14px 26px',
          borderRadius: 12,
          textDecoration: 'none',
          minHeight: 44,
          boxShadow: '0 10px 30px -8px rgba(245, 165, 36, 0.5)',
        }}
      >
        View Sprint Details →
      </Link>

      <div style={{ marginTop: 24, fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
        Sprint dates being finalized. Founding companies onboarding this week.
      </div>

      <style>{`
        @media (max-width: 768px) {
          [data-sp-jobs-sprint-stats] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'Space Mono, ui-monospace, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 'clamp(17px, 1.6vw, 22px)', fontWeight: 700, color: '#FFFFFF' }}>{value}</div>
    </div>
  );
}

/* ============================================================
   Shared bits
============================================================ */
function Fade({ in: shown, delay, children }: { in: boolean; delay: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SkeletonCard({ height }: { height: number }) {
  return (
    <div
      aria-hidden
      style={{
        height,
        borderRadius: 16,
        background: 'linear-gradient(90deg, #F3F3F6 0%, #FAFAFC 50%, #F3F3F6 100%)',
        backgroundSize: '200% 100%',
        animation: 'spJobsShimmer 1.4s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes spJobsShimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
