'use client';

import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, ApiError, TalentDetail } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { rankFromEnum } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';

export default function CandidateProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.id as string;

  const { loading: authLoading } = useRequireAuth('COMPANY');

  const [profile, setProfile] = useState<TalentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    api.talent
      .getBySlug(slug)
      .then((data) => setProfile(data))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : 'Failed to load candidate profile.');
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, slug]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        Loading profile…
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Candidate not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-mute)', marginBottom: 20 }}>
          This profile may have been removed or the link is incorrect.
        </div>
        <Btn kind="secondary" size="md" onClick={() => router.push('/company/talent')}>
          Back to talent search
        </Btn>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  if (!profile) return null;

  const rankName = rankFromEnum(profile.rank);
  const rankVar = `var(--r-${profile.rank.toLowerCase()})`;
  const winPct = Math.round(profile._stats.winRate * 100);

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
            <Avatar name={profile.user.name} size={104} />
            <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
              <RankBadge rank={rankName} size={40} />
            </div>
          </div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>{profile.user.name}</h1>
              {profile.openToWork && (
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
                  OPEN TO WORK
                </span>
              )}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              <strong style={{ color: rankVar }}>{rankName} tier</strong>
              {profile.user.location ? ` · ${profile.user.location}` : ''}
              {profile.experienceYears ? ` · ${profile.experienceYears} yrs` : ''}
              {profile.specializationTags.length > 0 ? ` · ${profile.specializationTags.slice(0, 3).join(' / ')}` : ''}
            </div>
            {profile.currentCompany && (
              <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 6 }}>
                Currently at {profile.currentCompany}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn kind="ghost" size="md">Save to shortlist</Btn>
            <Btn kind="primary" size="md" style={{ background: 'var(--cool)', color: 'white' }}>
              Contact
            </Btn>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginTop: 28,
            padding: '20px 0',
            borderTop: '1px solid var(--border-soft)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <StatBox label="Total points"    value={profile.totalPoints.toLocaleString()} accent="var(--gold)" />
          <StatBox label="Challenges done" value={String(profile._stats.completedAttempts)} sub={`of ${profile._stats.totalAttempts} total`} />
          <StatBox label="Win rate"        value={`${winPct}%`} sub="avg goal achieved" accent="var(--emerald)" />
          <StatBox label="Current streak"  value={`${profile.currentStreakDays}d`} sub="consecutive days" accent="var(--cool)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginTop: 22 }}>
          {/* Left: specializations + performance summary */}
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>
              Specializations
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
              {profile.specializationTags.length > 0
                ? profile.specializationTags.map((tag) => (
                    <Chip key={tag} color="var(--cool)">{tag}</Chip>
                  ))
                : <span style={{ fontSize: 13, color: 'var(--text-mute)' }}>No specializations listed.</span>
              }
            </div>

            <div style={{ paddingTop: 18, borderTop: '1px solid var(--border-soft)' }}>
              <h4
                className="display"
                style={{ fontSize: 13, margin: '0 0 12px', fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Performance overview
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <MetricBlock label="Total attempts"     value={String(profile._stats.totalAttempts)} />
                <MetricBlock label="Completed"          value={String(profile._stats.completedAttempts)} accent="var(--emerald)" />
                <MetricBlock label="Win rate"           value={`${winPct}%`} accent="var(--emerald)" />
                <MetricBlock label="Streak"             value={`${profile.currentStreakDays} days`} accent="var(--cool)" />
              </div>
            </div>
          </Card>

          {/* Right: career intent + resume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Career intent</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                <Row
                  k="Status"
                  v={
                    profile.openToWork
                      ? <span style={{ color: 'var(--emerald)' }}>Open to work</span>
                      : <span style={{ color: 'var(--text-mute)' }}>Not actively looking</span>
                  }
                />
                {profile.user.location && <Row k="Location" v={profile.user.location} />}
                {profile.experienceYears != null && (
                  <Row k="Experience" v={`${profile.experienceYears} years`} />
                )}
                {profile.currentCompany && <Row k="Current company" v={profile.currentCompany} />}
                <Row k="Rank" v={<span style={{ color: rankVar, fontWeight: 600 }}>{rankName}</span>} />
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Resume &amp; contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {profile.resumeUrl ? (
                  <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" style={RESUME_LINK}>
                    Resume / CV
                  </a>
                ) : (
                  <span style={{ ...RESUME_LINK, color: 'var(--text-mute)', cursor: 'default' }}>No resume uploaded</span>
                )}
                <span style={{ ...RESUME_LINK, color: 'var(--text-mute)', cursor: 'default' }}>
                  Email · Unlocked on shortlist
                </span>
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
                Contact details unlock when you shortlist or message this candidate.
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

function StatBox({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div className="display mono" style={{ fontSize: 26, fontWeight: 700, color: accent ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{sub}</div>}
    </div>
  );
}

function MetricBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--bg-2)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: accent ?? 'var(--text)' }}>{value}</div>
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
  textDecoration: 'none',
};
