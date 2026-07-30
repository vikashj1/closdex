'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api, ApiError } from '@/lib/api';

type Summary = Awaited<ReturnType<typeof api.admin.llmUsage.summary>>;

export default function AdminLlmUsagePage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.admin.llmUsage.summary(days)
      .then((r) => { if (!cancelled) setSummary(r); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load usage.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>LLM usage</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>
            Per-call metrics from OpenAI + Anthropic. Every complete() is logged fire-and-forget.
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value, 10))}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', fontSize: 13 }}
        >
          <option value={1}>Last 24h</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: 'rgba(200,50,50,0.1)', color: 'var(--d-expert)', borderRadius: 8, fontSize: 12.5 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>Loading…</div>}

      {summary && !loading && (
        <>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, padding: '20px 24px' }}>
              <Stat label="Calls" value={summary.totals.calls.toLocaleString()} />
              <Stat label="Input tokens" value={summary.totals.inputTokens.toLocaleString()} />
              <Stat label="Output tokens" value={summary.totals.outputTokens.toLocaleString()} />
              <Stat label="Avg latency" value={`${summary.totals.avgLatencyMs} ms`} />
            </div>
          </Card>

          <Card style={{ marginBottom: 20, padding: '16px 20px' }}>
            <SectionTitle>By model</SectionTitle>
            {summary.byModel.length === 0 ? (
              <Empty>No calls in this window yet.</Empty>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <Th>Model</Th>
                    <Th align="right">Calls</Th>
                    <Th align="right">Input</Th>
                    <Th align="right">Output</Th>
                    <Th align="right">Avg latency</Th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byModel.map((r) => (
                    <tr key={r.model}>
                      <Td><code style={{ fontSize: 12, color: 'var(--cool)' }}>{r.model}</code></Td>
                      <Td align="right">{r.calls.toLocaleString()}</Td>
                      <Td align="right">{r.inputTokens.toLocaleString()}</Td>
                      <Td align="right">{r.outputTokens.toLocaleString()}</Td>
                      <Td align="right">{r.avgLatencyMs} ms</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card style={{ padding: '16px 20px' }}>
            <SectionTitle>By day</SectionTitle>
            {summary.byDay.length === 0 ? (
              <Empty>No calls in this window yet.</Empty>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <Th>Day</Th>
                    <Th align="right">Calls</Th>
                    <Th align="right">Input</Th>
                    <Th align="right">Output</Th>
                    <Th align="right">Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byDay.map((r) => (
                    <tr key={r.day}>
                      <Td>{r.day}</Td>
                      <Td align="right">{r.calls.toLocaleString()}</Td>
                      <Td align="right">{r.inputTokens.toLocaleString()}</Td>
                      <Td align="right">{r.outputTokens.toLocaleString()}</Td>
                      <Td align="right">{(r.inputTokens + r.outputTokens).toLocaleString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--text-mute)', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-mute)', textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>;
}
function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <th style={{ textAlign: align, padding: '8px 6px', fontWeight: 600, borderBottom: '1px solid var(--border-soft)', color: 'var(--text-mute)', fontSize: 11 }}>{children}</th>;
}
function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <td style={{ textAlign: align, padding: '8px 6px', borderBottom: '1px solid var(--border-soft)' }}>{children}</td>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '16px 6px', color: 'var(--text-mute)', fontSize: 12.5 }}>{children}</div>;
}
