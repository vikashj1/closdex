'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { api, ApiError, LearningTrackSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Chip } from '@/components/ui/Chip';

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizQuestion { q: string; options: string[]; answerIndex: number; }
interface TutorialRow {
  id: string; title: string; type: 'VIDEO' | 'ARTICLE'; order: number;
}
interface TrackWithTutorials extends LearningTrackSummary {
  tutorials: TutorialRow[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['SaaS', 'B2B', 'IT Sales', 'Cloud', 'FinTech', 'Healthcare', 'DevTools', 'General'];

// ─── Small helpers ────────────────────────────────────────────────────────────

function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>{text}</span>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-mute)', marginLeft: 7 }}>{hint}</span>}
    </div>
  );
}

function ErrBanner({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      padding: '9px 13px', borderRadius: 8, fontSize: 13,
      background: 'color-mix(in oklch, red 10%, transparent)',
      border: '1px solid color-mix(in oklch, red 25%, transparent)',
      color: 'var(--text-dim)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', lineHeight: 1 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Track form modal ─────────────────────────────────────────────────────────

interface TrackFormProps {
  initial?: Partial<TrackWithTutorials>;
  onSave: (dto: { title: string; description: string; category: string; order?: number }) => Promise<void>;
  onCancel: () => void;
}
function TrackForm({ initial, onSave, onCancel }: TrackFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'SaaS');
  const [order, setOrder] = useState(String(initial?.order ?? ''));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await onSave({ title: title.trim(), description: description.trim(), category, order: order ? Number(order) : undefined });
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Save failed.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><Label text="Title" /><input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div><Label text="Description" /><textarea style={{ ...INPUT, resize: 'vertical', minHeight: 72 }} value={description} onChange={e => setDescription(e.target.value)} required /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label text="Category" />
          <select style={INPUT} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><Label text="Order" hint="(optional)" /><input style={INPUT} type="number" min={0} value={order} onChange={e => setOrder(e.target.value)} /></div>
      </div>
      {err && <ErrBanner msg={err} onClose={() => setErr(null)} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <Btn kind="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Btn>
        <Btn kind="primary" size="sm" type="submit" disabled={busy || !title.trim()}
          style={{ background: 'var(--cool)', color: 'white', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Saving…' : (initial?.id ? 'Save changes' : 'Create track')}
        </Btn>
      </div>
    </form>
  );
}

// ─── Tutorial form modal ──────────────────────────────────────────────────────

interface TutorialFormProps {
  initial?: Partial<TutorialRow & { contentUrl?: string; body?: string }>;
  onSave: (dto: { title: string; type: 'VIDEO' | 'ARTICLE'; contentUrl?: string; body?: string; order?: number }) => Promise<void>;
  onCancel: () => void;
}
function TutorialForm({ initial, onSave, onCancel }: TutorialFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<'VIDEO' | 'ARTICLE'>(initial?.type ?? 'VIDEO');
  const [contentUrl, setContentUrl] = useState(initial?.contentUrl ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [order, setOrder] = useState(String(initial?.order ?? ''));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await onSave({
        title: title.trim(), type,
        contentUrl: type === 'VIDEO' ? contentUrl.trim() || undefined : undefined,
        body: type === 'ARTICLE' ? body.trim() || undefined : undefined,
        order: order ? Number(order) : undefined,
      });
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Save failed.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><Label text="Title" /><input style={INPUT} value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <Label text="Type" />
          <select style={INPUT} value={type} onChange={e => setType(e.target.value as 'VIDEO' | 'ARTICLE')}>
            <option value="VIDEO">Video</option>
            <option value="ARTICLE">Article</option>
          </select>
        </div>
        <div><Label text="Order" hint="(optional)" /><input style={INPUT} type="number" min={0} value={order} onChange={e => setOrder(e.target.value)} /></div>
      </div>
      {type === 'VIDEO' && (
        <div><Label text="Video URL" /><input style={INPUT} type="url" placeholder="https://youtube.com/..." value={contentUrl} onChange={e => setContentUrl(e.target.value)} /></div>
      )}
      {type === 'ARTICLE' && (
        <div><Label text="Article body" /><textarea style={{ ...INPUT, resize: 'vertical', minHeight: 120, fontFamily: 'monospace', fontSize: 12.5 }} value={body} onChange={e => setBody(e.target.value)} /></div>
      )}
      {err && <ErrBanner msg={err} onClose={() => setErr(null)} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <Btn kind="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Btn>
        <Btn kind="primary" size="sm" type="submit" disabled={busy || !title.trim()}
          style={{ background: 'var(--cool)', color: 'white', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Saving…' : (initial?.id ? 'Save changes' : 'Add tutorial')}
        </Btn>
      </div>
    </form>
  );
}

// ─── Quiz form ────────────────────────────────────────────────────────────────

interface QuizFormProps {
  initial?: { questions: QuizQuestion[]; rewardPoints: number };
  onSave: (dto: { questions: QuizQuestion[]; rewardPoints: number }) => Promise<void>;
  onCancel: () => void;
}
function QuizForm({ initial, onSave, onCancel }: QuizFormProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.questions ?? [{ q: '', options: ['', ''], answerIndex: 0 }],
  );
  const [rewardPoints, setRewardPoints] = useState(String(initial?.rewardPoints ?? '10'));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function setQ(i: number, field: keyof QuizQuestion, value: string | number | string[]) {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }
  function setOption(qi: number, oi: number, value: string) {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = [...q.options];
      opts[oi] = value;
      return { ...q, options: opts };
    }));
  }
  function addOption(qi: number) {
    setQuestions(prev => prev.map((q, idx) => idx === qi ? { ...q, options: [...q.options, ''] } : q));
  }
  function removeOption(qi: number, oi: number) {
    setQuestions(prev => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = q.options.filter((_, i) => i !== oi);
      return { ...q, options: opts, answerIndex: Math.min(q.answerIndex, opts.length - 1) };
    }));
  }
  function addQuestion() {
    setQuestions(prev => [...prev, { q: '', options: ['', ''], answerIndex: 0 }]);
  }
  function removeQuestion(i: number) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await onSave({ questions, rewardPoints: Number(rewardPoints) || 0 });
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Save failed.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <Label text="Reward points" hint="awarded on first pass" />
        <input style={{ ...INPUT, width: 100 }} type="number" min={0} value={rewardPoints} onChange={e => setRewardPoints(e.target.value)} />
      </div>

      {questions.map((q, qi) => (
        <div key={qi} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>Q{qi + 1}</span>
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qi)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 11.5 }}>
                Remove
              </button>
            )}
          </div>
          <div>
            <Label text="Question" />
            <input style={INPUT} value={q.q} onChange={e => setQ(qi, 'q', e.target.value)} required />
          </div>
          <div>
            <Label text="Options" hint="(mark correct answer with radio)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="radio" name={`q${qi}-answer`} checked={q.answerIndex === oi}
                    onChange={() => setQ(qi, 'answerIndex', oi)} style={{ accentColor: 'var(--emerald)', flexShrink: 0 }} />
                  <input style={{ ...INPUT, flex: 1 }} value={opt} onChange={e => setOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`} required />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qi, oi)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 5 && (
                <button type="button" onClick={() => addOption(qi)}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--cool)' }}>
                  + Add option
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <Btn kind="ghost" size="sm" type="button" onClick={addQuestion}
        style={{ alignSelf: 'flex-start' }}>
        + Add question
      </Btn>

      {err && <ErrBanner msg={err} onClose={() => setErr(null)} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn kind="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Btn>
        <Btn kind="primary" size="sm" type="submit" disabled={busy}
          style={{ background: 'var(--cool)', color: 'white', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Saving…' : 'Save quiz'}
        </Btn>
      </div>
    </form>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.45)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Track card ───────────────────────────────────────────────────────────────

interface TrackCardProps {
  track: TrackWithTutorials;
  onEdit: () => void;
  onDelete: () => void;
  onAddTutorial: () => void;
  onEditTutorial: (t: TutorialRow) => void;
  onDeleteTutorial: (id: string) => void;
  onManageQuiz: (t: TutorialRow) => void;
  busy: boolean;
}
function TrackCard({ track, onEdit, onDelete, onAddTutorial, onEditTutorial, onDeleteTutorial, onManageQuiz, busy }: TrackCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      {/* Track header */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{track.title}</span>
            <Chip color="var(--cool)">{track.category}</Chip>
            <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>
              order: {track.order ?? '—'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>
            {track.description}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 16 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 12.5 }}>
            {expanded ? '▲' : '▼'} {track.tutorials.length} tutorial{track.tutorials.length !== 1 ? 's' : ''}
          </button>
          <Btn kind="ghost" size="sm" onClick={onEdit} disabled={busy}>Edit</Btn>
          <Btn kind="ghost" size="sm" onClick={onDelete} disabled={busy} style={{ color: 'var(--text-mute)' }}>Delete</Btn>
        </div>
      </div>

      {/* Tutorials */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-soft)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {track.tutorials.length === 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--text-mute)', padding: '8px 0' }}>No tutorials yet.</div>
          )}
          {track.tutorials.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: t.type === 'VIDEO' ? 'color-mix(in oklch, var(--cool) 14%, transparent)' : 'color-mix(in oklch, var(--emerald) 14%, transparent)', color: t.type === 'VIDEO' ? 'var(--cool)' : 'var(--emerald)' }}>
                  {t.type}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>#{t.order}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn kind="ghost" size="sm" onClick={() => onManageQuiz(t)} disabled={busy}>Quiz</Btn>
                <Btn kind="ghost" size="sm" onClick={() => onEditTutorial(t)} disabled={busy}>Edit</Btn>
                <Btn kind="ghost" size="sm" onClick={() => onDeleteTutorial(t.id)} disabled={busy} style={{ color: 'var(--text-mute)' }}>Delete</Btn>
              </div>
            </div>
          ))}
          <div style={{ paddingTop: 4 }}>
            <Btn kind="ghost" size="sm" onClick={onAddTutorial} disabled={busy} style={{ color: 'var(--cool)' }}>
              + Add tutorial
            </Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState =
  | { kind: 'none' }
  | { kind: 'create-track' }
  | { kind: 'edit-track'; track: TrackWithTutorials }
  | { kind: 'create-tutorial'; trackId: string }
  | { kind: 'edit-tutorial'; tutorial: TutorialRow & { contentUrl?: string; body?: string } }
  | { kind: 'quiz'; tutorial: TutorialRow };

export default function AdminLearningPage() {
  useRequireAuth('ADMIN');

  const [tracks, setTracks] = useState<TrackWithTutorials[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [busy, setBusy] = useState(false);
  const [topErr, setTopErr] = useState<string | null>(null);

  function close() { setModal({ kind: 'none' }); }

  async function reload() {
    setLoading(true); setLoadErr(null);
    try {
      const raw = await api.learning.listTracks();
      setTracks(raw as TrackWithTutorials[]);
    } catch (err) {
      setLoadErr(err instanceof ApiError ? err.message : 'Could not load tracks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  // ── Track mutations ──

  async function createTrack(dto: { title: string; description: string; category: string; order?: number }) {
    await api.learning.createTrack(dto);
    close(); await reload();
  }
  async function updateTrack(id: string, dto: Parameters<typeof api.learning.updateTrack>[1]) {
    await api.learning.updateTrack(id, dto);
    close(); await reload();
  }
  async function deleteTrack(id: string) {
    if (!confirm('Delete this track and all its tutorials?')) return;
    setBusy(true); setTopErr(null);
    try { await api.learning.deleteTrack(id); await reload(); }
    catch (err) { setTopErr(err instanceof ApiError ? err.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  // ── Tutorial mutations ──

  async function createTutorial(trackId: string, dto: Parameters<typeof api.learning.createTutorial>[1]) {
    await api.learning.createTutorial(trackId, dto);
    close(); await reload();
  }
  async function updateTutorial(id: string, dto: Parameters<typeof api.learning.updateTutorial>[1]) {
    await api.learning.updateTutorial(id, dto);
    close(); await reload();
  }
  async function deleteTutorial(id: string) {
    if (!confirm('Delete this tutorial (and its quiz)?')) return;
    setBusy(true); setTopErr(null);
    try { await api.learning.deleteTutorial(id); await reload(); }
    catch (err) { setTopErr(err instanceof ApiError ? err.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  // ── Quiz mutations ──

  async function upsertQuiz(tutorialId: string, dto: { questions: QuizQuestion[]; rewardPoints: number }) {
    await api.learning.upsertQuiz(tutorialId, dto);
    close(); await reload();
  }
  async function deleteQuiz(tutorialId: string) {
    if (!confirm('Remove quiz from this tutorial?')) return;
    setBusy(true); setTopErr(null);
    try { await api.learning.deleteQuiz(tutorialId); await reload(); }
    catch (err) { setTopErr(err instanceof ApiError ? err.message : 'Delete failed.'); }
    finally { setBusy(false); }
  }

  // ── Modal content ──

  function renderModal() {
    if (modal.kind === 'none') return null;

    if (modal.kind === 'create-track') return (
      <Modal title="New learning track" onClose={close}>
        <TrackForm onSave={createTrack} onCancel={close} />
      </Modal>
    );

    if (modal.kind === 'edit-track') return (
      <Modal title="Edit track" onClose={close}>
        <TrackForm initial={modal.track} onSave={dto => updateTrack(modal.track.id, dto)} onCancel={close} />
      </Modal>
    );

    if (modal.kind === 'create-tutorial') return (
      <Modal title="Add tutorial" onClose={close}>
        <TutorialForm onSave={dto => createTutorial(modal.trackId, dto)} onCancel={close} />
      </Modal>
    );

    if (modal.kind === 'edit-tutorial') return (
      <Modal title="Edit tutorial" onClose={close}>
        <TutorialForm initial={modal.tutorial} onSave={dto => updateTutorial(modal.tutorial.id, dto)} onCancel={close} />
      </Modal>
    );

    if (modal.kind === 'quiz') {
      const trackWithTutorial = tracks.find(tr => tr.tutorials.some(t => t.id === modal.tutorial.id));
      const fullTrack = trackWithTutorial as any;
      const existingQuiz = fullTrack?.tutorials?.find((t: any) => t.id === modal.tutorial.id)?.quiz;
      return (
        <Modal title={`Quiz — ${modal.tutorial.title}`} onClose={close}>
          <QuizForm
            initial={existingQuiz ? { questions: existingQuiz.questions as QuizQuestion[], rewardPoints: existingQuiz.rewardPoints } : undefined}
            onSave={dto => upsertQuiz(modal.tutorial.id, dto)}
            onCancel={close}
          />
          {existingQuiz && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-soft)', textAlign: 'right' }}>
              <Btn kind="ghost" size="sm" onClick={() => deleteQuiz(modal.tutorial.id)} style={{ color: 'var(--text-mute)' }}>
                Remove quiz
              </Btn>
            </div>
          )}
        </Modal>
      );
    }

    return null;
  }

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {renderModal()}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Learning Hub</h1>
        <Btn kind="primary" size="md" style={{ background: 'var(--cool)', color: 'white' }}
          onClick={() => setModal({ kind: 'create-track' })} disabled={busy}>
          + New track
        </Btn>
      </div>

      {/* Errors */}
      {topErr && <ErrBanner msg={topErr} onClose={() => setTopErr(null)} />}
      {loadErr && <ErrBanner msg={loadErr} onClose={() => setLoadErr(null)} />}

      {/* Loading */}
      {loading && <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>Loading…</div>}

      {/* Empty */}
      {!loading && tracks.length === 0 && !loadErr && (
        <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14, background: 'var(--bg-2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          No learning tracks yet. Create your first track to get started.
        </div>
      )}

      {/* Track cards */}
      {!loading && tracks.map(track => (
        <TrackCard
          key={track.id}
          track={track}
          busy={busy}
          onEdit={() => setModal({ kind: 'edit-track', track })}
          onDelete={() => deleteTrack(track.id)}
          onAddTutorial={() => setModal({ kind: 'create-tutorial', trackId: track.id })}
          onEditTutorial={t => setModal({ kind: 'edit-tutorial', tutorial: t as any })}
          onDeleteTutorial={deleteTutorial}
          onManageQuiz={t => setModal({ kind: 'quiz', tutorial: t })}
        />
      ))}
    </div>
  );
}

const INPUT: CSSProperties = {
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 11px',
  fontSize: 13,
  color: 'var(--text)',
  width: '100%',
  boxSizing: 'border-box',
};
