'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, ApiError } from '@/lib/api';

interface Flag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  rollout: number;
  publicRead: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

/** Seeded flag catalog — flags we know exist in code and want visible in the
 *  UI even before an admin has toggled them once. Missing here is fine — the
 *  page also merges in whatever `/admin/feature-flags` returns. */
const SEEDED: Array<Pick<Flag, 'key' | 'label' | 'description' | 'publicRead'>> = [
  {
    key: 'show_company_tab',
    label: 'Show company signup tab',
    description: 'Reveals the "I\'m a company" tab on /signup. Phase 1 hides it; enable to open company self-serve signup.',
    publicRead: true,
  },
];

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const existing = await api.admin.featureFlags.list();
      const existingKeys = new Set(existing.map((f) => f.key));
      // Merge seeded entries the admin hasn't upserted yet with sane defaults.
      const merged: Flag[] = [
        ...existing,
        ...SEEDED.filter((s) => !existingKeys.has(s.key)).map((s) => ({
          ...s,
          enabled: false,
          rollout: 100,
          updatedBy: null,
          updatedAt: '',
        })),
      ];
      setFlags(merged.sort((a, b) => a.key.localeCompare(b.key)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load flags.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function persist(f: Flag, patch: Partial<Flag>) {
    setBusy(f.key);
    setError(null);
    try {
      await api.admin.featureFlags.upsert(f.key, {
        label: patch.label ?? f.label,
        description: patch.description ?? f.description,
        enabled: patch.enabled ?? f.enabled,
        rollout: patch.rollout ?? f.rollout,
        publicRead: patch.publicRead ?? f.publicRead,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Feature flags</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>
          Toggle features live. Public flags are exposed unauthenticated at <code>/feature-flags</code>; admin-only flags stay server-side.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(200,50,50,0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>Loading…</div>}

      {!loading && flags.length === 0 && (
        <Card style={{ padding: 24, textAlign: 'center', color: 'var(--text-mute)' }}>
          No flags defined yet. Seed one in code (see SEEDED array in this file) then reload.
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {flags.map((f) => (
          <Card key={f.key} style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.label}</div>
                  {f.publicRead && (
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(31,138,91,0.15)', color: '#1F8A5B', fontWeight: 700, letterSpacing: '0.05em' }}>
                      PUBLIC
                    </span>
                  )}
                </div>
                <code style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>{f.key}</code>
                <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  {f.description}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minWidth: 200 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: f.enabled ? '#1F8A5B' : 'var(--text-mute)' }}>
                    {f.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <input
                    type="checkbox"
                    checked={f.enabled}
                    disabled={busy === f.key}
                    onChange={(e) => persist(f, { enabled: e.target.checked })}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>Rollout</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={f.rollout}
                    disabled={busy === f.key || !f.enabled}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (!Number.isFinite(n)) return;
                      setFlags((prev) => prev.map((x) => (x.key === f.key ? { ...x, rollout: n } : x)));
                    }}
                    onBlur={() => persist(f, { rollout: f.rollout })}
                    style={{
                      width: 60,
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-2)',
                      color: 'var(--text)',
                      fontSize: 12,
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>%</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11, color: 'var(--text-mute)' }}>
                  <input
                    type="checkbox"
                    checked={f.publicRead}
                    disabled={busy === f.key}
                    onChange={(e) => persist(f, { publicRead: e.target.checked })}
                  />
                  Public read
                </label>
              </div>
            </div>
            {f.updatedAt && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-soft)', fontSize: 11, color: 'var(--text-mute)' }}>
                Last updated {new Date(f.updatedAt).toLocaleString()} {f.updatedBy ? `· ${f.updatedBy}` : ''}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
