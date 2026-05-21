'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

const DIFFICULTY_OPTIONS = ['ROOKIE', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const;
const GOAL_TYPE_OPTIONS = [
  'QUALIFY_LEAD',
  'BOOK_DISCOVERY_CALL',
  'SEND_PROPOSAL',
  'REACH_DECISION_MAKER',
  'WIN_BACK',
  'CLOSE_DEAL',
] as const;

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

const SELECT_STYLE = {
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13.5,
  color: 'var(--text)',
  appearance: 'none' as const,
  cursor: 'pointer',
};

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
};

interface FormState {
  title: string;
  brief: string;
  category: string;
  difficulty: string;
  goalType: string;
  goalDescription: string;
  basePoints: string;
  maxMessages: string;
  estimatedMinutes: string;
  attemptsAllowed: string;
  personaId: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  brief: '',
  category: '',
  difficulty: 'MEDIUM',
  goalType: 'CLOSE_DEAL',
  goalDescription: '',
  basePoints: '',
  maxMessages: '',
  estimatedMinutes: '',
  attemptsAllowed: '',
  personaId: '',
};

export default function NewChallengePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('ADMIN');

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (form.brief.trim().length < 10) {
      setError('Brief must be at least 10 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.admin.challenges.create({
        title: form.title.trim(),
        brief: form.brief.trim(),
        category: form.category.trim(),
        difficulty: form.difficulty,
        goalType: form.goalType,
        goalDescription: form.goalDescription.trim(),
        basePoints: Number(form.basePoints),
        maxMessages: Number(form.maxMessages),
        estimatedMinutes: Number(form.estimatedMinutes),
        attemptsAllowed: form.attemptsAllowed ? Number(form.attemptsAllowed) : undefined,
        personaId: form.personaId.trim(),
      });
      router.push('/admin/challenges');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge.');
      setSubmitting(false);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: 32, color: 'var(--text-mute)' }}>Loading…</div>;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => router.push('/admin/challenges')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-mute)',
            fontSize: 13,
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Challenges
        </button>
        <span style={{ color: 'var(--border-soft)' }}>/</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          New challenge
        </h1>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: form card */}
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Title */}
            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Title *</label>
              <TextInput
                value={form.title}
                onChange={(v) => set('title', v)}
                placeholder="e.g. Cold-call a gatekeeper"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Brief */}
            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Brief * (min 10 chars)</label>
              <textarea
                value={form.brief}
                onChange={(e) => set('brief', e.target.value)}
                placeholder="Short scenario description shown to the candidate…"
                rows={3}
                minLength={10}
                required
                style={{ ...TEXTAREA_STYLE, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Category */}
            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Category *</label>
              <TextInput
                value={form.category}
                onChange={(v) => set('category', v)}
                placeholder="IT Sales"
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Difficulty + Goal type — two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Difficulty *</label>
                <select
                  value={form.difficulty}
                  onChange={(e) => set('difficulty', e.target.value)}
                  required
                  style={{ ...SELECT_STYLE, width: '100%' }}
                >
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Goal type *</label>
                <select
                  value={form.goalType}
                  onChange={(e) => set('goalType', e.target.value)}
                  required
                  style={{ ...SELECT_STYLE, width: '100%' }}
                >
                  {GOAL_TYPE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Goal description */}
            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Goal description *</label>
              <textarea
                value={form.goalDescription}
                onChange={(e) => set('goalDescription', e.target.value)}
                placeholder="Describe what success looks like in this challenge…"
                rows={3}
                required
                style={{ ...TEXTAREA_STYLE, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Numeric fields — two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Base points *</label>
                <TextInput
                  type="number"
                  value={form.basePoints}
                  onChange={(v) => set('basePoints', v)}
                  placeholder="100"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Max messages *</label>
                <TextInput
                  type="number"
                  value={form.maxMessages}
                  onChange={(v) => set('maxMessages', v)}
                  placeholder="20"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Estimated minutes *</label>
                <TextInput
                  type="number"
                  value={form.estimatedMinutes}
                  onChange={(v) => set('estimatedMinutes', v)}
                  placeholder="15"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={FIELD_STYLE}>
                <label style={LABEL_STYLE}>Attempts allowed</label>
                <TextInput
                  type="number"
                  value={form.attemptsAllowed}
                  onChange={(v) => set('attemptsAllowed', v)}
                  placeholder="unlimited"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Persona ID */}
            <div style={FIELD_STYLE}>
              <label style={LABEL_STYLE}>Persona ID *</label>
              <TextInput
                value={form.personaId}
                onChange={(v) => set('personaId', v)}
                placeholder="paste persona UUID"
                required
                style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
            </div>

            {/* Error */}
            {error && (
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
                {error}
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn type="submit" kind="primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create challenge'}
              </Btn>
              <Btn kind="ghost" onClick={() => router.push('/admin/challenges')}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>

        {/* Right: reference card (sticky) */}
        <div style={{ position: 'sticky', top: 24 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                Field reference
              </h2>

              <RefSection title="Difficulty">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <RefItem key={d} value={d} />
                ))}
              </RefSection>

              <RefSection title="Goal types">
                {GOAL_TYPE_OPTIONS.map((g) => (
                  <RefItem key={g} value={g} />
                ))}
              </RefSection>

              <RefSection title="Constraints">
                <RefItem value="brief" note="min 10 chars" />
                <RefItem value="basePoints" note="integer ≥ 0" />
                <RefItem value="maxMessages" note="integer ≥ 1" />
                <RefItem value="estimatedMinutes" note="integer ≥ 1" />
                <RefItem value="attemptsAllowed" note="optional — omit = unlimited" />
                <RefItem value="personaId" note="UUID from Personas admin" />
              </RefSection>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {children}
      </div>
    </div>
  );
}

function RefItem({ value, note }: { value: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <code
        style={{
          fontSize: 11,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-soft)',
          borderRadius: 4,
          padding: '1px 5px',
          color: 'var(--cool)',
        }}
      >
        {value}
      </code>
      {note && (
        <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{note}</span>
      )}
    </div>
  );
}
