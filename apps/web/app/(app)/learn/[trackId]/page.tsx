'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ApiError, LearningTrackSummary, TutorialDetail, TrackProgress, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type TrackWithTutorials = LearningTrackSummary & { tutorials: TutorialDetail[] };

export default function TrackDetailPage() {
  const router = useRouter();
  const { trackId } = useParams<{ trackId: string }>();
  const { user, loading: authLoading } = useAuth();

  const [track, setTrack] = useState<TrackWithTutorials | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    return () => { cancelled = true; };
  }, [authLoading, user, trackId]);

  if (authLoading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  if (loading) {
    return <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Loading track…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--d-expert) 35%, transparent)',
            color: 'var(--d-expert)',
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
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>
      {/* Back link */}
      <button
        onClick={() => router.push('/learn')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: 'var(--text-mute)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          padding: 0,
          alignSelf: 'flex-start',
        }}
      >
        ← Learning Hub
      </button>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {track.title}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 600,
              background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
              color: 'var(--cool)',
              border: '1px solid color-mix(in oklch, var(--cool) 28%, transparent)',
              whiteSpace: 'nowrap',
            }}
          >
            {track.category}
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0, lineHeight: 1.6 }}>
          {track.description}
        </p>
      </div>

      {/* Progress bar */}
      {totalTutorials > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-2)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 999,
                background: 'var(--gold)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
              {completedCount} / {totalTutorials} tutorials
            </span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--gold)', fontWeight: 600 }}>
              {pct}% complete
            </span>
          </div>
        </div>
      )}

      {/* Tutorial list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sortedTutorials.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 13.5 }}>
            No tutorials in this track yet.
          </div>
        ) : (
          sortedTutorials.map((tutorial, idx) => {
            const done = completedIds.has(tutorial.id);
            const num = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={tutorial.id}
                onClick={() => router.push(`/learn/${trackId}/${tutorial.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-soft)',
                  background: done
                    ? 'color-mix(in oklch, var(--emerald) 7%, var(--surface))'
                    : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease, border-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-soft)';
                }}
              >
                {/* Number badge */}
                <span
                  className="mono"
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    background: 'color-mix(in oklch, var(--gold) 14%, transparent)',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    fontSize: 13,
                    border: '1px solid color-mix(in oklch, var(--gold) 25%, transparent)',
                  }}
                >
                  {num}
                </span>

                {/* Title + type */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    {tutorial.title}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      padding: '2px 7px',
                      borderRadius: 999,
                      fontSize: 10.5,
                      fontWeight: 600,
                      background: 'var(--bg-2)',
                      color: 'var(--text-mute)',
                      border: '1px solid var(--border-soft)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tutorial.type}
                  </span>
                </div>

                {/* Completion indicator */}
                <div style={{ flexShrink: 0, width: 20, display: 'flex', justifyContent: 'center' }}>
                  {done && (
                    <span style={{ color: 'var(--emerald)', display: 'flex', alignItems: 'center' }}>
                      <Icon.check />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
