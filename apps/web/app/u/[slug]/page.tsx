'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError, EarnedBadge, TalentDetail } from '@/lib/api';
import { rankFromEnum } from '@/lib/constants';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';

const RANK_HEX: Record<string, string> = {
  Bronze: '#F5A524',
  Silver: '#9A9AA4',
  Gold: '#F5A524',
  Platinum: '#5B4BF5',
  Diamond: '#1F8A5B',
  Master: '#A93F37',
};

function rankHex(name: string): string {
  return RANK_HEX[name] ?? '#F5A524';
}

function rankGradient(name: string): string {
  const base = rankHex(name);
  // Darker shade per tier for the shield gradient end-stop
  const dark: Record<string, string> = {
    Bronze: '#C77A0A',
    Silver: '#6F6F78',
    Gold: '#C77A0A',
    Platinum: '#3A2DC4',
    Diamond: '#0F5E3D',
    Master: '#742720',
  };
  return `linear-gradient(160deg, ${base}, ${dark[name] ?? '#C77A0A'})`;
}

function avatarInitial(name: string | undefined | null): string {
  if (!name) return '?';
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed[0].toUpperCase();
}

function formatMonthYear(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function PublicProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [talent, setTalent] = useState<TalentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signInHover, setSignInHover] = useState(false);
  const [signUpHover, setSignUpHover] = useState(false);
  const [resumeHover, setResumeHover] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api.talent
      .getPublicBySlug(slug)
      .then((data) => setTalent(data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load profile.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          color: '#7A7A86',
          fontSize: 14,
          fontFamily: 'Inter,-apple-system,sans-serif',
        }}
      >
        Loading profile…
      </div>
    );
  }

  if (notFound) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          gap: 12,
          fontFamily: 'Inter,-apple-system,sans-serif',
          color: '#0B0B0F',
        }}
      >
        <div style={{ fontSize: 40, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>404</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Profile not found</div>
        <div style={{ fontSize: 13, color: '#7A7A86' }}>
          This profile may have been removed or the link is incorrect.
        </div>
        <a
          href="https://closdex.in"
          style={{
            marginTop: 8,
            fontSize: 13,
            color: '#F5A524',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go to Closdex
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          color: '#5A5A66',
          fontSize: 14,
          fontFamily: 'Inter,-apple-system,sans-serif',
        }}
      >
        {error}
      </div>
    );
  }

  if (!talent) return null;

  const rankName = rankFromEnum(talent.rank);
  const winPct = talent._stats.winRate;
  const heatSeed = talent.totalPoints % 200;

  const tierHex = rankHex(rankName);
  const shieldGradient = rankGradient(rankName);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        color: '#0B0B0F',
        fontFamily: 'Inter,-apple-system,sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ===== TOP BAR ===== */}
      <header
        style={{
          height: 60,
          borderBottom: '1px solid #E7E7EC',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Wordmark */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.5 22 20.5H2L12 2.5Z" fill="#0B0B0F" />
            <path d="M12 12.2 16.8 20.5H7.2L12 12.2Z" fill="#5B4BF5" />
          </svg>
          <span
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.03em',
              color: '#0B0B0F',
            }}
          >
            Closdex
          </span>
        </a>

        {/* Auth links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="/login"
            onMouseEnter={() => setSignInHover(true)}
            onMouseLeave={() => setSignInHover(false)}
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: signInHover ? '#0B0B0F' : '#3A3A44',
              background: signInHover ? '#FAFAF8' : 'transparent',
              textDecoration: 'none',
              padding: '9px 14px',
              borderRadius: 10,
            }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            onMouseEnter={() => setSignUpHover(true)}
            onMouseLeave={() => setSignUpHover(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: signUpHover ? '#FAFAF8' : '#fff',
              color: signUpHover ? '#0B0B0F' : '#5A5A66',
              border: '1px solid #E7E7EC',
              borderRadius: 10,
              padding: '9px 14px',
              fontSize: 13.5,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Sign up
          </a>
        </div>
      </header>

      {/* ===== HERO BANNER ===== */}
      <div
        style={{
          height: 120,
          background: 'linear-gradient(135deg,#FCE8C2,#FAFAF8)',
        }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 56px' }}>
        {/* ===== IDENTITY ROW ===== */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-end',
            marginTop: -50,
          }}
        >
          {/* Avatar + rank shield */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(160deg,#6E5FF7,#3A2DC4)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize: 42,
                border: '4px solid #FFFFFF',
                boxShadow: '0 1px 2px rgba(11,11,15,0.06)',
              }}
            >
              {avatarInitial(talent.user.name)}
            </div>
            {/* Rank shield */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 38,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#FFFFFF',
                  clipPath:
                    'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 3,
                  background: shieldGradient,
                  clipPath:
                    'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'relative' }}
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
              </svg>
            </div>
          </div>

          {/* Name + tier line */}
          <div style={{ flex: 1, paddingBottom: 8, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 11,
                marginBottom: 6,
              }}
            >
              <h1
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: '#0B0B0F',
                }}
              >
                {talent.user.name}
              </h1>
              {talent.openToWork && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 11px 5px 9px',
                    borderRadius: 100,
                    background: 'rgba(31,138,91,0.1)',
                    border: '1px solid rgba(31,138,91,0.32)',
                    color: '#1F8A5B',
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#1F8A5B',
                    }}
                  />
                  Open to work
                </span>
              )}
            </div>
            <div style={{ fontSize: 13.5, color: '#5A5A66' }}>
              <strong style={{ color: tierHex, fontWeight: 700 }}>
                {rankName} tier
              </strong>
              {talent.user.location ? (
                <>
                  <span style={{ color: '#9A9AA4' }}> · </span>
                  <span>{talent.user.location}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* View resume */}
          {talent.resumeUrl && (
            <div style={{ paddingBottom: 8, flexShrink: 0 }}>
              <a
                href={talent.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setResumeHover(true)}
                onMouseLeave={() => setResumeHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: resumeHover ? '#FAFAF8' : '#fff',
                  color: resumeHover ? '#0B0B0F' : '#5A5A66',
                  border: '1px solid #E7E7EC',
                  borderRadius: 10,
                  padding: '9px 14px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                View resume
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* ===== STATS STRIP ===== */}
        <div
          style={{
            marginTop: 24,
            border: '1px solid #E7E7EC',
            borderRadius: 14,
            padding: 20,
            background: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Total points
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: '#F5A524',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {talent.totalPoints.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              borderLeft: '1px solid #EAEAEF',
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Rank tier
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span
                style={{
                  width: 12,
                  height: 14,
                  background: shieldGradient,
                  display: 'inline-block',
                  clipPath:
                    'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)',
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#0B0B0F',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {rankName}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              borderLeft: '1px solid #EAEAEF',
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Completed
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: '#0B0B0F',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {talent._stats.completedAttempts}
            </div>
            <div style={{ fontSize: 11.5, color: '#7A7A86' }}>challenges</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              borderLeft: '1px solid #EAEAEF',
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Win rate
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: '#1F8A5B',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {winPct}%
            </div>
            <div style={{ fontSize: 11.5, color: '#7A7A86' }}>goal achieved</div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              borderLeft: '1px solid #EAEAEF',
              paddingLeft: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9A9AA4',
              }}
            >
              Streak
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: '#0B0B0F',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {talent.currentStreakDays > 0 ? `${talent.currentStreakDays}-day` : '—'}
            </div>
            <div style={{ fontSize: 11.5, color: '#7A7A86' }}>current</div>
          </div>
        </div>

        {/* ===== ACHIEVEMENTS ===== */}
        {talent.badges.length > 0 && (
          <div
            style={{
              marginTop: 18,
              border: '1px solid #E7E7EC',
              borderRadius: 14,
              padding: 22,
              background: '#FFFFFF',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: '-0.01em',
                color: '#0B0B0F',
                margin: '0 0 16px',
              }}
            >
              Achievements
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {talent.badges.map((b: EarnedBadge) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: '#FFFBF2',
                    border: '1px solid #F4E4C4',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{b.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#F5A524',
                        lineHeight: 1.2,
                      }}
                    >
                      {b.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#7A7A86',
                        marginTop: 1,
                      }}
                    >
                      {formatMonthYear(b.awardedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TWO-COLUMN LOWER SECTION ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.55fr 1fr',
            gap: 18,
            marginTop: 18,
          }}
        >
          {/* Left: Challenge activity heatmap */}
          <div
            style={{
              border: '1px solid #E7E7EC',
              borderRadius: 14,
              padding: 22,
              background: '#FFFFFF',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: '-0.01em',
                color: '#0B0B0F',
                margin: '0 0 16px',
              }}
            >
              Challenge activity
            </h3>
            <ActivityHeatmap weeks={26} showLegend={true} seed={heatSeed} />
          </div>

          {/* Right: Specializations + meta + verified */}
          <div
            style={{
              border: '1px solid #E7E7EC',
              borderRadius: 14,
              padding: 22,
              background: '#FFFFFF',
            }}
          >
            {/* Specializations */}
            <h3
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: '-0.01em',
                color: '#0B0B0F',
                margin: '0 0 12px',
              }}
            >
              Specializations
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 18,
              }}
            >
              {talent.specializationTags.length > 0 ? (
                talent.specializationTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '5px 11px',
                      borderRadius: 100,
                      background: '#FFFBF2',
                      border: '1px solid #F4E4C4',
                      color: '#8A6A1A',
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12.5, color: '#9A9AA4' }}>
                  No specializations listed.
                </span>
              )}
            </div>

            {/* Hairline divider + meta rows */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 11,
                paddingTop: 16,
                borderTop: '1px solid #EAEAEF',
                fontSize: 12.5,
              }}
            >
              {talent.experienceYears != null && talent.experienceYears > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#7A7A86' }}>Experience</span>
                  <span style={{ color: '#0B0B0F', fontWeight: 600 }}>
                    {talent.experienceYears} years
                  </span>
                </div>
              )}
              {talent.currentCompany && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ color: '#7A7A86', flexShrink: 0 }}>
                    Current company
                  </span>
                  <span
                    style={{
                      color: '#0B0B0F',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    {talent.currentCompany}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#7A7A86' }}>Status</span>
                {talent.openToWork ? (
                  <span style={{ color: '#1F8A5B', fontWeight: 600 }}>
                    Open to work
                  </span>
                ) : (
                  <span style={{ color: '#9A9AA4', fontWeight: 600 }}>
                    Not actively looking
                  </span>
                )}
              </div>
            </div>

            {/* Closdex verified */}
            <div
              style={{
                marginTop: 18,
                padding: '11px 13px',
                borderRadius: 10,
                background: '#FFFBF2',
                border: '1px solid #F4E4C4',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 9,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  color: '#F5A524',
                  lineHeight: 1,
                  marginTop: 1,
                }}
              >
                ✦
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#8A6A1A',
                    lineHeight: 1.2,
                  }}
                >
                  Closdex verified
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#7A7A86',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  Rank &amp; points earned on the Closdex platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        style={{
          textAlign: 'center',
          padding: '22px 32px 36px',
          fontSize: 12,
          color: '#7A7A86',
          borderTop: '1px solid #E7E7EC',
        }}
      >
        This profile is hosted on Closdex · closdex.in
      </div>
    </div>
  );
}
