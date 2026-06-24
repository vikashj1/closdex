'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, LearningTrackSummary, TrackProgress, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

// Learn — Vikash dashboard redesign 2026-06-16, wired 2026-06-18.
// Visual port of the new HTML kept intact; data layer pulled forward from the
// pre-redesign wiring (api.learning.listTracks + myProgress).

export default function LearnPage() {
  useRequireAuth('SALESPERSON');
  const router = useRouter();

  const [tracks, setTracks] = useState<LearningTrackSummary[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, TrackProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([api.learning.listTracks(), api.learning.myProgress()])
      .then(([trackList, progressData]) => {
        if (cancelled) return;
        setTracks(trackList);
        const map = new Map<string, TrackProgress>();
        for (const p of progressData) map.set(p.trackId, p);
        setProgressMap(map);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load learning tracks.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const headerBlock = (
    <div style={{ marginBottom: '8px' }}>
      <h1
        className="r-title"
        style={{
          margin: '0',
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: '700',
          fontSize: '33px',
          letterSpacing: '-0.03em',
          lineHeight: '1.05',
          color: '#0B0B0F',
        }}
      >
        Learning Hub
      </h1>
      <p style={{ margin: '10px 0 0', fontSize: '15px', color: '#7A7A86' }}>
        Improve your sales craft. Earn points for every quiz you pass.
      </p>
    </div>
  );

  const renderEmptyState = () => (
    <div
      style={{
        marginTop: '40px',
        borderTop: '1px solid #E7E7EC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '96px 24px 100px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(91,75,245,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '26px',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5B4BF5"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#9A9AA4',
          marginBottom: '16px',
        }}
      >
        Learning tracks
      </div>
      <h2
        style={{
          margin: '0',
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: '700',
          fontSize: '26px',
          letterSpacing: '-0.02em',
          color: '#0B0B0F',
        }}
      >
        No learning tracks yet
      </h2>
      <p
        style={{
          margin: '14px 0 0',
          fontSize: '14.5px',
          lineHeight: '1.6',
          color: '#7A7A86',
          maxWidth: '420px',
        }}
      >
        New tracks drop every week — discovery, objection handling, and closing modules are on the way. Check back soon.
      </p>
      <a
        href="/app/challenges"
        data-r="btnfull"
        style={{
          marginTop: '28px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#3A2DC4',
          textDecoration: 'none',
        }}
      >
        Earn points with a challenge instead
        <svg
          width="15"
          height="15"
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
  );

  const renderLoadingState = () => (
    <div
      style={{
        marginTop: '40px',
        borderTop: '1px solid #E7E7EC',
        padding: '96px 24px 100px',
        textAlign: 'center',
        color: '#7A7A86',
        fontSize: '14.5px',
      }}
    >
      Loading tracks…
    </div>
  );

  const renderErrorState = () => (
    <div
      style={{
        marginTop: '40px',
        borderTop: '1px solid #E7E7EC',
        padding: '96px 24px 100px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#C0392B',
          marginBottom: '16px',
        }}
      >
        Error
      </div>
      <p style={{ margin: '0', fontSize: '14.5px', color: '#7A7A86', maxWidth: '420px', marginInline: 'auto' }}>
        {error}
      </p>
    </div>
  );

  const renderTrackGrid = () => (
    <div
      data-learn-grid
      data-r="cols1-sm"
      style={{
        marginTop: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
        gap: '18px',
      }}
    >
      {tracks.map((track) => {
        const progress = progressMap.get(track.id);
        const total = track.tutorials.length;
        const completed = progress?.completedTutorialIds.length ?? 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <button
            key={track.id}
            type="button"
            onClick={() => router.push(`/app/learn/${track.id}`)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '22px 22px 20px',
              background: '#FFFFFF',
              border: '1px solid #E7E7EC',
              borderRadius: '18px',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#5B4BF5';
              e.currentTarget.style.boxShadow = '0 4px 18px -10px rgba(91,75,245,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E7E7EC';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <h2
                style={{
                  margin: '0',
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: '700',
                  fontSize: '18px',
                  letterSpacing: '-0.015em',
                  lineHeight: '1.3',
                  color: '#0B0B0F',
                }}
              >
                {track.title}
              </h2>
              <span
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: 'rgba(91,75,245,0.07)',
                  color: '#3A2DC4',
                  border: '1px solid rgba(91,75,245,0.2)',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: "'Space Mono',monospace",
                }}
              >
                {track.category}
              </span>
            </div>

            <p style={{ margin: '0', fontSize: '13.5px', color: '#7A7A86', lineHeight: '1.55' }}>
              {track.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
              <div
                style={{
                  height: '6px',
                  borderRadius: '999px',
                  background: '#F1F1F4',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: pct === 100 ? '#0E9F6E' : '#5B4BF5',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: "'Space Mono',monospace",
                  fontSize: '11.5px',
                }}
              >
                <span style={{ color: '#9A9AA4' }}>
                  {completed} / {total} tutorial{total === 1 ? '' : 's'}
                </span>
                <span style={{ color: pct === 100 ? '#0E9F6E' : '#3A2DC4', fontWeight: '700' }}>
                  {pct}%
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div data-resp="learn">
      <div className="r-page" style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        {headerBlock}
        {loading
          ? renderLoadingState()
          : error
          ? renderErrorState()
          : tracks.length === 0
          ? renderEmptyState()
          : renderTrackGrid()}
      </div>
    </div>
  );
}
