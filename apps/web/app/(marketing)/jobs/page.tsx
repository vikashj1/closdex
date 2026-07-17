'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

// Marketing "Jobs" landing shown to logged-out visitors. Logged-in users
// bounce to /coming-soon (the hiring side ships after beta).
// Content spec + responsive layout provided by Vikash. All copy exact.
export default function MarketingJobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) router.replace('/coming-soon');
  }, [user, loading, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // While auth resolves, avoid a flash of hero content for signed-in users.
  if (loading || user) return null;

  return (
    <main data-cmkt-jobs style={{ background: '#FFFFFF' }}>

      {/* ============================================================
          SECTION 1 — HERO
      ============================================================ */}
      <section
        style={{
          background:
            'radial-gradient(1200px 600px at 50% -10%, rgba(110, 95, 247, 0.18), transparent 60%),' +
            'linear-gradient(180deg, #F6F4FF 0%, #FFFFFF 100%)',
          padding: 'clamp(60px, 8vw, 120px) clamp(20px, 4vw, 40px) clamp(50px, 7vw, 100px)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: '#0B0B0F',
              margin: 0,
              maxWidth: 900,
            }}
          >
            Companies are watching.{' '}
            <span style={{ color: '#6E5FF7' }}>Are you ranked yet?</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.6vw, 22px)',
              lineHeight: 1.55,
              color: '#3A3A44',
              maxWidth: 700,
              margin: '22px 0 40px',
            }}
          >
            India's top sales talent is being ranked right now. When companies start hiring — and they're already signing up — the leaderboard is where they'll look first.
          </p>
          <div data-jobs-hero-ctas style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <a href="/signup" style={ctaPrimary}>Take Today's Challenge →</a>
            <a href="/leaderboard" style={ctaSecondary}>View Leaderboard</a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — STATUS STRIP
      ============================================================ */}
      <section
        style={{
          background: '#FFFFFF',
          padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 40px)',
          borderTop: '1px solid #F0F0F5',
        }}
      >
        <div
          data-jobs-status-grid
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          <StatCard icon="👥" number="247" label="Salespersons Competing" note="Live count of active ranked players" />
          <StatCard icon="🏢" number="—" label="Companies Onboarding" note="Founding partners joining every week" />
          <StatCard icon="🎯" number="Q4" label="Sales Hiring Sprint 2026" note="Coming soon. First cohort in early access." />
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — MAIN MESSAGE
      ============================================================ */}
      <section
        style={{
          background: '#FAFAF8',
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 4vw, 40px)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '-0.015em',
              color: '#6E5FF7',
              margin: 0,
            }}
          >
            Your Rank Is Your Resume.
          </h2>
          <p
            style={{
              fontSize: 'clamp(16px, 1.4vw, 20px)',
              lineHeight: 1.7,
              color: '#3A3A44',
              marginTop: 28,
            }}
          >
            We're doing something no platform in India has done before — building a hiring marketplace where sales talent is chosen on proven skill, not just LinkedIn keywords.
          </p>
          <p style={{ fontSize: 'clamp(16px, 1.4vw, 20px)', lineHeight: 1.7, color: '#3A3A44', marginTop: 20 }}>
            Right now, founding companies are joining Closdex to get first pick of top-ranked salespersons. Every challenge you complete, every objection you handle, every deal you close on our platform makes your profile stronger — and more visible when hiring starts.
          </p>
          <blockquote
            style={{
              margin: '32px 0 0',
              padding: '18px 22px',
              borderLeft: '4px solid #6E5FF7',
              background: '#FFFFFF',
              fontSize: 'clamp(18px, 1.6vw, 24px)',
              lineHeight: 1.5,
              fontStyle: 'italic',
              color: '#0B0B0F',
              fontWeight: 500,
            }}
          >
            The salespersons who rank early won't be waiting for job opportunities. Job opportunities will be waiting for them.
          </blockquote>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — HOW HIRING WILL WORK
      ============================================================ */}
      <section
        style={{
          background: '#FFFFFF',
          padding: 'clamp(60px, 8vw, 100px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 'clamp(28px, 4vw, 40px)',
              textAlign: 'center',
              color: '#0B0B0F',
              margin: '0 0 60px',
              letterSpacing: '-0.015em',
            }}
          >
            Here's what's coming
          </h2>
          <div
            data-jobs-steps-grid
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 32,
            }}
          >
            <StepCard num="01" icon="🎯" title="Rank Up" body="Compete on daily and weekly challenges. Climb the leaderboard. Build a verified sales profile that companies can trust." />
            <StepCard num="02" icon="👀" title="Get Noticed" body="When companies join, they browse the leaderboard first. Top-ranked salespersons appear at the top of their talent search. Your rank is your visibility." />
            <StepCard num="03" icon="💼" title="Get Hired" body="Founding companies interview and hire directly through the platform during our upcoming Hiring Sprint. Early rankers get first access." />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — FOMO CARD
      ============================================================ */}
      <section
        style={{
          background:
            'radial-gradient(900px 500px at 80% 0%, rgba(245, 165, 36, 0.25), transparent 60%),' +
            'linear-gradient(135deg, #14101F 0%, #2C2256 100%)',
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 4vw, 40px)',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            The First Hiring Sprint Is Coming
          </h2>
          <p
            style={{
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              lineHeight: 1.65,
              color: '#E7E1FF',
              margin: '26px auto 32px',
              maxWidth: 720,
            }}
          >
            We're preparing to launch India's first Sales Hiring Sprint — a week where hand-picked companies interview our top-ranked salespersons directly through the platform.
          </p>
          <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: '#E7E1FF', margin: '0 0 32px' }}>
            Only salespersons ranked{' '}
            <span
              style={{
                display: 'inline-block',
                background: '#F5A524',
                color: '#0B0B0F',
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 999,
                fontSize: '0.95em',
              }}
            >
              Bronze or above
            </span>{' '}
            will be eligible.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto 40px', maxWidth: 400, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={fomoLine}>
              <span style={fomoIcon('#FF6259')}>✕</span> There's no waitlist.
            </li>
            <li style={fomoLine}>
              <span style={fomoIcon('#FF6259')}>✕</span> There's no application.
            </li>
            <li style={fomoLine}>
              <span style={fomoIcon('#22C55E')}>✓</span> The leaderboard is the qualification.
            </li>
          </ul>
          <a href="/signup" style={{ ...ctaPrimary, height: 60, padding: '0 40px', fontSize: 17 }}>Start Climbing →</a>
        </div>
      </section>

      {/* ============================================================
          SECTION 7 — BOTTOM NUDGE (Section 6 skipped — no logos yet)
      ============================================================ */}
      <section
        style={{
          background: '#0B0B0F',
          padding: 'clamp(60px, 7vw, 90px) clamp(24px, 4vw, 40px)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--display)',
              fontWeight: 700,
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            Every day you don't compete, someone else moves up.
          </h2>
          <p
            style={{
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              lineHeight: 1.6,
              color: '#9A9AA4',
              margin: '20px 0 36px',
            }}
          >
            Your rank freezes the moment you stop. Your rivals don't.
          </p>
          <a href="/signup" style={{ ...ctaPrimary, height: 56, padding: '0 32px', boxShadow: '0 12px 40px -8px rgba(110, 95, 247, 0.6)' }}>Take a Challenge Now →</a>
        </div>
      </section>

      {/* ============================================================
          MOBILE STICKY BOTTOM BAR
      ============================================================ */}
      <div
        data-jobs-sticky-cta
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          background: 'rgba(110, 95, 247, 0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: scrolled ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 60,
          borderTop: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        <a
          href="/signup"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 40,
            background: '#FFFFFF',
            color: '#6E5FF7',
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 10,
            textDecoration: 'none',
            gap: 8,
          }}
        >
          🎯 Take a Challenge
        </a>
      </div>

      {/* ============================================================
          RESPONSIVE OVERRIDES
      ============================================================ */}
      <style>{`
        [data-jobs-sticky-cta] { display: none; }
        @media (max-width: 768px) {
          [data-jobs-sticky-cta] { display: flex; }
          [data-cmkt-jobs] { padding-bottom: 76px; }
          [data-jobs-hero-ctas] { width: 100%; flex-direction: column; }
          [data-jobs-hero-ctas] > a { width: 100%; justify-content: center; }
          [data-jobs-status-grid] { grid-template-columns: 1fr !important; gap: 16px !important; }
          [data-jobs-steps-grid] { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          [data-jobs-steps-grid] { gap: 20px !important; }
        }
      `}</style>
    </main>
  );
}

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
  padding: '0 32px',
  background: '#6E5FF7',
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 15.5,
  letterSpacing: '-0.005em',
  borderRadius: 12,
  textDecoration: 'none',
  border: 'none',
  boxShadow: '0 8px 24px -8px rgba(110, 95, 247, 0.4)',
};

const ctaSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
  padding: '0 28px',
  background: 'transparent',
  color: '#0B0B0F',
  fontWeight: 600,
  fontSize: 15.5,
  borderRadius: 12,
  textDecoration: 'none',
  border: '1.5px solid #0B0B0F',
};

function StatCard({ icon, number, label, note }: { icon: string; number: string; label: string; note: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F5',
        borderRadius: 14,
        padding: 'clamp(24px, 2.6vw, 32px)',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px -12px rgba(11, 11, 15, 0.08)',
      }}
    >
      <span style={{ fontSize: 48, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#0B0B0F' }}>{number}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#0B0B0F', marginTop: 6 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#7A7A86', marginTop: 6 }}>{note}</div>
      </div>
    </div>
  );
}

function StepCard({ num, icon, title, body }: { num: string; icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F5',
        borderRadius: 16,
        padding: 'clamp(24px, 3vw, 40px)',
        minHeight: 340,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 'clamp(56px, 5vw, 72px)', lineHeight: 1, marginBottom: 20 }}>{icon}</div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6E5FF7',
          marginBottom: 10,
        }}
      >
        Step {num}
      </div>
      <h3
        style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(22px, 2vw, 28px)',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: '#0B0B0F',
          margin: '0 0 14px',
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#3A3A44', margin: 0 }}>{body}</p>
    </div>
  );
}

const fomoLine: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  color: '#E7E1FF',
  fontSize: 16.5,
};

function fomoIcon(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    color,
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  };
}
