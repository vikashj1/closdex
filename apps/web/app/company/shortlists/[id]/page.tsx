'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError, ShortlistDetail } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { rankFromEnum, type RankName } from '@/lib/constants';

export default function ShortlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [shortlist, setShortlist] = useState<ShortlistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    api.shortlists
      .get(id)
      .then((sl) => { if (!cancelled) { setShortlist(sl); setLoading(false); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load shortlist.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [user, id]);

  const handleRemove = async (salespersonId: string) => {
    if (!shortlist) return;
    setRemoving(salespersonId);
    try {
      await api.shortlists.removeEntry(shortlist.id, salespersonId);
      setShortlist((prev) =>
        prev ? { ...prev, entries: prev.entries.filter((e) => e.salesperson.id !== salespersonId) } : prev,
      );
    } catch {
      // silently ignore
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading || !user || loading) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  if (error || !shortlist) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: 'var(--r-master)', marginBottom: 14 }}>{error ?? 'Shortlist not found.'}</div>
        <Btn kind="ghost" onClick={() => router.push('/company/shortlists')}>← Back to shortlists</Btn>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <Btn kind="ghost" size="sm" onClick={() => router.push('/company/shortlists')} style={{ marginBottom: 10 }}>
          ← Shortlists
        </Btn>
        <h1 className="display" style={{ fontSize: 26, margin: '0 0 4px', fontWeight: 700 }}>
          {shortlist.name}
        </h1>
        <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: 0 }}>
          {shortlist.entries.length} candidate{shortlist.entries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {shortlist.entries.length === 0 ? (
        <Card padding={32} style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-mute)', fontSize: 14 }}>No candidates in this shortlist yet.</div>
          <div style={{ color: 'var(--text-mute)', fontSize: 12.5, marginTop: 8 }}>
            Add candidates from the <span
              style={{ color: 'var(--cool)', cursor: 'pointer' }}
              onClick={() => router.push('/company/talent')}
            >Talent Search</span> page.
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shortlist.entries.map((entry) => {
            const sp = entry.salesperson;
            const rankName = rankFromEnum(sp.rank as any) as RankName;
            return (
              <Card key={entry.id} padding={18} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar name={sp.user.name} size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{sp.user.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <RankBadge rank={rankName} size={14} />
                      <span className="mono" style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                        {sp.totalPoints.toLocaleString()} pts
                      </span>
                      {sp.user.location && (
                        <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>{sp.user.location}</span>
                      )}
                      {sp.openToWork && (
                        <span style={{ fontSize: 10.5, padding: '2px 6px', borderRadius: 4, background: 'color-mix(in oklch, var(--emerald) 14%, transparent)', color: 'var(--emerald)', fontWeight: 600 }}>
                          OPEN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Btn
                    kind="ghost"
                    size="sm"
                    onClick={() => router.push(`/company/talent/${encodeURIComponent(sp.publicSlug)}`)}
                  >
                    View profile →
                  </Btn>
                  <button
                    disabled={removing === sp.id}
                    onClick={() => handleRemove(sp.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: removing === sp.id ? 'not-allowed' : 'pointer',
                      color: 'var(--text-mute)',
                      padding: 6,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      opacity: removing === sp.id ? 0.4 : 1,
                    }}
                    title="Remove from shortlist"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
