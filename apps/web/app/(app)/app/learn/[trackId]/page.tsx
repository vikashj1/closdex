'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ApiError, LearningTrackSummary, TutorialDetail, TrackProgress, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type TrackWithTutorials = LearningTrackSummary & { tutorials: TutorialDetail[] };

function TutorialRow({
  tutorial,
  idx,
  done,
  onClick,
}: {
  tutorial: TutorialDetail;
  idx: number;
  done: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const num = String(idx + 1).padStart(2, '0');

  const baseBackground = done ? 'rgba(31,138,91,0.04)' : '#FFFFFF';
  const hoverBackground = done ? 'rgba(31,138,91,0.04)' : '#FAFAF8';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 10,
        border: `1px solid ${hovered ? '#C9C9D2' : '#E7E7EC'}`,
        background: hovered ? hoverBackground : baseBackground,
        cursor: 'pointer',
        minHeight: 62,
        textDecoration: 'none',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: 'rgba(245,165,36,0.14)',
          border: '1px solid rgba(245,165,36,0.25)',
          color: '#F5A524',
          fontFamily: "'Space Mono',monospace",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {num}
      </span>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: '#0B0B0F',
          }}
        >
          {tutorial.title}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            padding: '2px 8px',
            borderRadius: 100,
            background: '#FAFAF8',
            color: '#7A7A86',
            border: '1px solid #E7E7EC',
            fontFamily: "'Space Mono',monospace",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {tutorial.type}
        </span>
      </div>

      <div
        style={{
          flexShrink: 0,
          width: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#1F8A5B',
        }}
      >
        {done && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function TrackDetailPage() {
  const router = useRouter();
  const { trackId } = useParams<{ trackId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [track, setTrack] = useState<TrackWithTutorials | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => {
    if (authLoading || !trackId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const calls: Promise<unknown>[] = [api.learning.getTrack(trackId)];
    if (user) calls.push(api.learning.myProgress());

    Promise.all(calls)
      .then((results) => {
        if (cancelled) return;
        setTrack(results[0] as TrackWithTutorials);
        if (user) {
          const progressData = results[1] as TrackProgress[];
          const prog = progressData.find((p) => p.trackId === trackId);
          setCompletedIds(new Set(prog?.completedTutorialIds ?? []));
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load track.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, trackId]);

  if (authLoading) {
    return <div style={{ padding: 32, color: '#7A7A86' }}>Loading…</div>;
  }

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7A7A86' }}>Loading track…</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.25)',
            color: '#B91C1C',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!track) return null;

  const sortedTutorials = [...(track.tutorials ?? [])].sort((a, b) => a.order - b.order);
  const totalTutorials = sortedTutorials.length;
  const completedCount = sortedTutorials.filter((t) => completedIds.has(t.id)).length;
  const pct = totalTutorials > 0 ? Math.round((completedCount / totalTutorials) * 100) : 0;

  return (
    <div data-resp="learn-track" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px 80px' }}>
      {/* Back link */}
      <button
        onClick={() => router.push('/app/learn')}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: backHovered ? '#0B0B0F' : '#7A7A86',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 22,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'Inter,sans-serif',
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>←</span> Learning hub
      </button>

      {/* Track header */}
      <section style={{ marginBottom: 26 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '-0.02em',
              color: '#0B0B0F',
              lineHeight: 1.15,
            }}
          >
            {track.title}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 11px',
              borderRadius: 100,
              background: 'rgba(91,75,245,0.08)',
              border: '1px solid rgba(91,75,245,0.25)',
              color: '#3A2DC4',
              fontFamily: "'Space Mono',monospace",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {track.category}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter,sans-serif',
            fontSize: 14,
            color: '#5A5A66',
            lineHeight: 1.65,
            maxWidth: 760,
          }}
        >
          {track.description}
        </p>
      </section>

      {/* Progress */}
      {totalTutorials > 0 && (
        <section style={{ marginBottom: 28 }}>
          <div
            style={{
              height: 6,
              borderRadius: 100,
              background: '#F3F2F0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 100,
                background: '#F5A524',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#7A7A86',
              }}
            >
              {completedCount} / {totalTutorials} tutorials
            </span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#F5A524',
              }}
            >
              {pct}% complete
            </span>
          </div>
        </section>
      )}

      {/* Tutorial list */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sortedTutorials.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#7A7A86',
              fontSize: 13.5,
            }}
          >
            No tutorials in this track yet.
          </div>
        ) : (
          sortedTutorials.map((tutorial, idx) => (
            <TutorialRow
              key={tutorial.id}
              tutorial={tutorial}
              idx={idx}
              done={completedIds.has(tutorial.id)}
              onClick={() => router.push(`/app/learn/${trackId}/${tutorial.id}`)}
            />
          ))
        )}
      </section>
    </div>
  );
}
