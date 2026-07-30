'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, BadgeDefinition, EarnedBadge } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';

const S = {
  page: { padding: '28px 32px', maxWidth: 860 },
  heading: { fontSize: 28, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text)' } as React.CSSProperties,
  sub: { fontSize: 13.5, color: 'var(--text-dim)', margin: '0 0 28px 0' } as React.CSSProperties,
  sectionTitle: { fontSize: 15, fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text)' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: {
    textAlign: 'left' as const,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-mute)',
    borderBottom: '1px solid var(--border)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  td: { padding: '9px 10px', borderBottom: '1px solid var(--border-soft)', verticalAlign: 'middle' as const },
  field: { display: 'flex', flexDirection: 'column' as const, gap: 4, minWidth: 140 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  row: { display: 'flex', flexWrap: 'wrap' as const, gap: 10, alignItems: 'flex-end' },
  err: {
    padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12.5,
    background: 'color-mix(in oklch, var(--d-expert,#e05) 12%, transparent)',
    border: '1px solid color-mix(in oklch, var(--d-expert,#e05) 30%, transparent)',
    color: 'var(--d-expert,#e05)',
  },
  ok: {
    padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 12.5,
    background: 'color-mix(in oklch, var(--emerald) 12%, transparent)',
    border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
    color: 'var(--emerald)',
  },
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={S.field}>
      <span style={S.label}>{label}</span>
      <TextInput value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

// ─── Award badge modal ─────────────────────────────────────────────────────────

function AwardModal({
  badge,
  onClose,
  onAwarded,
}: {
  badge: BadgeDefinition;
  onClose: () => void;
  onAwarded: () => void;
}) {
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function award() {
    if (!userId.trim()) { setErr('Enter a user ID.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.badges.award(badge.id, userId.trim());
      onAwarded();
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg)', borderRadius: 12, padding: 28,
        width: 400, border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Award "{badge.name}"</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>{badge.description}</p>
        {err && <div style={S.err}>{err}</div>}
        <Field label="User ID" value={userId} onChange={setUserId} placeholder="paste user ID here" />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn kind="ghost" size="sm" onClick={onClose}>Cancel</Btn>
          <Btn kind="primary" size="sm" loading={saving} onClick={award}>Award Badge</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Create badge form ────────────────────────────────────────────────────────

function CreateBadgeForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    if (!code.trim() || !name.trim() || !description.trim()) {
      setErr('Code, name, and description are required.');
      return;
    }
    setSaving(true); setErr(null);
    try {
      await api.badges.createDefinition({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        iconUrl: iconUrl.trim() || undefined,
      });
      setCode(''); setName(''); setDescription(''); setIconUrl('');
      setOpen(false);
      onCreated();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div style={{ marginBottom: 20 }}>
        <Btn kind="primary" size="sm" onClick={() => setOpen(true)}>+ New Badge</Btn>
      </div>
    );
  }

  return (
    <Card padding={20} style={{ marginBottom: 20 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>New Badge Definition</h3>
      {err && <div style={S.err}>{err}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={S.row}>
          <Field label="Code (ALL_CAPS)" value={code} onChange={setCode} placeholder="FIRST_WIN" />
          <Field label="Name" value={name} onChange={setName} placeholder="First Win" />
        </div>
        <div>
          <span style={S.label}>Description</span>
          <div style={{ marginTop: 4 }}>
            <TextInput value={description} onChange={setDescription} placeholder="Completed your first challenge." />
          </div>
        </div>
        <Field label="Icon URL (optional, emoji ok)" value={iconUrl} onChange={setIconUrl} placeholder="🏅" />
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="primary" size="sm" loading={saving} onClick={create}>Create</Btn>
          <Btn kind="ghost" size="sm" onClick={() => { setOpen(false); setErr(null); }}>Cancel</Btn>
        </div>
      </div>
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AdminBadgesPage() {
  const { loading: authLoading } = useRequireAuth('ADMIN');
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [awardTarget, setAwardTarget] = useState<BadgeDefinition | null>(null);
  const [recentEarned, setRecentEarned] = useState<(EarnedBadge & { userId?: string })[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const defs = await api.badges.listDefinitions();
      setBadges(defs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (authLoading) return null;

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Badges</h1>
      <p style={S.sub}>Manage badge definitions and award them to salespeople.</p>

      <CreateBadgeForm onCreated={load} />

      {loading ? (
        <div style={{ color: 'var(--text-mute)', fontSize: 14, padding: '60px 0', textAlign: 'center' }}>
          Loading badges…
        </div>
      ) : (
        <Card padding={20}>
          <h2 style={S.sectionTitle}>Badge Definitions ({badges.length})</h2>
          {badges.length === 0 ? (
            <div style={{ color: 'var(--text-mute)', fontSize: 13, padding: '20px 0' }}>
              No badges defined yet. Create one above.
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  {['Code', 'Name', 'Description', ''].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {badges.map(b => (
                  <tr key={b.id}>
                    <td style={S.td}>
                      <code style={{ fontSize: 11.5, color: 'var(--cool)' }}>{b.code}</code>
                    </td>
                    <td style={S.td}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        {b.iconUrl && <span style={{ fontSize: 15 }}>{b.iconUrl}</span>}
                        {b.name}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: 'var(--text-dim)', fontSize: 12, maxWidth: 300 }}>
                      {b.description}
                    </td>
                    <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn kind="ghost" size="sm" onClick={() => setAwardTarget(b)}>Award</Btn>
                        <Btn kind="ghost" size="sm" onClick={async () => {
                          const name = window.prompt('New name:', b.name);
                          if (name == null) return;
                          const description = window.prompt('New description:', b.description) ?? b.description;
                          const iconUrl = window.prompt('Icon URL (empty for none):', b.iconUrl ?? '') ?? '';
                          try {
                            await api.badges.updateDefinition(b.id, {
                              name,
                              description,
                              iconUrl: iconUrl || null,
                            });
                            const defs = await api.badges.listDefinitions();
                            setBadges(defs);
                          } catch (err) {
                            window.alert((err as Error).message ?? 'Update failed.');
                          }
                        }}>Edit</Btn>
                        <Btn kind="ghost" size="sm" onClick={async () => {
                          if (!window.confirm(`Delete "${b.name}"? Blocked if any users have earned it.`)) return;
                          try {
                            await api.badges.deleteDefinition(b.id);
                            const defs = await api.badges.listDefinitions();
                            setBadges(defs);
                          } catch (err) {
                            window.alert((err as Error).message ?? 'Delete failed.');
                          }
                        }}>Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {awardTarget && (
        <AwardModal
          badge={awardTarget}
          onClose={() => setAwardTarget(null)}
          onAwarded={() => setRecentEarned(prev => prev)}
        />
      )}
    </div>
  );
}
