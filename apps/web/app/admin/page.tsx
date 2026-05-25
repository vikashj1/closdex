'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { api, AuditLogEntry, VerificationCompany, DisputeSummary } from '@/lib/api';

type PlatformStats = {
  users: { salespersons: number; companies: number; admins: number };
  challenges: { total: number; published: number };
  attempts: { total: number; thisWeek: number; completedThisWeek: number };
};

// ── helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TODAY = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// ── page ───────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const [openDisputes, setOpenDisputes] = useState<number | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationCompany[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState<number | null>(null);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [disputesResult, verificationResult, auditResult, statsResult] = await Promise.allSettled([
      api.admin.disputes.list({ perPage: 5 }),
      api.admin.verification.listPending(),
      api.admin.audit.list({ perPage: 5 }),
      api.admin.stats(),
    ]);

    if (disputesResult.status === 'fulfilled') {
      const open = disputesResult.value.items.filter(
        (d: DisputeSummary) => d.status === 'OPEN',
      ).length;
      setOpenDisputes(disputesResult.value.total > 5 ? disputesResult.value.total : open);
    }
    if (verificationResult.status === 'fulfilled') setPendingVerifications(verificationResult.value);
    if (auditResult.status === 'fulfilled') {
      setAuditEntries(auditResult.value.items);
      setAuditTotal(auditResult.value.total);
    }
    if (statsResult.status === 'fulfilled') setPlatformStats(statsResult.value);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.admin.verification.approve(id);
      setPendingVerifications((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // keep entry on failure
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.admin.verification.reject(id);
      setPendingVerifications((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // keep entry on failure
    }
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          Admin Panel
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>{TODAY}</p>
      </div>

      {/* Platform KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Salespersons"    value={loading ? '—' : String(platformStats?.users.salespersons ?? 0)} accent="var(--gold)" />
        <StatCard label="Companies"       value={loading ? '—' : String(platformStats?.users.companies ?? 0)}    accent="var(--cool)" />
        <StatCard label="Challenges Live" value={loading ? '—' : String(platformStats?.challenges.published ?? 0)} accent="var(--emerald)" />
        <StatCard label="Attempts / week" value={loading ? '—' : String(platformStats?.attempts.thisWeek ?? 0)}  accent="var(--r-gold)" />
      </div>

      {/* Action items strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        <StatCard label="Open Disputes"        value={loading ? '—' : String(openDisputes ?? 0)}              accent="var(--d-expert)" />
        <StatCard label="Pending Verifications" value={loading ? '—' : String(pendingVerifications.length)}   accent="var(--gold)" />
        <StatCard label="Total Audit Entries"  value={loading ? '—' : String(auditTotal ?? 0)}                accent="var(--text-dim)" />
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Audit log */}
        <Card>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
              Recent Audit Entries
            </span>
          </div>

          {loading && (
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>Loading…</p>
          )}

          {!loading && auditEntries.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>No entries yet.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {auditEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--cool)',
                        fontFamily: 'monospace',
                      }}
                    >
                      {entry.action}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-mute)', margin: '0 6px' }}>
                      ·
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{entry.entity}</span>
                    <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 2 }}>
                      by {entry.actor.name}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-mute)', whiteSpace: 'nowrap' }}>
                    {timeAgo(entry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending verifications */}
        <Card>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
              Pending Verifications
            </span>
          </div>

          {loading && (
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>Loading…</p>
          )}

          {!loading && pendingVerifications.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0 }}>
              No pending verifications.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingVerifications.map((company) => (
              <div
                key={company.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                    {company.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'var(--text-mute)',
                      marginTop: 2,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {company.industry && <span>{company.industry}</span>}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--cool)', textDecoration: 'none' }}
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn
                    kind="success"
                    size="sm"
                    onClick={() => handleApprove(company.id)}
                  >
                    Approve
                  </Btn>
                  <button
                    onClick={() => handleReject(company.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '7px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── StatCard subcomponent ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: accent,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
    </Card>
  );
}
