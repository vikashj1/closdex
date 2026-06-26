'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { api, ApiError, AttemptDetail, EarnedBadge } from '@/lib/api';

// Profile — Vikash dashboard redesign 2026-06-16, wired 2026-06-18.
// Visual port of the new HTML; data layered onto the previous logic
// (api.users.me / api.users.updateSalesperson / api.badges.listEarned /
// api.attempts.listMine).

const SPEC_OPTIONS = [
  'IT Sales',
  'SaaS',
  'Cloud',
  'DevTools',
  'Cybersecurity',
  'FinTech',
  'Healthcare',
  'EdTech',
];

const RANK_META: Record<
  string,
  { label: string; color: string; pillBg: string; pillFg: string }
> = {
  BRONZE:   { label: 'Bronze',   color: '#F5A524', pillBg: 'rgba(245,165,36,0.12)', pillFg: '#8A6A1A' },
  SILVER:   { label: 'Silver',   color: '#B6B6C0', pillBg: 'rgba(182,182,192,0.18)', pillFg: '#5A5A66' },
  GOLD:     { label: 'Gold',     color: '#E0A41A', pillBg: 'rgba(224,164,26,0.14)', pillFg: '#7A5E10' },
  PLATINUM: { label: 'Platinum', color: '#5B4BF5', pillBg: 'rgba(91,75,245,0.12)',  pillFg: '#3A2DC4' },
  DIAMOND:  { label: 'Diamond',  color: '#3A2DC4', pillBg: 'rgba(58,45,196,0.12)',  pillFg: '#3A2DC4' },
  MASTER:   { label: 'Master',   color: '#A93F37', pillBg: 'rgba(169,63,55,0.12)',  pillFg: '#A93F37' },
};

const NEXT_TIER: Record<string, { next: string; threshold: number }> = {
  BRONZE:   { next: 'Silver',   threshold: 1500 },
  SILVER:   { next: 'Gold',     threshold: 3500 },
  GOLD:     { next: 'Platinum', threshold: 7000 },
  PLATINUM: { next: 'Diamond',  threshold: 12000 },
  DIAMOND:  { next: 'Master',   threshold: 20000 },
};

const DIFFICULTY_DOT: Record<string, string> = {
  ROOKIE: '#6D9A4E',
  EASY:   '#6D9A4E',
  MEDIUM: '#D3A24C',
  HARD:   '#C2604A',
  EXPERT: '#A93F37',
};

function difficultyLabel(d: string) {
  if (d === 'ROOKIE') return 'Rookie';
  if (d === 'EASY') return 'Easy';
  if (d === 'MEDIUM') return 'Medium';
  if (d === 'HARD') return 'Hard';
  if (d === 'EXPERT') return 'Expert';
  return d;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Build a 16-week (Mon-Sun) heatmap from attempt completion timestamps.
function buildHeatmapWeeks(attempts: AttemptDetail[]) {
  const ramp = ['#EFEFF3', '#D8D4FB', '#B0A8F6', '#7E72F1', '#5B4BF5'];
  const totalDays = 16 * 7;
  const counts = new Array<number>(totalDays).fill(0);
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  for (const a of attempts) {
    const ts = a.completedAt ?? a.startedAt;
    if (!ts) continue;
    const d = new Date(ts);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const daysAgo = Math.floor((todayMidnight - dayStart) / 86400000);
    if (daysAgo < 0 || daysAgo >= totalDays) continue;
    const idx = totalDays - 1 - daysAgo;
    counts[idx] += 1;
  }
  const max = counts.reduce((m, c) => (c > m ? c : m), 0);
  const lvl = (c: number) => {
    if (c === 0 || max === 0) return 0;
    const r = c / max;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.8) return 3;
    return 4;
  };
  const weeks: { days: { bg: string }[] }[] = [];
  for (let w = 0; w < 16; w++) {
    const days: { bg: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const c = counts[w * 7 + d];
      days.push({ bg: ramp[lvl(c)] });
    }
    weeks.push({ days });
  }
  return weeks;
}

