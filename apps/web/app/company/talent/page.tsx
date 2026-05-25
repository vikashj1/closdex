'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { TextInput } from '@/components/ui/TextInput';
import { ApiError, TalentSummary, api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { rankFromEnum, type RankName } from '@/lib/constants';

const RANK_OPTIONS: RankName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];

export default function TalentSearchPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');
  const [minRank, setMinRank] = useState<RankName>('Gold');
  const [openOnly, setOpenOnly] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [minExp, setMinExp] = useState('');
  const [items, setItems] = useState<TalentSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.talent
      .search({
        minRank: minRank.toUpperCase(),
        openToWork: openOnly || undefined,
        location: locationFilter || undefined,
        minExperienceYears: minExp ? Number(minExp) : undefined,
        perPage: 30,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load talent.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user, minRank, openOnly, locationFilter, minExp]);

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
      {/* Filters */}
      <aside style={{ borderRight: '1px solid var(--border-soft)', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="display" style={{ fontSize: 14, margin: 0, fontWeight: 700 }}>Filters</h3>
          <a style={{ fontSize: 11, color: 'var(--cool)', cursor: 'pointer' }}>Save search</a>
        </div>

        <div>
          <div style={FILTER_LBL}>Min rank</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {RANK_OPTIONS.map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '5px 8px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  background: minRank === r ? 'var(--surface-2)' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  checked={minRank === r}
                  onChange={() => setMinRank(r)}
                  style={{ accentColor: 'var(--cool)' }}
                />
                <RankBadge rank={r} size={14} />
                <span style={{ fontSize: 12.5 }}>{r}+</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Location</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {['Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Remote'].map((l) => (
              <button
                key={l}
                onClick={() => setLocationFilter(locationFilter === l ? '' : l)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: locationFilter === l ? '1px solid var(--cool)' : '1px solid var(--border)',
                  background: locationFilter === l ? 'color-mix(in oklch, var(--cool) 14%, transparent)' : 'transparent',
                  color: locationFilter === l ? 'var(--cool)' : 'var(--text-dim)',
                }}
              >{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Min experience (yrs)</div>
          <div style={{ marginTop: 10 }}>
            <TextInput
              placeholder="e.g. 3"
              value={minExp}
              onChange={(v) => setMinExp(v.replace(/\D/g, ''))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <div style={FILTER_LBL}>Availability</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              style={{ accentColor: 'var(--cool)' }}
            />{' '}
            Open to work only
          </label>
        </div>
      </aside>

      {/* Results */}
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <h1 className="display" style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>Talent search</h1>
            <p style={{ color: 'var(--text-mute)', fontSize: 12.5, margin: '4px 0 0' }}>
              {loading
                ? 'Searching…'
                : [
                    `Showing ${items.length} of ${total} candidates`,
                    `${minRank}+`,
                    openOnly ? 'open to work' : '',
                    locationFilter ? locationFilter : '',
                    minExp ? `${minExp}+ yrs` : '',
                  ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={SELECT_STYLE}>
              <option>Sort: Points (high → low)</option>
              <option>Sort: Win rate</option>
              <option>Sort: Recent activity</option>
            </select>
            <Btn kind="ghost" size="sm">Export CSV</Btn>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: '10px 12px',
              borderRadius: 8,
              background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
              color: 'var(--d-expert)',
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>Searching talent…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-mute)' }}>
            No candidates match these filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((c) => {
              const rank = rankFromEnum(c.rank);
              return (
                <Card
                  key={c.id}
                  hover
                  onClick={() => router.push(`/company/talent/${encodeURIComponent(c.publicSlug)}`)}
                  padding={18}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1.6fr 0.9fr 0.9fr auto', gap: 16, alignItems: 'center' }}>
                    <Avatar name={c.user.name} size={48} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{c.user.name}</span>
                        <RankBadge rank={rank} size={16} showLabel />
                        {c.openToWork && (
                          <span
                            style={{
                              fontSize: 10,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                              color: 'var(--emerald)',
                              fontWeight: 700,
                            }}
                          >
                            ● OPEN TO WORK
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        {c.location ?? '—'}
                        {c.experienceYears != null && ` · ${c.experienceYears} yrs experience`}
                        {c.expectedCtc && ` · expects ${c.expectedCtc}`}
                      </div>
                      {c.specializationTags.length > 0 && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 4 }}>
                          Strong in: <span style={{ color: 'var(--text-dim)' }}>{c.specializationTags.slice(0, 4).join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)' }}>
                        {c.totalPoints.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>total pts</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--cool)' }}>
                        {rank}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>tier</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Btn kind="primary" size="sm">View profile</Btn>
                      <Btn kind="ghost" size="sm">Save</Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const FILTER_LBL: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 600,
};

const SELECT_STYLE: CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: 12,
};
