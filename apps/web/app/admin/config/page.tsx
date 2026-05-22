'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';

// ─── types ───────────────────────────────────────────────────────────────────

interface TierRow {
  tier: string;
  color: string;
  basePoints: number;
  leadBehavior: string;
}

interface GoalRow {
  goalType: string;
  label: string;
  multiplier: number;
}

interface RankRow {
  rank: string;
  minPoints: number;
  maxPoints: number | null;
  privileges: string;
}

interface RuleRow {
  key: string;
  value: number;
  note?: string;
}

interface DimensionRow {
  id: string;
  name: string;
  weight: number;
}

// ─── styles ───────────────────────────────────────────────────────────────────

const S = {
  page: { padding: '28px 32px', maxWidth: 960 },
  heading: { fontSize: 28, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text)' } as React.CSSProperties,
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
  td: { padding: '8px 10px', borderBottom: '1px solid var(--border-soft)', verticalAlign: 'top' as const },
  editRow: {
    background: 'color-mix(in oklch, var(--cool) 6%, var(--bg-2))',
    padding: 14,
    borderRadius: 8,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
    marginTop: 4,
  },
  fieldWrap: { display: 'flex', flexDirection: 'column' as const, gap: 4, minWidth: 120 },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
  errBanner: {
    padding: '10px 14px',
    borderRadius: 8,
    background: 'color-mix(in oklch, var(--d-expert, #e05) 12%, transparent)',
    border: '1px solid color-mix(in oklch, var(--d-expert, #e05) 30%, transparent)',
    color: 'var(--d-expert, #e05)',
    fontSize: 12.5,
    marginBottom: 20,
  },
  okBanner: {
    padding: '10px 14px',
    borderRadius: 8,
    background: 'color-mix(in oklch, var(--emerald) 12%, transparent)',
    border: '1px solid color-mix(in oklch, var(--emerald) 30%, transparent)',
    color: 'var(--emerald)',
    fontSize: 12.5,
    marginBottom: 12,
  },
};

// ─── generic field component ──────────────────────────────────────────────────

function Field({
  label, value, onChange, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div style={S.fieldWrap}>
      <span style={S.label}>{label}</span>
      <TextInput value={value} onChange={onChange} type={type} />
    </div>
  );
}

// ─── Difficulty Tiers ─────────────────────────────────────────────────────────

