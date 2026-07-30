'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

interface Persona {
  id: string;
  name: string;
  role: string;
  company: string;
  contextSnippet: string;
}

interface EditingState {
  id: string;
  name: string;
  role: string;
  company: string;
  contextSnippet: string;
  personalityPrompt: string;
}

const LABEL_STYLE = {
  display: 'block',
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-mute)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: 6,
};

const FIELD_STYLE = { display: 'flex', flexDirection: 'column' as const, gap: 4 };

const TEXTAREA_STYLE = {
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13.5,
  color: 'var(--text)',
  resize: 'vertical' as const,
  fontFamily: 'inherit',
  lineHeight: 1.6,
  outline: 'none',
  minHeight: 80,
  width: '100%',
  boxSizing: 'border-box' as const,
};

const EMPTY_CREATE = {
  name: '',
  role: '',
  company: '',
  contextSnippet: '',
  personalityPrompt: '',
};

export default function PersonasPage() {
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit drawer
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.admin.personas
      .list()
      .then((items) => setPersonas(items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  function setCreate(field: keyof typeof EMPTY_CREATE, value: string) {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  function setEdit(field: keyof EditingState, value: string) {
    setEditing((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function openCreate() {
    setCreateForm(EMPTY_CREATE);
    setCreateError(null);
    setCreating(true);
  }

  function cancelCreate() {
    setCreating(false);
    setCreateError(null);
  }

  function openEdit(p: Persona) {
    setEditing({
      id: p.id,
      name: p.name,
      role: p.role,
      company: p.company,
      contextSnippet: p.contextSnippet,
      personalityPrompt: '',
    });
    setEditError(null);
  }

  function closeEdit() {
    setEditing(null);
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setCreateError('Name is required.');
      return;
    }
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const created = await api.admin.personas.create({
        name: createForm.name.trim(),
        role: createForm.role.trim(),
        company: createForm.company.trim(),
        contextSnippet: createForm.contextSnippet.trim(),
        personalityPrompt: createForm.personalityPrompt.trim(),
      });
      setPersonas((prev) => [...prev, created]);
      setCreating(false);
      setCreateForm(EMPTY_CREATE);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create persona.');
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      setEditError('Name is required.');
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const updated = await api.admin.personas.update(editing.id, {
        name: editing.name.trim(),
        role: editing.role.trim(),
        company: editing.company.trim(),
        contextSnippet: editing.contextSnippet.trim(),
        personalityPrompt: editing.personalityPrompt.trim() || undefined,
      });
      setPersonas((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      closeEdit();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update persona.');
    } finally {
      setEditSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Personas
        </h1>
        <span
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            padding: '2px 10px',
            color: 'var(--text-dim)',
          }}
        >
          {personas.length}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <Btn kind="primary" size="sm" onClick={openCreate} disabled={creating}>
            New persona +
          </Btn>
        </div>
      </div>

      {/* Inline create form */}
      {creating && (
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px 0' }}>
            New persona
          </h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Name *</label>
                <TextInput
                  value={createForm.name}
                  onChange={(v) => setCreate('name', v)}
                  placeholder="Anita Sharma"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Role</label>
                <TextInput
                  value={createForm.role}
                  onChange={(v) => setCreate('role', v)}
                  placeholder="Procurement Manager"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Company</label>
                <TextInput
                  value={createForm.company}
                  onChange={(v) => setCreate('company', v)}
                  placeholder="Infosys"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Context snippet</label>
              <textarea
                value={createForm.contextSnippet}
                onChange={(e) => setCreate('contextSnippet', e.target.value)}
                placeholder="Brief context about this persona's situation…"
                rows={3}
                style={TEXTAREA_STYLE}
              />
            </div>

            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>
                Personality prompt — never shown to candidates
              </label>
              <textarea
                value={createForm.personalityPrompt}
                onChange={(e) => setCreate('personalityPrompt', e.target.value)}
                placeholder="System-level instructions that shape how this persona responds to the AI model…"
                rows={4}
                style={TEXTAREA_STYLE}
              />
            </div>

            {createError && (
              <div
                style={{
                  background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
                  border: '1px solid color-mix(in oklch, var(--d-expert) 30%, transparent)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: 'var(--d-expert)',
                }}
              >
                {createError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn type="submit" kind="primary" disabled={createSubmitting}>
                {createSubmitting ? 'Creating…' : 'Create persona'}
              </Btn>
              <Btn kind="ghost" onClick={cancelCreate}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card padding={0}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            Loading personas…
          </div>
        ) : personas.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mute)', fontSize: 13 }}>
            No personas yet. Create the first one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                  {['Name', 'Role', 'Company', 'Context snippet', 'Actions'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: 11.5,
                        color: 'var(--text-mute)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personas.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>
                      {p.role || <span style={{ color: 'var(--text-mute)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>
                      {p.company || <span style={{ color: 'var(--text-mute)' }}>—</span>}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: 'var(--text-dim)',
                        maxWidth: 300,
                      }}
                    >
                      {p.contextSnippet
                        ? p.contextSnippet.length > 80
                          ? p.contextSnippet.slice(0, 80) + '…'
                          : p.contextSnippet
                        : <span style={{ color: 'var(--text-mute)' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" kind="ghost" onClick={() => openEdit(p)}>
                          Edit
                        </Btn>
                        <a href={`/admin/personas/${p.id}/test-chat`} style={{ textDecoration: 'none' }}>
                          <Btn size="sm" kind="ghost">Test</Btn>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit drawer */}
      {editing && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeEdit}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              zIndex: 49,
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100vh',
              width: 460,
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border-soft)',
              padding: 24,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              overflowY: 'auto',
            }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Edit persona</h2>
              <button
                onClick={closeEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-mute)',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Name *</label>
                <TextInput
                  value={editing.name}
                  onChange={(v) => setEdit('name', v)}
                  placeholder="Anita Sharma"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Role</label>
                <TextInput
                  value={editing.role}
                  onChange={(v) => setEdit('role', v)}
                  placeholder="Procurement Manager"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Company</label>
                <TextInput
                  value={editing.company}
                  onChange={(v) => setEdit('company', v)}
                  placeholder="Infosys"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Context snippet</label>
                <textarea
                  value={editing.contextSnippet}
                  onChange={(e) => setEdit('contextSnippet', e.target.value)}
                  placeholder="Brief context about this persona's situation…"
                  rows={3}
                  style={TEXTAREA_STYLE}
                />
              </div>

              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>
                  Personality prompt — never shown to candidates
                </label>
                <textarea
                  value={editing.personalityPrompt}
                  onChange={(e) => setEdit('personalityPrompt', e.target.value)}
                  placeholder="Leave blank to keep existing prompt unchanged…"
                  rows={5}
                  style={TEXTAREA_STYLE}
                />
              </div>

              {editError && (
                <div
                  style={{
                    background: 'color-mix(in oklch, var(--d-expert) 12%, transparent)',
                    border: '1px solid color-mix(in oklch, var(--d-expert) 30%, transparent)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 13,
                    color: 'var(--d-expert)',
                  }}
                >
                  {editError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <Btn type="submit" kind="primary" full disabled={editSubmitting}>
                  {editSubmitting ? 'Saving…' : 'Save changes'}
                </Btn>
                <Btn kind="ghost" full onClick={closeEdit}>
                  Cancel
                </Btn>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
