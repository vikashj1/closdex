'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, ShortlistSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';

export default function ShortlistsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [items, setItems] = useState<ShortlistSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const companyId = user?.companyMemberships?.[0]?.companyId ?? '';

  useEffect(() => {
    if (authLoading || !user || !companyId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.shortlists
      .list(companyId)
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Something went wrong');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, user, companyId]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await api.shortlists.create(companyId, newName.trim());
      setItems((prev) => [created, ...prev]);
      setNewName('');
      setCreating(false);
    } catch (err: unknown) {
      setCreateError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.shortlists.delete(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      // silently ignore; in production show a toast
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
          Shortlists
        </h1>
        {!creating && (
          <Btn kind="primary" size="md" onClick={() => { setCreating(true); setCreateError(null); }}>
            + New shortlist
          </Btn>
        )}
      </div>

      {/* Inline create row */}
      {creating && (
        <Card padding={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TextInput
              value={newName}
              onChange={(v) => setNewName(v)}
              placeholder="Shortlist name…"
              style={{ flex: 1 }}
            />
            <Btn
              kind="primary"
              size="sm"
              onClick={handleCreate}
              disabled={createLoading || !newName.trim()}
            >
              {createLoading ? 'Creating…' : 'Create'}
            </Btn>
            <Btn
              kind="ghost"
              size="sm"
              onClick={() => { setCreating(false); setNewName(''); setCreateError(null); }}
              disabled={createLoading}
            >
              Cancel
            </Btn>
          </div>
          {createError && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--r-master)' }}>
              {createError}
            </div>
          )}
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
          Loading shortlists…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: 'color-mix(in oklch, var(--r-master) 12%, transparent)',
            color: 'var(--r-master)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div
          style={{
            padding: '56px 32px',
            textAlign: 'center',
            color: 'var(--text-mute)',
            fontSize: 14,
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius)',
          }}
        >
          No shortlists yet. Create one to start saving promising candidates.
        </div>
      )}

      {/* List */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((sl) => (
            <Card key={sl.id} padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{sl.name}</span>
                </div>

                {/* Count badge */}
                <span
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'color-mix(in oklch, var(--cool) 14%, transparent)',
                    color: 'var(--cool)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sl._count.entries} candidate{sl._count.entries !== 1 ? 's' : ''}
                </span>

                {/* View */}
                <Btn
                  kind="secondary"
                  size="sm"
                  onClick={() => router.push(`/company/shortlists/${sl.id}`)}
                >
                  View
                </Btn>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(sl.id)}
                  disabled={deletingId === sl.id}
                  aria-label="Delete shortlist"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: deletingId === sl.id ? 'not-allowed' : 'pointer',
                    color: 'var(--text-mute)',
                    opacity: deletingId === sl.id ? 0.4 : 1,
                    padding: '4px 6px',
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--r-master)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-mute)'; }}
                >
                  {/* X icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
