'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, LeaderboardEntry } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth';

// Leaderboard — Vikash dashboard redesign 2026-06-16, data-wired 2026-06-18.
// Visual port of the new HTML; data wiring layered on top of the new design.

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';
const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all-time', label: 'All-time' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const firstInitial = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase();
const formatPoints = (n: number) => n.toLocaleString('en-IN');

function tierLabel(rank: string): string {
  if (!rank) return 'Rookie';
  return rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
}

function tierColor(rank: string): string {
  switch ((rank || '').toUpperCase()) {
    case 'BRONZE': return '#F5A524';
    case 'SILVER': return '#C0C0C8';
    case 'GOLD': return '#F5C234';
    case 'PLATINUM': return '#9CC9FF';
    case 'DIAMOND': return '#7BD0E5';
    case 'MASTER': return '#C58CFF';
    case 'GRANDMASTER': return '#FF6B6B';
    default: return '#C0C0C8';
  }
}

function tierTextColor(rank: string): string {
  switch ((rank || '').toUpperCase()) {
    case 'BRONZE': return '#8A6A1A';
    default: return '#7A7A86';
  }
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  useRequireAuth('SALESPERSON');

  const [period, setPeriod] = useState<Period>('all-time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.leaderboards.list({ period, limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setEntries(res.entries);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Failed to load leaderboard.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [period]);

  const mySlug = user?.salesperson?.publicSlug;

  const podium = useMemo(() => {
    const first = entries.find((e) => e.position === 1);
    const second = entries.find((e) => e.position === 2);
    const third = entries.find((e) => e.position === 3);
    return { first, second, third };
  }, [entries]);

  const goToProfile = (slug: string) => {
    router.push(`/u/${slug}`);
  };

  return (
    <div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0', fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '33px', letterSpacing: '-0.03em', lineHeight: '1.05', color: '#0B0B0F' }}>Leaderboard</h1>
            <p style={{ margin: '10px 0 0', fontFamily: "'Space Mono',monospace", fontSize: '11.5px', letterSpacing: '0.04em', color: '#9A9AA4' }}>IT Sales · India · weekly resets every Monday 00:00 IST</p>
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '38px', padding: '0 15px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: '600', color: '#3A3A44', cursor: 'pointer' }}>All categories<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', border: '1px solid #E7E7EC', borderRadius: '10px', overflow: 'hidden' }}>
            {PERIODS.map((p, i) => {
              const active = period === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 500,
                    color: active ? '#fff' : '#3A3A44',
                    background: active ? '#0B0B0F' : '#fff',
                    border: 'none',
                    borderLeft: i === 0 ? 'none' : '1px solid #E7E7EC',
                    cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>
            Loading leaderboard…
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'Inter,sans-serif', fontSize: '13px', color: '#C0392B' }}>
            {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '20px', color: '#0B0B0F', marginBottom: '8px' }}>No rankings yet</div>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: '#7A7A86' }}>Be the first to complete a challenge and claim the top spot.</div>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <>
            {(podium.first || podium.second || podium.third) && (
              <section style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', background: 'radial-gradient(120% 140% at 50% 0%, #3A2D7A 0%, #221A45 42%, #14101F 74%, #0B0B0F 100%)', padding: '40px 36px 0', marginBottom: '46px' }}>
                <div style={{ position: 'absolute', top: '-70px', left: '50%', transform: 'translateX(-50%)', width: '420px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,165,36,0.16) 0%, rgba(245,165,36,0) 65%)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '30px' }}>

                  {podium.second && (
                    <PodiumSlot
                      entry={podium.second}
                      position={2}
                      isMe={!!mySlug && podium.second.salesperson.publicSlug === mySlug}
                      onClick={() => goToProfile(podium.second!.salesperson.publicSlug)}
                    />
                  )}

                  {podium.first && (
                    <PodiumSlot
                      entry={podium.first}
                      position={1}
                      isMe={!!mySlug && podium.first.salesperson.publicSlug === mySlug}
                      onClick={() => goToProfile(podium.first!.salesperson.publicSlug)}
                    />
                  )}

                  {podium.third && (
                    <PodiumSlot
                      entry={podium.third}
                      position={3}
                      isMe={!!mySlug && podium.third.salesperson.publicSlug === mySlug}
                      onClick={() => goToProfile(podium.third!.salesperson.publicSlug)}
                    />
                  )}
                </div>
              </section>
            )}

            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86', marginBottom: '14px' }}>Full ranking</div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 150px 110px', gap: '18px', alignItems: 'center', padding: '0 14px 12px' }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Rank</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Player</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>Tier</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4', textAlign: 'right' }}>Points</div>
              </div>
              {entries.map((entry, idx) => {
                const isMe = !!mySlug && entry.salesperson.publicSlug === mySlug;
                const isLast = idx === entries.length - 1;
                const tColor = tierColor(entry.salesperson.rank);
                const tTextColor = tierTextColor(entry.salesperson.rank);
                const pointsColor = entry.score > 0 ? '#F5A524' : '#C2C2CC';
                return (
                  <div
                    key={entry.salesperson.publicSlug}
                    onClick={() => goToProfile(entry.salesperson.publicSlug)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '64px 1fr 150px 110px',
                      gap: '18px',
                      alignItems: 'center',
                      padding: '14px',
                      borderTop: '1px solid #E7E7EC',
                      borderBottom: isLast ? '1px solid #E7E7EC' : 'none',
                      background: isMe ? 'rgba(91,75,245,0.06)' : 'transparent',
                      boxShadow: isMe ? 'inset 2px 0 0 #5B4BF5' : 'none',
                      borderRadius: isMe ? '8px' : '0',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '13px', fontWeight: '700', color: isMe ? '#3A2DC4' : (entry.position <= 3 ? '#3A2DC4' : '#9A9AA4') }}>
                      {pad2(entry.position)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: '0' }}>
                      <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: isMe ? '#0B0B0F' : '#EFEFF3', color: isMe ? '#fff' : '#3A3A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: '600', fontSize: '12px', flexShrink: 0 }}>
                        {firstInitial(entry.salesperson.name)}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: isMe ? 600 : 500, color: '#0B0B0F' }}>
                        {entry.salesperson.name}
                        {isMe && <span style={{ color: '#7A7A86', fontWeight: 400 }}> · You</span>}
                      </span>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: tTextColor }}>
                      <span style={{ width: '10px', height: '12px', background: tColor, display: 'inline-block', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }}></span>
                      {tierLabel(entry.salesperson.rank)}
                    </span>
                    <span style={{ textAlign: 'right', fontFamily: "'Space Mono',monospace", fontSize: '14px', fontWeight: '700', color: pointsColor }}>
                      {formatPoints(entry.score)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

function PodiumSlot({
  entry,
  position,
  isMe,
  onClick,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  isMe: boolean;
  onClick: () => void;
}) {
  const isFirst = position === 1;
  const blockHeight = position === 1 ? 108 : position === 2 ? 78 : 60;
  const avatarSize = isFirst ? 66 : 52;
  const avatarFontSize = isFirst ? 24 : 18;
  const tColor = tierColor(entry.salesperson.rank);
  const tLabel = tierLabel(entry.salesperson.rank);
  const tierBg = isFirst ? `rgba(245,165,36,0.16)` : 'rgba(255,255,255,0.08)';
  const tierTextColorPodium = isFirst ? '#F5A524' : 'rgba(255,255,255,0.72)';
  const pointsColor = isFirst ? '#F5A524' : '#FFFFFF';
  const pointsFontSize = isFirst ? '30px' : '23px';
  const blockBg = isFirst ? 'linear-gradient(180deg,#F7B948,#D98A1C)' : 'rgba(255,255,255,0.06)';
  const blockNumColor = isFirst ? '#2A1D06' : 'rgba(255,255,255,0.55)';
  const avatarShadow = isFirst
    ? '0 0 0 3px #F5A524, 0 0 0 7px rgba(245,165,36,0.22)'
    : '0 0 0 2px rgba(255,255,255,0.16)';

  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '160px', cursor: 'pointer' }}
    >
      {isFirst ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A524" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          <path d="M5 21h14" />
        </svg>
      ) : (
        <div style={{ height: '30px' }}></div>
      )}
      <div style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%', background: '#211A3D', boxShadow: avatarShadow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: '600', fontSize: `${avatarFontSize}px`, color: '#fff', marginBottom: '14px' }}>
        {firstInitial(entry.salesperson.name)}
      </div>
      <div style={{ fontSize: '14.5px', fontWeight: '600', color: '#fff', marginBottom: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '7px' }}>
        {entry.salesperson.name}
        {isMe && (
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3A2DC4', background: '#fff', padding: '2px 6px', borderRadius: '5px' }}>
            You
          </span>
        )}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '100px', background: tierBg }}>
        <span style={{ width: '9px', height: '11px', background: tColor, display: 'inline-block', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }}></span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: tierTextColorPodium }}>
          {tLabel}
        </span>
      </div>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: pointsFontSize, letterSpacing: '-0.02em', color: pointsColor, marginTop: '12px' }}>
        {formatPoints(entry.score)}
      </div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
        points
      </div>
      <div style={{ marginTop: '18px', width: '122px', height: `${blockHeight}px`, background: blockBg, borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14px' }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: '700', fontSize: '30px', color: blockNumColor }}>
          {pad2(position)}
        </span>
      </div>
    </div>
  );
}
