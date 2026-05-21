'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, PlacementSummary } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { RankBadge } from '@/components/ui/RankBadge';
import { Stat } from '@/components/ui/Stat';
import { rankFromEnum, type RankName } from '@/lib/constants';

function fmtRupees(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function fmtLpa(annualCtc: number): string {
  const lpa = annualCtc / 100000;
  return '₹' + (Number.isInteger(lpa) ? lpa.toString() : lpa.toFixed(1)) + ' LPA';
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const INVOICE_COLORS: Record<string, string> = {
  DRAFT: 'var(--gold)',
  ISSUED: 'var(--cool)',
  PAID: 'var(--emerald)',
};

function InvoiceBadge({ status }: { status: string }) {
  const color = INVOICE_COLORS[status] ?? 'var(--text-mute)';
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 6,
        background: `color-mix(in oklch, ${color} 15%, transparent)`,
        color,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}

export default function HiresBillingPage() {
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [items, setItems] = useState<PlacementSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = user?.companyMemberships?.[0]?.companyId ?? '';

  useEffect(() => {
    if (authLoading || !user || !companyId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.placements
      .list({ companyId, perPage: 100 })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Something went wrong');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, user, companyId]);

  if (authLoading || !user) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  // Summary stats
  const totalCommission = items.reduce((sum, p) => sum + (p.commissionAmount ?? 0), 0);
  const pendingInvoices = items.filter((p) => p.invoice && p.invoice.status !== 'PAID').length;

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div>
        <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
          Hires &amp; Billing
        </h1>
        <p style={{ color: 'var(--text-dim)', margin: '6px 0 0', fontSize: 13.5 }}>
          Confirmed hires and placement invoices
        </p>
      </div>

      {/* Stats strip */}
      {!loading && !error && (
        <Card padding={20}>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <Stat
              label="Total hires"
              value={String(total)}
              accent="var(--text)"
            />
            <div style={{ width: 1, background: 'var(--border-soft)', alignSelf: 'stretch' }} />
            <Stat
              label="Total commission"
              value={fmtRupees(totalCommission)}
              accent="var(--emerald)"
            />
            <div style={{ width: 1, background: 'var(--border-soft)', alignSelf: 'stretch' }} />
            <Stat
              label="Invoices pending"
              value={String(pendingInvoices)}
              sub="awaiting payment"
              accent={pendingInvoices > 0 ? 'var(--gold)' : 'var(--text-mute)'}
            />
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>
          Loading hires…
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
          No confirmed hires yet.
        </div>
      )}

      {/* Placement rows */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Column headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.4fr 0.9fr 0.9fr 0.9fr 1fr 1fr',
              gap: 12,
              padding: '0 18px',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>Salesperson</span>
            <span>Role</span>
            <span>Annual CTC</span>
            <span>Commission</span>
            <span>Confirmed</span>
            <span>Invoice status</span>
            <span>Invoice #</span>
          </div>

          {items.map((p) => {
            const rank = rankFromEnum(p.salesperson.rank) as RankName;
            return (
              <Card key={p.id} padding={16}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.4fr 0.9fr 0.9fr 0.9fr 1fr 1fr',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  {/* Salesperson */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RankBadge rank={rank} size={18} />
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.salesperson.user.name}</span>
                  </div>

                  {/* Job title */}
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{p.job.title}</span>

                  {/* Annual CTC */}
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--emerald)' }}>
                    {fmtLpa(p.annualCtc)}
                  </span>

                  {/* Commission */}
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>
                    {fmtRupees(p.commissionAmount)}
                  </span>

                  {/* Confirmed date */}
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {fmtDate(p.confirmedAt)}
                  </span>

                  {/* Invoice status badge */}
                  <div>
                    {p.invoice ? (
                      <InvoiceBadge status={p.invoice.status} />
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--text-mute)' }}>—</span>
                    )}
                  </div>

                  {/* Invoice number */}
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {p.invoice?.number ?? '—'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