function TiersSection({ rows, onReload }: { rows: TierRow[]; onReload: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<TierRow>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function startEdit(row: TierRow) {
    setEditing(row.tier);
    setDraft({ color: row.color, basePoints: row.basePoints, leadBehavior: row.leadBehavior });
    setErr(null); setOk(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      await api.admin.config.updateTier(editing, {
        color: draft.color,
        basePoints: draft.basePoints !== undefined ? Number(draft.basePoints) : undefined,
        leadBehavior: draft.leadBehavior,
      });
      setOk(`${editing} updated.`);
      setEditing(null);
      onReload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding={20}>
      <h2 style={S.sectionTitle}>Difficulty Tiers</h2>
      {ok && <div style={S.okBanner}>{ok}</div>}
      {err && <div style={S.errBanner}>{err}</div>}
      <table style={S.table}>
        <thead>
          <tr>
            {['Tier', 'Base Pts', 'Color', 'Lead Behavior', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.tier}>
                <td style={S.td}><strong>{row.tier}</strong></td>
                <td style={S.td}>{row.basePoints}</td>
                <td style={S.td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: row.color, border: '1px solid var(--border)' }} />
                    {row.color}
                  </span>
                </td>
                <td style={{ ...S.td, maxWidth: 240, wordBreak: 'break-word' }}>{row.leadBehavior}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Btn kind="ghost" size="sm" onClick={() => editing === row.tier ? setEditing(null) : startEdit(row)}>
                    {editing === row.tier ? 'Cancel' : 'Edit'}
                  </Btn>
                </td>
              </tr>
              {editing === row.tier && (
                <tr key={`${row.tier}-edit`}>
                  <td colSpan={5} style={S.td}>
                    <div style={S.editRow}>
                      <Field label="Color" value={String(draft.color ?? '')} onChange={v => setDraft(d => ({ ...d, color: v }))} />
                      <Field label="Base Points" value={String(draft.basePoints ?? '')} onChange={v => setDraft(d => ({ ...d, basePoints: Number(v) }))} type="number" />
                      <Field label="Lead Behavior" value={String(draft.leadBehavior ?? '')} onChange={v => setDraft(d => ({ ...d, leadBehavior: v }))} />
                      <Btn kind="primary" size="sm" loading={saving} onClick={save}>Save</Btn>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Goal Types ───────────────────────────────────────────────────────────────

function GoalsSection({ rows, onReload }: { rows: GoalRow[]; onReload: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<GoalRow>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function startEdit(row: GoalRow) {
    setEditing(row.goalType);
    setDraft({ label: row.label, multiplier: row.multiplier });
    setErr(null); setOk(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      await api.admin.config.updateGoal(editing, {
        label: draft.label,
        multiplier: draft.multiplier !== undefined ? Number(draft.multiplier) : undefined,
      });
      setOk(`${editing} updated.`);
      setEditing(null);
      onReload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding={20}>
      <h2 style={S.sectionTitle}>Goal Types</h2>
      {ok && <div style={S.okBanner}>{ok}</div>}
      {err && <div style={S.errBanner}>{err}</div>}
      <table style={S.table}>
        <thead>
          <tr>
            {['Goal Type', 'Label', 'Multiplier', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.goalType}>
                <td style={S.td}><strong>{row.goalType}</strong></td>
                <td style={S.td}>{row.label}</td>
                <td style={S.td}>{row.multiplier}×</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Btn kind="ghost" size="sm" onClick={() => editing === row.goalType ? setEditing(null) : startEdit(row)}>
                    {editing === row.goalType ? 'Cancel' : 'Edit'}
                  </Btn>
                </td>
              </tr>
              {editing === row.goalType && (
                <tr key={`${row.goalType}-edit`}>
                  <td colSpan={4} style={S.td}>
                    <div style={S.editRow}>
                      <Field label="Label" value={String(draft.label ?? '')} onChange={v => setDraft(d => ({ ...d, label: v }))} />
                      <Field label="Multiplier" value={String(draft.multiplier ?? '')} onChange={v => setDraft(d => ({ ...d, multiplier: Number(v) }))} type="number" />
                      <Btn kind="primary" size="sm" loading={saving} onClick={save}>Save</Btn>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Ranks ────────────────────────────────────────────────────────────────────

function RanksSection({ rows, onReload }: { rows: RankRow[]; onReload: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<RankRow & { maxPointsStr: string }>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function startEdit(row: RankRow) {
    setEditing(row.rank);
    setDraft({ minPoints: row.minPoints, maxPointsStr: row.maxPoints === null ? '' : String(row.maxPoints), privileges: row.privileges });
    setErr(null); setOk(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      const maxPts = draft.maxPointsStr === '' ? null : Number(draft.maxPointsStr);
      await api.admin.config.updateRank(editing, {
        minPoints: draft.minPoints !== undefined ? Number(draft.minPoints) : undefined,
        maxPoints: maxPts,
        privileges: draft.privileges,
      });
      setOk(`${editing} updated.`);
      setEditing(null);
      onReload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding={20}>
      <h2 style={S.sectionTitle}>Ranks</h2>
      {ok && <div style={S.okBanner}>{ok}</div>}
      {err && <div style={S.errBanner}>{err}</div>}
      <table style={S.table}>
        <thead>
          <tr>
            {['Rank', 'Min Pts', 'Max Pts', 'Privileges', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.rank}>
                <td style={S.td}><strong>{row.rank}</strong></td>
                <td style={S.td}>{row.minPoints.toLocaleString()}</td>
                <td style={S.td}>{row.maxPoints === null ? '∞' : row.maxPoints.toLocaleString()}</td>
                <td style={{ ...S.td, maxWidth: 260, wordBreak: 'break-word' }}>{row.privileges}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Btn kind="ghost" size="sm" onClick={() => editing === row.rank ? setEditing(null) : startEdit(row)}>
                    {editing === row.rank ? 'Cancel' : 'Edit'}
                  </Btn>
                </td>
              </tr>
              {editing === row.rank && (
                <tr key={`${row.rank}-edit`}>
                  <td colSpan={5} style={S.td}>
                    <div style={S.editRow}>
                      <Field label="Min Points" value={String(draft.minPoints ?? '')} onChange={v => setDraft(d => ({ ...d, minPoints: Number(v) }))} type="number" />
                      <Field label="Max Points (blank=∞)" value={String(draft.maxPointsStr ?? '')} onChange={v => setDraft(d => ({ ...d, maxPointsStr: v }))} type="number" />
                      <Field label="Privileges" value={String(draft.privileges ?? '')} onChange={v => setDraft(d => ({ ...d, privileges: v }))} />
                      <Btn kind="primary" size="sm" loading={saving} onClick={save}>Save</Btn>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Scoring Rules ────────────────────────────────────────────────────────────

function RulesSection({ rows, onReload }: { rows: RuleRow[]; onReload: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<RuleRow>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function startEdit(row: RuleRow) {
    setEditing(row.key);
    setDraft({ value: row.value, note: row.note ?? '' });
    setErr(null); setOk(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      await api.admin.config.updateRule(editing, {
        value: Number(draft.value),
        note: draft.note || undefined,
      });
      setOk(`${editing} updated.`);
      setEditing(null);
      onReload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding={20}>
      <h2 style={S.sectionTitle}>Scoring Rules</h2>
      {ok && <div style={S.okBanner}>{ok}</div>}
      {err && <div style={S.errBanner}>{err}</div>}
      <table style={S.table}>
        <thead>
          <tr>
            {['Key', 'Value', 'Note', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.key}>
                <td style={S.td}><code style={{ fontSize: 12 }}>{row.key}</code></td>
                <td style={S.td}>{row.value}</td>
                <td style={{ ...S.td, color: 'var(--text-dim)', fontSize: 12 }}>{row.note ?? '—'}</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Btn kind="ghost" size="sm" onClick={() => editing === row.key ? setEditing(null) : startEdit(row)}>
                    {editing === row.key ? 'Cancel' : 'Edit'}
                  </Btn>
                </td>
              </tr>
              {editing === row.key && (
                <tr key={`${row.key}-edit`}>
                  <td colSpan={4} style={S.td}>
                    <div style={S.editRow}>
                      <Field label="Value" value={String(draft.value ?? '')} onChange={v => setDraft(d => ({ ...d, value: Number(v) }))} type="number" />
                      <Field label="Note" value={String(draft.note ?? '')} onChange={v => setDraft(d => ({ ...d, note: v }))} />
                      <Btn kind="primary" size="sm" loading={saving} onClick={save}>Save</Btn>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── Rubric Dimensions ────────────────────────────────────────────────────────

function DimensionsSection({ rows, onReload }: { rows: DimensionRow[]; onReload: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<DimensionRow>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function startEdit(row: DimensionRow) {
    setEditing(row.id);
    setDraft({ name: row.name, weight: row.weight });
    setErr(null); setOk(null);
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      await api.admin.config.updateDimension(editing, {
        name: draft.name,
        weight: draft.weight !== undefined ? Number(draft.weight) : undefined,
      });
      setOk('Dimension updated.');
      setEditing(null);
      onReload();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);

  return (
    <Card padding={20}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h2 style={{ ...S.sectionTitle, margin: 0 }}>Rubric Dimensions</h2>
        <span style={{
          fontSize: 11.5,
          color: Math.abs(totalWeight - 1) < 0.001 ? 'var(--emerald)' : 'var(--d-expert, #e05)',
          fontWeight: 600,
        }}>
          Σ weight = {totalWeight.toFixed(2)} {Math.abs(totalWeight - 1) < 0.001 ? '✓' : '(should sum to 1.0)'}
        </span>
      </div>
      {ok && <div style={S.okBanner}>{ok}</div>}
      {err && <div style={S.errBanner}>{err}</div>}
      <table style={S.table}>
        <thead>
          <tr>
            {['Name', 'Weight', ''].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <>
              <tr key={row.id}>
                <td style={S.td}>{row.name}</td>
                <td style={S.td}>{(row.weight * 100).toFixed(0)}%</td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <Btn kind="ghost" size="sm" onClick={() => editing === row.id ? setEditing(null) : startEdit(row)}>
                    {editing === row.id ? 'Cancel' : 'Edit'}
                  </Btn>
                </td>
              </tr>
              {editing === row.id && (
                <tr key={`${row.id}-edit`}>
                  <td colSpan={3} style={S.td}>
                    <div style={S.editRow}>
                      <Field label="Name" value={String(draft.name ?? '')} onChange={v => setDraft(d => ({ ...d, name: v }))} />
                      <Field label="Weight (0–1)" value={String(draft.weight ?? '')} onChange={v => setDraft(d => ({ ...d, weight: Number(v) }))} type="number" />
                      <Btn kind="primary" size="sm" loading={saving} onClick={save}>Save</Btn>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface ConfigState {
  tiers: TierRow[];
  goals: GoalRow[];
  ranks: RankRow[];
  rules: RuleRow[];
  dimensions: DimensionRow[];
}

export default function ScoringConfigPage() {
  const { loading: authLoading } = useRequireAuth('ADMIN');

  const [config, setConfig] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.admin.config.difficultyTiers(),
      api.admin.config.goalTypes(),
      api.admin.config.ranks(),
      api.admin.config.scoringRules(),
      api.admin.config.rubricDimensions(),
    ]);
    const errs: string[] = [];
    const names = ['Difficulty Tiers', 'Goal Types', 'Ranks', 'Scoring Rules', 'Rubric Dimensions'];
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        errs.push(`${names[i]}: ${r.reason instanceof ApiError ? r.reason.message : String(r.reason)}`);
      }
    });
    setConfig({
      tiers: (results[0].status === 'fulfilled' ? results[0].value : []) as TierRow[],
      goals: (results[1].status === 'fulfilled' ? results[1].value : []) as GoalRow[],
      ranks: (results[2].status === 'fulfilled' ? results[2].value : []) as RankRow[],
      rules: (results[3].status === 'fulfilled' ? results[3].value : []) as RuleRow[],
      dimensions: (results[4].status === 'fulfilled' ? results[4].value : []) as DimensionRow[],
    });
    setError(errs.length ? errs.join(' · ') : null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (authLoading) return null;

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Scoring Config</h1>
      <p style={{ margin: '0 0 28px 0', color: 'var(--text-dim)', fontSize: 13.5 }}>
        Inline-edit any row. Changes are applied immediately and logged to the audit trail.
      </p>

      {error && <div style={S.errBanner}>Some sections failed to load — {error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-mute)', fontSize: 14 }}>
          Loading config…
        </div>
      ) : config && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TiersSection rows={config.tiers} onReload={load} />
          <GoalsSection rows={config.goals} onReload={load} />
          <RanksSection rows={config.ranks} onReload={load} />
          <RulesSection rows={config.rules} onReload={load} />
          <DimensionsSection rows={config.dimensions} onReload={load} />
        </div>
      )}
    </div>
  );
}
