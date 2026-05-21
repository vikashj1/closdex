'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, ApiError, TalentDetail } from '@/lib/api';
import { rankFromEnum } from '@/lib/constants';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Stat } from '@/components/ui/Stat';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';

export default function PublicProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [talent, setTalent] = useState<TalentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api.talent
      .getBySlug(slug)
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
          background: 'var(--bg)',
          color: 'var(--text-mute)',
          fontSize: 14,
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
          background: 'var(--bg)',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 40 }}>404</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Profile not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
          This profile may have been removed or the link is incorrect.
        </div>
        <a
          href="https://closdex.in"
          style={{
            marginTop: 8,
            fontSize: 13,
            color: 'var(--gold)',
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
          background: 'var(--bg)',
          color: 'var(--text-dim)',
          fontSize: 14,
        }}
      >
        {error}
      </div>
    );
  }

  if (!talent) return null;

  const rankName = rankFromEnum(talent.rank);
  const rankVar = `var(--r-${talent.rank.toLowerCase()})`;
  const winPct = Math.round(talent._stats.winRate * 100);
  const heatSeed = talent.totalPoints % 200;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero banner */}
      <div
        style={{
          height: 120,
          background:
            'linear-gradient(135deg, color-mix(in oklch, var(--gold) 25%, var(--bg-2)), var(--bg-2))',
          position: 'relative',
        }}
      />

      <div style={{ padding: '0 32px 56px', maxWidth: 900, margin: '0 auto' }}>
        {/* Avatar + name row */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-end',
            marginTop: -50,
          }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar name={talent.user.name} size={100} />
            <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
              <RankBadge rank={rankName} size={38} />
            </div>
          </div>

          <div style={{ flex: 1, paddingBottom: 8, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h1
                className="display"
                style={{ fontSize: 28, margin: 0, fontWeight: 700, lineHeight: 1.1 }}
              >
                {talent.user.name}
              </h1>
              {talent.openToWork && (
                <span
                  style={{
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                    color: 'var(--emerald)',
                    border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  ● OPEN TO WORK
                </span>
              )}
            </div>

            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              <strong style={{ color: rankVar }}>{rankName} tier</strong>
              {talent.user.location ? ` · ${talent.user.location}` : ''}
            </div>
          </div>

          {talent.resumeUrl && (
            <div style={{ paddingBottom: 8, flexShrink: 0 }}>
              <Btn
                kind="ghost"
                size="sm"
                onClick={() => window.open(talent.resumeUrl!, '_blank', 'noopener,noreferrer')}
              >
                View Resume →
              </Btn>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <Card
          padding={20}
          style={{
            marginTop: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}
        >
          <Stat
            label="Total points"
            value={talent.totalPoints.toLocaleString()}
            accent="var(--gold)"
          />
          <Stat label="Rank tier" value={rankName} />
          <Stat
            label="Completed"
            value={String(talent._stats.completedAttempts)}
            sub="challenges"
          />
          <Stat
            label="Win rate"
            value={`${winPct}%`}
            sub="goal achieved"
            accent="var(--emerald)"
          />
          <Stat
            label="Streak"
            value={talent.currentStreakDays > 0 ? `${talent.currentStreakDays}-day` : '—'}
            sub={talent.currentStreakDays > 0 ? 'current streak' : undefined}
          />
        </Card>

        {/* Two-column lower section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.55fr 1fr',
            gap: 18,
            marginTop: 18,
          }}
        >
          {/* Left: activity heatmap */}
          <Card padding={22}>
            <h3
              className="display"
              style={{ fontSize: 15, margin: '0 0 16px', fontWeight: 600 }}
            >
              Challenge activity
            </h3>
            <ActivityHeatmap weeks={26} showLegend={true} seed={heatSeed} />
          </Card>

          {/* Right: details */}
          <Card padding={22}>
            {/* Specializations */}
            <h3
              className="display"
              style={{ fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}
            >
              Specializations
            </h3>
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}
            >
              {talent.specializationTags.length > 0 ? (
                talent.specializationTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: 'color-mix(in oklch, var(--gold) 12%, var(--bg-2))',
                      border: '1px solid color-mix(in oklch, var(--gold) 28%, var(--border-soft))',
                      color: 'var(--gold)',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>
                  No specializations listed.
                </span>
              )}
            </div>

            {/* Meta rows */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingTop: 16,
                borderTop: '1px solid var(--border-soft)',
                fontSize: 12.5,
              }}
            >
              {talent.experienceYears != null && talent.experienceYears > 0 && (
                <MetaRow label="Experience" value={`${talent.experienceYears} years`} />
              )}
              {talent.currentCompany && (
                <MetaRow label="Current company" value={talent.currentCompany} />
              )}
              <MetaRow
                label="Status"
                value={
                  talent.openToWork ? (
                    <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>
                      Open to work
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-mute)' }}>Not actively looking</span>
                  )
                }
              />
            </div>

            {/* Closdex verified badge */}
            <div
              style={{
                marginTop: 18,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'color-mix(in oklch, var(--gold) 8%, var(--bg-2))',
                border: '1px solid color-mix(in oklch, var(--gold) 22%, var(--border-soft))',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>✦</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                  Closdex verified
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>
                  Rank &amp; points earned on the Closdex platform
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer note */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px 32px 32px',
          fontSize: 12,
          color: 'var(--text-mute)',
          borderTop: '1px solid var(--border-soft)',
        }}
      >
        This profile is hosted on Closdex · closdex.in
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-mute)' }}>{label}</span>
      <span style={{ textAlign: 'right' }}>{value}</span>
    </div>
  );
}