export default function ProfilePage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');

  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [openToWork, setOpenToWork] = useState<boolean>(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit form state.
  const [editing, setEditing] = useState(false);
  const [editExp, setEditExp] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.salesperson) return;
    setOpenToWork(user.salesperson.openToWork);
    setEditExp(
      user.salesperson.experienceYears != null ? String(user.salesperson.experienceYears) : '',
    );
    setEditTags(user.salesperson.specializationTags ?? []);
    setEditCompany(((user.salesperson as unknown) as { currentCompany?: string | null }).currentCompany ?? '');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setAttemptsLoading(true);
    setBadgesLoading(true);
    setFetchError(null);
    let cancelled = false;
    Promise.allSettled([api.attempts.listMine(), api.badges.listEarned()]).then((results) => {
      if (cancelled) return;
      const [aRes, bRes] = results;
      if (aRes.status === 'fulfilled') setAttempts(aRes.value);
      else setFetchError(aRes.reason instanceof ApiError ? aRes.reason.message : 'Failed to load attempts.');
      if (bRes.status === 'fulfilled') setBadges(bRes.value);
      setAttemptsLoading(false);
      setBadgesLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  async function handleToggleOpenToWork() {
    if (toggling) return;
    const next = !openToWork;
    setOpenToWork(next);
    setToggling(true);
    try {
      await api.users.updateSalesperson({ openToWork: next });
      await refresh();
    } catch {
      setOpenToWork(!next);
    } finally {
      setToggling(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaveError(null);
    try {
      await api.users.updateSalesperson({
        experienceYears: editExp ? Number.parseInt(editExp, 10) : undefined,
        currentCompany: editCompany || undefined,
        specializationTags: editTags.length > 0 ? editTags : undefined,
        openToWork,
      });
      await refresh();
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function handleShare() {
    const slug = user?.salesperson?.publicSlug;
    if (!slug) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/u/${slug}`
      : `/u/${slug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    }
  }

  // ── Loading shell ──────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9AA4' }}>
          Loading profile…
        </div>
      </div>
    );
  }

  // ── Not a salesperson (e.g. company user routed here by mistake) ───────
  if (!user.salesperson) {
    return (
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '24px', color: '#0B0B0F', margin: '0 0 8px' }}>
          Salesperson profile not found
        </h1>
        <p style={{ fontSize: '14px', color: '#7A7A86', margin: 0 }}>
          This account does not have a salesperson profile attached.
        </p>
      </div>
    );
  }

  const sp = user.salesperson;
  const currentCompany = ((sp as unknown) as { currentCompany?: string | null }).currentCompany ?? null;
  const rankKey = (sp.rank ?? 'BRONZE').toUpperCase();
  const rank = RANK_META[rankKey] ?? RANK_META.BRONZE;
  const initial = (user.name?.[0] ?? '?').toLowerCase();

  const completed = attempts.filter((a) => a.status === 'COMPLETED');
  const won = completed.filter((a) => a.goalAchieved === true);
  const winRate = completed.length > 0 ? Math.round((won.length / completed.length) * 100) : 0;
  const recentChallenges = [...completed]
    .sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 5);

  const tier = NEXT_TIER[rankKey];
  const pointsToNext = tier ? Math.max(0, tier.threshold - sp.totalPoints) : 0;
  const nextLabel = tier ? `Until ${tier.next}` : 'Max rank';
  const nextValue = tier ? pointsToNext.toLocaleString() : '—';

  const weeks = useMemo(() => buildHeatmapWeeks(attempts), [attempts]);

  const subtitleParts: string[] = [];
  subtitleParts.push(`${sp.experienceYears ?? 0} yrs exp`);
  if (currentCompany) subtitleParts.push(currentCompany);
  if (sp.specializationTags.length > 0) subtitleParts.push(sp.specializationTags.join(' / '));

  const publicUrl = `/u/${sp.publicSlug}`;
  const publicUrlDisplay = `closdex.com/u/${sp.publicSlug}`;

  return (
    <div data-resp="sp-profile">
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>

        {/* Header row ─────────────────────────────────────────────────── */}
        <div data-sp-profile-header data-r="stack-sm gap16-sm alignstart-sm" style={{ display: 'flex', alignItems: 'flex-start', gap: '22px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#0B0B0F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '32px', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '30px', letterSpacing: '-0.03em', color: '#0B0B0F' }}>
                {user.name}
              </h1>
              {openToWork && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 11px', borderRadius: '100px', background: 'rgba(31,138,91,0.1)', color: '#1F8A5B', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1F8A5B' }} />
                  Open to work
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '14px', color: '#7A7A86', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: rank.pillFg, fontWeight: 600 }}>
                <span style={{ width: '11px', height: '13px', background: rank.color, display: 'inline-block', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }} />
                {rank.label} tier
              </span>
              {subtitleParts.map((part, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ color: '#D8D8E0' }}>·</span>
                  <span>{part}</span>
                </span>
              ))}
              {sp.currentStreakDays > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ color: '#D8D8E0' }}>·</span>
                  <span style={{ color: '#C2604A', fontWeight: 600 }}>{sp.currentStreakDays}-day streak</span>
                </span>
              )}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '7px 9px 7px 13px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#FAFAF8' }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '12.5px', color: '#3A3A44' }}>{publicUrlDisplay}</span>
              <button
                onClick={handleShare}
                title={copied ? 'Copied!' : 'Copy link'}
                style={{ width: '28px', height: '28px', borderRadius: '7px', border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 0 1px #E7E7EC' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </button>
            </div>
          </div>
          <div data-sp-profile-actions data-r="full-sm stack-sm gap16-sm" style={{ display: 'flex', alignItems: 'center', gap: '11px', flexShrink: 0 }}>
            <button
              onClick={handleToggleOpenToWork}
              disabled={toggling}
              data-r="btnfull"
              style={{ height: '40px', padding: '0 16px', border: '1px solid #E7E7EC', borderRadius: '10px', background: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13.5px', fontWeight: 600, color: '#3A3A44', cursor: toggling ? 'wait' : 'pointer', opacity: toggling ? 0.6 : 1 }}
            >
              {openToWork ? 'Remove open to work' : 'Mark open to work'}
            </button>
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-r="btnfull"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '40px', padding: '0 18px', border: 'none', borderRadius: '10px', background: '#0B0B0F', color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              View public
            </Link>
          </div>
        </div>

        {/* Stats row ──────────────────────────────────────────────────── */}
        <section data-sp-profile-stats style={{ display: 'flex', alignItems: 'stretch', gap: '30px', flexWrap: 'wrap', padding: '24px 0 28px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', marginBottom: '42px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#F5A524' }}>
                  {sp.totalPoints.toLocaleString()}
                </span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '10px' }}>Total points</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px' }}>
            <div data-r="hide-sm" style={{ width: '1px', background: '#E7E7EC' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '15px', height: '18px', background: rank.color, display: 'inline-block', clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)' }} />
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.03em', lineHeight: '0.95', color: rank.color }}>
                  {rank.label}
                </span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '10px' }}>Global rank</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px' }}>
            <div data-r="hide-sm" style={{ width: '1px', background: '#E7E7EC' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>
                  {completed.length}
                </span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '10px' }}>Completed</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px' }}>
            <div data-r="hide-sm" style={{ width: '1px', background: '#E7E7EC' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>
                  {winRate}%
                </span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '10px' }}>Goal achieved</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'stretch', gap: '30px' }}>
            <div data-r="hide-sm" style={{ width: '1px', background: '#E7E7EC' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.03em', lineHeight: '0.95', color: '#0B0B0F' }}>
                  {nextValue}
                </span>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9AA4', marginTop: '10px' }}>{nextLabel}</div>
            </div>
          </div>
        </section>

        {/* Heatmap ────────────────────────────────────────────────────── */}
        <section style={{ marginBottom: '46px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86' }}>Challenge activity</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A9AA4' }}>
              {attempts.length} attempts total · last 16 weeks
            </div>
          </div>
          <div className="r-hscroll" data-r="scrollx">
            <div style={{ display: 'flex', gap: '3px' }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.days.map((d, di) => (
                    <div key={di} style={{ width: '13px', height: '13px', borderRadius: '3px', background: d.bg }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two-column main ────────────────────────────────────────────── */}
        <div data-sp-profile-lower data-r="cols1-sm gap20-sm" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '44px', alignItems: 'start' }}>

          {/* Recent challenges ─────────────────────────────────────── */}
          <section>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86', marginBottom: '4px' }}>Recent challenges</div>

            {attemptsLoading ? (
              <div style={{ padding: '24px 4px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                Loading attempts…
              </div>
            ) : fetchError ? (
              <div style={{ padding: '24px 4px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', fontSize: '13px', color: '#A93F37' }}>
                {fetchError}
              </div>
            ) : recentChallenges.length === 0 ? (
              <div style={{ padding: '32px 4px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', textAlign: 'center' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#3A3A44', marginBottom: '4px' }}>No completed challenges yet</div>
                <div style={{ fontSize: '12.5px', color: '#9A9AA4' }}>Finish your first challenge to see it here.</div>
              </div>
            ) : (
              recentChallenges.map((c, i) => {
                const isLast = i === recentChallenges.length - 1;
                const diff = c.challenge.difficulty;
                const dotColor = DIFFICULTY_DOT[diff] ?? '#9A9AA4';
                return (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/attempts/${c.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '15px 4px',
                      borderTop: '1px solid #E7E7EC',
                      borderBottom: isLast ? '1px solid #E7E7EC' : undefined,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Space Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#3A3A44', width: '74px', flexShrink: 0 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
                      {difficultyLabel(diff)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B0B0F', marginBottom: '4px' }}>{c.challenge.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#7A7A86' }}>
                        {c.goalAchieved ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A93F37" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        )}
                        {c.challenge.goalDescription}
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '13px', fontWeight: 700, color: c.pointsAwarded && c.pointsAwarded > 0 ? '#F5A524' : '#9A9AA4', flexShrink: 0 }}>
                      {c.pointsAwarded && c.pointsAwarded > 0 ? `+${c.pointsAwarded}` : '0'}
                    </span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', color: '#9A9AA4', flexShrink: 0, width: '60px', textAlign: 'right' }}>
                      {timeAgo(c.completedAt)}
                    </span>
                  </div>
                );
              })
            )}
          </section>

          {/* Right column ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Badges ─────────────────────────────────────────────── */}
            <section>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86', marginBottom: '18px' }}>
                Badges{badges.length > 0 ? ` · ${badges.length}` : ''}
              </div>
              {badgesLoading ? (
                <div style={{ borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', padding: '24px 16px', fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4', textAlign: 'center' }}>
                  Loading…
                </div>
              ) : badges.length === 0 ? (
                <div style={{ borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', padding: '34px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F3F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B6B6C0" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#3A3A44', marginBottom: '4px' }}>No badges yet</div>
                  <div style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#9A9AA4', maxWidth: '220px' }}>Complete challenges to earn them.</div>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC', padding: '18px 4px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      title={b.description}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: '#FAFAF8', border: '1px solid #E7E7EC' }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: b.iconUrl ? 'transparent' : 'rgba(245,165,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', fontSize: '20px' }}>
                        {b.iconUrl ? (
                          <img src={b.iconUrl} alt={b.name} width={40} height={40} style={{ objectFit: 'contain', display: 'block' }} />
                        ) : '🏅'}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B0B0F', marginBottom: '2px' }}>{b.name}</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9A9AA4' }}>
                        {new Date(b.awardedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Career preferences ─────────────────────────────────── */}
            <section>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A7A86' }}>Career preferences</div>
                {!editing && (
                  <button
                    onClick={() => { setEditing(true); setSaveError(null); }}
                    style={{ fontSize: '12.5px', fontWeight: 600, color: '#3A2DC4', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '12px', borderTop: '1px solid #E7E7EC' }}>
                  {/* Open to work toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Open to work</span>
                    <button
                      onClick={() => setOpenToWork(!openToWork)}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px',
                        background: openToWork ? '#1F8A5B' : '#D8D8E0',
                        border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px', left: openToWork ? '20px' : '2px',
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        transition: 'left 0.15s',
                      }} />
                    </button>
                  </div>

                  <div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: '6px' }}>Current company</div>
                    <input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      placeholder="e.g. Freshworks"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid #E7E7EC', borderRadius: '8px', fontFamily: 'Inter,sans-serif', fontSize: '13.5px', color: '#0B0B0F', background: '#fff' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: '6px' }}>Experience (years)</div>
                    <input
                      type="number"
                      min={0}
                      value={editExp}
                      onChange={(e) => setEditExp(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid #E7E7EC', borderRadius: '8px', fontFamily: 'Inter,sans-serif', fontSize: '13.5px', color: '#0B0B0F', background: '#fff' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4', marginBottom: '8px' }}>Specialization</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {SPEC_OPTIONS.map((tag) => {
                        const active = editTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() =>
                              setEditTags(active ? editTags.filter((t) => t !== tag) : [...editTags, tag])
                            }
                            style={{
                              padding: '5px 12px',
                              borderRadius: '999px',
                              border: `1px solid ${active ? '#5B4BF5' : '#E7E7EC'}`,
                              background: active ? 'rgba(91,75,245,0.1)' : '#fff',
                              color: active ? '#3A2DC4' : '#3A3A44',
                              fontFamily: 'Inter,sans-serif',
                              fontSize: '12.5px',
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

                  {saveError && (
                    <div style={{ fontSize: '12.5px', color: '#A93F37', padding: '8px 10px', borderRadius: '6px', background: 'rgba(169,63,55,0.08)' }}>
                      {saveError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      style={{ height: '36px', padding: '0 14px', border: '1px solid #E7E7EC', borderRadius: '8px', background: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, color: '#3A3A44', cursor: saving ? 'wait' : 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      style={{ height: '36px', padding: '0 16px', border: 'none', borderRadius: '8px', background: '#0B0B0F', color: '#fff', fontFamily: 'Inter,sans-serif', fontSize: '13px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', borderTop: '1px solid #E7E7EC' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Open to work</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0B0B0F' }}>{openToWork ? 'Yes' : 'No'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', borderTop: '1px solid #E7E7EC' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Current company</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: currentCompany ? '#0B0B0F' : '#9A9AA4' }}>
                      {currentCompany ?? '—'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', borderTop: '1px solid #E7E7EC' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Experience</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0B0B0F' }}>{sp.experienceYears ?? 0} years</span>
                  </div>
                  {user.location && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', borderTop: '1px solid #E7E7EC' }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Location</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0B0B0F' }}>{user.location}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 2px', borderTop: '1px solid #E7E7EC', borderBottom: '1px solid #E7E7EC' }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9AA4' }}>Specialization</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: sp.specializationTags.length > 0 ? '#0B0B0F' : '#9A9AA4' }}>
                      {sp.specializationTags.length > 0 ? sp.specializationTags.join(', ') : '—'}
                    </span>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
