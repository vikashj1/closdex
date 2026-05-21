'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { api, ApiError, AttemptDetail, MeResponse } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Btn } from '@/components/ui/Btn';
import { Card } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { TextInput } from '@/components/ui/TextInput';
import { DifficultyTag } from '@/components/ui/DifficultyTag';
import { ActivityHeatmap } from '@/components/ui/ActivityHeatmap';
import { rankFromEnum, difficultyFromEnum, nextRank } from '@/lib/constants';

const SPEC_OPTIONS = ['IT Sales', 'Cloud', 'DevTools', 'Cybersec', 'SaaS', 'FinTech', 'Healthcare'];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [openToWork, setOpenToWork] = useState<boolean>(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editExp, setEditExp] = useState('');
  const [editResume, setEditResume] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    if (user?.salesperson) {
      setOpenToWork(user.salesperson.openToWork);
      setEditExp(user.salesperson.experienceYears != null ? String(user.salesperson.experienceYears) : '');
      setEditTags(user.salesperson.specializationTags ?? []);
    }
  }, [user]);

  useEffect(() => {
    api.attempts.listMine()
      .then(setAttempts)
      .catch(() => {})
      .finally(() => setAttemptsLoading(false));
  }, []);

  async function handleToggleOpenToWork() {
    if (toggling) return;
    const newValue = !openToWork;
    setOpenToWork(newValue);
    setToggling(true);
    try {
      await api.users.updateSalesperson({ openToWork: newValue });
    } catch {
      setOpenToWork(!newValue);
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaveErr(null);
    try {
      await api.users.updateSalesperson({
        experienceYears: editExp ? parseInt(editExp, 10) : undefined,
        specializationTags: editTags.length > 0 ? editTags : undefined,
        resumeUrl: editResume || undefined,
      });
      setEditing(false);
    } catch (err) {
      setSaveErr(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || !user.salesperson) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        Loading profile…
      </div>
    );
  }

  const sp = user.salesperson;
  const rank = rankFromEnum(sp.rank);

  const completed = attempts.filter(a => a.status === 'COMPLETED');
  const won = completed.filter(a => a.goalAchieved === true);
  const winRate = completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0;
  const recentChallenges = completed
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  const activityData = useMemo(() => {
    const counts = new Array(182).fill(0);
    const now = Date.now();
    attempts.forEach((a) => {
      if (a.completedAt) {
        const daysAgo = Math.floor((now - new Date(a.completedAt).getTime()) / 86400000);
        const idx = 181 - daysAgo;
        if (idx >= 0 && idx < 182) counts[idx]++;
      }
    });
    return counts;
  }, [attempts]);

  const next = nextRank(sp.totalPoints);
  const pointsToNext = next ? next.min - sp.totalPoints : 0;

  const tagsDisplay = sp.specializationTags.length > 0
    ? sp.specializationTags.join(' / ')
    : null;

  const subtitleParts: string[] = [];
  if (sp.experienceYears != null) subtitleParts.push(`${sp.experienceYears} yrs exp`);
  if (user.salesperson?.location) subtitleParts.push(user.salesperson.location);
  if (tagsDisplay) subtitleParts.push(tagsDisplay);

  return (
    <div>
      <div style={{ height: 140, background: 'linear-gradient(135deg, color-mix(in oklch, var(--gold) 30%, var(--bg-2)) 0%, var(--bg-2) 100%)', position: 'relative' }}>
        <div className="stripe-ph" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      </div>
      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', marginTop: -56 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={user.name} size={120} />
            <div style={{ position: 'absolute', bottom: -4, right: -4 }}>
              <RankBadge rank={rank} size={44} />
            </div>
          </div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>{user.name}</h1>
              {openToWork && (
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'color-mix(in oklch, var(--emerald) 18%, transparent)',
                    color: 'var(--emerald)',
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1px solid color-mix(in oklch, var(--emerald) 35%, transparent)',
                  }}
                >
                  ● OPEN TO WORK
                </span>
              )}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              <strong style={{ color: `var(--r-${rank.toLowerCase()})` }}>{rank} tier</strong>
              {subtitleParts.length > 0 && ' · ' + subtitleParts.join(' · ')}
            </div>
            {sp.headline && (
              <div style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>{sp.headline}</div>
            )}
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 6 }}>
              closdex.com/u/{sp.publicSlug}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn
              kind="secondary"
              size="sm"
              onClick={handleToggleOpenToWork}
              disabled={toggling}
            >
              {openToWork ? 'Remove open to work' : 'Set open to work'}
            </Btn>
            <Btn
              kind="primary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`https://closdex.in/u/${sp.publicSlug}`).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? 'Link copied!' : 'Share profile'}
            </Btn>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            marginTop: 28,
            padding: '20px 0',
            borderTop: '1px solid var(--border-soft)',
            borderBottom: '1px solid var(--border-soft)',
          }}
        >
          <Stat label="Total points" value={sp.totalPoints.toLocaleString()} accent="var(--gold)" />
          <Stat label="Global rank" value={rank} />
          <Stat label="Challenges" value={String(completed.length)} sub="completed" />
          <Stat label="Win rate" value={`${winRate}%`} sub="goal achieved" accent="var(--emerald)" />
          <Stat
            label="Points to next rank"
            value={next ? pointsToNext.toLocaleString() : '—'}
            sub={next ? `until ${next.name}` : 'max rank'}
          />
        </div>

        <Card padding={22} style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
            <div>
              <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Challenge activity</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-mute)', margin: '4px 0 0' }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{attempts.length} attempts</span> total · showing last 26 weeks
              </p>
            </div>
          </div>
          <ActivityHeatmap weeks={26} activityData={activityData} />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginTop: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Recent challenges</h3>
              {attemptsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--text-mute)', padding: '12px 0' }}>Loading…</div>
              ) : recentChallenges.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-mute)', padding: '12px 0' }}>No completed challenges yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentChallenges.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto auto auto',
                        gap: 12,
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'var(--bg-2)',
                      }}
                    >
                      <DifficultyTag level={difficultyFromEnum(c.challenge.difficulty)} size="sm" />
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.challenge.title}</span>
                      <span style={{ fontSize: 11, color: c.goalAchieved ? 'var(--emerald)' : 'var(--d-expert)' }}>
                        {c.goalAchieved ? '✓ Goal' : '✗ Missed'}
                      </span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: c.goalAchieved ? 'var(--gold)' : 'var(--text-mute)' }}>
                        {c.pointsAwarded != null && c.pointsAwarded > 0 ? `+${c.pointsAwarded}` : '0'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                        {c.completedAt ? timeAgo(c.completedAt) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Badges · coming soon</h3>
              <div
                style={{
                  padding: '24px 0',
                  borderRadius: 10,
                  background: 'var(--bg-2)',
                  textAlign: 'center',
                  color: 'var(--text-mute)',
                  fontSize: 12.5,
                  border: '1px dashed var(--border-soft)',
                }}
              >
                Earned badges will appear here once the system is live.
              </div>
            </Card>

            <Card padding={22}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Career preferences</h3>
                {!editing && (
                  <Btn kind="ghost" size="sm" onClick={() => { setEditing(true); setSaveErr(null); }}>Edit</Btn>
                )}
              </div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 5, fontWeight: 600 }}>Years of experience</div>
                    <TextInput type="number" placeholder="4" value={editExp} onChange={(v) => setEditExp(v)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 5, fontWeight: 600 }}>Resume / portfolio URL</div>
                    <TextInput placeholder="https://..." value={editResume} onChange={(v) => setEditResume(v)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 8, fontWeight: 600 }}>Specializations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {SPEC_OPTIONS.map((tag) => {
                        const active = editTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => setEditTags(active ? editTags.filter((t) => t !== tag) : [...editTags, tag])}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 999,
                              border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                              background: active ? 'color-mix(in oklch, var(--gold) 14%, transparent)' : 'var(--bg-2)',
                              color: active ? 'var(--gold)' : 'var(--text-dim)',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {saveErr && (
                    <div style={{ fontSize: 12.5, color: 'var(--r-master)', padding: '8px 10px', borderRadius: 6, background: 'color-mix(in oklch, var(--r-master) 10%, transparent)' }}>
                      {saveErr}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                    <Btn kind="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Btn>
                    <Btn kind="primary" size="sm" disabled={saving} onClick={handleSaveProfile}>
                      {saving ? 'Saving…' : 'Save changes'}
                    </Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                  <Row
                    k="Open to work"
                    v={
                      <span style={{ color: openToWork ? 'var(--emerald)' : 'var(--text-mute)', fontWeight: 600 }}>
                        {openToWork ? '● Yes' : '● No'}
                      </span>
                    }
                  />
                  {sp.location && <Row k="Location" v={sp.location} />}
                  {sp.experienceYears != null && <Row k="Experience" v={`${sp.experienceYears} years`} />}
                  {sp.expectedCtc && <Row k="Expected CTC" v={sp.expectedCtc} />}
                  {sp.noticePeriodDays != null && <Row k="Notice period" v={`${sp.noticePeriodDays} days`} />}
                  {sp.specializationTags.length > 0 && (
                    <Row k="Specialization" v={sp.specializationTags.join(', ')} />
                  )}
                  {!sp.experienceYears && !sp.specializationTags.length && (
                    <div style={{ fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                      Click Edit to fill in your career details.
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 16, margin: '0 0 14px', fontWeight: 600 }}>Who viewed your profile · coming soon</h3>
              <div
                style={{
                  padding: '24px 0',
                  borderRadius: 10,
                  background: 'var(--bg-2)',
                  textAlign: 'center',
                  color: 'var(--text-mute)',
                  fontSize: 12.5,
                  border: '1px dashed var(--border-soft)',
                }}
              >
                Profile viewer data will be available soon.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-mute)' }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
