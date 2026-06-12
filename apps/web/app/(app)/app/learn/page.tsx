'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { ApiError, LearningTrackSummary, TrackProgress, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PublicLearnView } from '@/components/marketing/PublicLearnView';

export default function LearnPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tracks, setTracks] = useState<LearningTrackSummary[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, TrackProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const calls: Promise<unknown>[] = [api.learning.listTracks()];
    if (user) calls.push(api.learning.myProgress());

    Promise.all(calls)
      .then((results) => {
        if (cancelled) return;
        setTracks(results[0] as LearningTrackSummary[]);
        if (user) {
          const progressData = results[1] as TrackProgress[];
          const map = new Map<string, TrackProgress>();
          for (const p of progressData) {
            map.set(p.trackId, p);
          }
          setProgressMap(map);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load learning tracks.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [authLoading, user]);

  if (authLoading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }
  if (!user) return <PublicLearnView />;

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>
          Learning Hub
        </h1>
        <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 14 }}>
          Improve your sales craft. Earn points for every quiz you pass.
        </p>
      </div>

      {error && (
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
      )}

      {loading ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Loading tracks…</div>
      ) : tracks.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>
          No learning tracks yet — check back soon.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {tracks.map((track) => {
            const progress = progressMap.get(track.id);
            const totalTutorials = track.tutorials.length;
            const completedCount = progress?.completedTutorialIds.length ?? 0;
            const pct = totalTutorials > 0 ? Math.round((completedCount / totalTutorials) * 100) : 0;
            const isComplete = totalTutorials > 0 && completedCount >= totalTutorials;
            const hasProgress = completedCount > 0;

            return (
              <Card key={track.id} padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <h2
                    className="display"
                    style={{ fontSize: 18, margin: 0, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 }}
                  >
                    {track.title}
                  </h2>
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 9px',
                      borderRadius: 999,
                      fontSize: 11,
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

                {/* Description */}
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0, lineHeight: 1.55 }}>
                  {track.description}
                </p>

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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
                        {completedCount} / {totalTutorials} tutorials
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--gold)', fontWeight: 600 }}>
                        {pct}% complete
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 4 }}>
                  {isComplete && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        background: 'color-mix(in oklch, var(--emerald) 14%, transparent)',
                        color: 'var(--emerald)',
                        border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
                      }}
                    >
                      <Icon.check /> Complete
                    </span>
                  )}

                  {totalTutorials === 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: 'var(--bg-2)',
                        color: 'var(--text-mute)',
                        border: '1px solid var(--border-soft)',
                        marginLeft: 'auto',
                      }}
                    >
                      Coming soon
                    </span>
                  ) : (
                    <div style={{ marginLeft: 'auto' }}>
                      <Btn
                        kind={hasProgress ? 'primary' : 'ghost'}
                        size="sm"
                        icon={<Icon.arrow />}
                        onClick={() => router.push(`/learn/${track.id}`)}
                      >
                        {hasProgress ? 'Continue' : 'Start'}
                      </Btn>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
