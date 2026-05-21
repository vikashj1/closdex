'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';

interface ConfigState {
  tiers: unknown[];
  ranks: unknown[];
  rules: unknown[];
  dimensions: unknown[];
}

const PRE_STYLE = {
  background: 'var(--bg-2)',
  padding: 16,
  borderRadius: 8,
  fontSize: 11,
  overflowX: 'auto' as const,
  margin: 0,
  color: 'var(--text)',
  lineHeight: 1.6,
};

const SECTION_HEADING_STYLE = {
  fontSize: 14,
  fontWeight: 700 as const,
  color: 'var(--text)',
  margin: '0 0 12px 0',
};

export default function ScoringConfigPage() {
  const { loading: authLoading } = useRequireAuth('ADMIN');

  const [config, setConfig] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.admin.config.difficultyTiers(),
      api.admin.config.ranks(),
      api.admin.config.scoringRules(),
      api.admin.config.rubricDimensions(),
    ]).then(([tiersRes, ranksRes, rulesRes, dimensionsRes]) => {
      if (cancelled) return;

      const extract = (res: PromiseSettledResult<unknown[]>): unknown[] => {
        if (res.status === 'fulfilled') return res.value ?? [];
        return [];
      };

      const errors: string[] = [];
      [tiersRes, ranksRes, rulesRes, dimensionsRes].forEach((res, i) => {
        if (res.status === 'rejected') {
          const names = ['Difficulty Tiers', 'Ranks', 'Scoring Rules', 'Rubric Dimensions'];
          const msg = res.reason instanceof ApiError ? res.reason.message : String(res.reason);
          errors.push(`${names[i]}: ${msg}`);
        }
      });

      setConfig({
        tiers: extract(tiersRes),
        ranks: extract(ranksRes),
        rules: extract(rulesRes),
        dimensions: extract(dimensionsRes),
      });

      if (errors.length > 0) {
        setError(errors.join(' · '));
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  if (authLoading) return null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          margin: '0 0 6px 0',
          color: 'var(--text)',
        }}
      >
        Scoring Config
      </h1>

      <div
        style={{
          display: 'inline-block',
          padding: '8px 14px',
          borderRadius: 8,
          background: 'color-mix(in oklch, var(--cool) 12%, transparent)',
          border: '1px solid color-mix(in oklch, var(--cool) 30%, transparent)',
          color: 'var(--cool)',
          fontSize: 12.5,
          fontWeight: 500,
          marginBottom: 28,
        }}
      >
        Config editing via the UI is coming soon. Values shown are live from the database.
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'color-mix(in oklch, var(--d-expert, #e05) 12%, transparent)',
            border: '1px solid color-mix(in oklch, var(--d-expert, #e05) 30%, transparent)',
            color: 'var(--d-expert, #e05)',
            fontSize: 12.5,
            marginBottom: 20,
          }}
        >
          Some sections failed to load — {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--text-mute)',
            fontSize: 14,
          }}
        >
          Loading config…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card padding={20}>
            <h2 style={SECTION_HEADING_STYLE}>Difficulty Tiers</h2>
            <pre style={PRE_STYLE}>
              {JSON.stringify(config?.tiers, null, 2)}
            </pre>
          </Card>

          <Card padding={20}>
            <h2 style={SECTION_HEADING_STYLE}>Ranks</h2>
            <pre style={PRE_STYLE}>
              {JSON.stringify(config?.ranks, null, 2)}
            </pre>
          </Card>

          <Card padding={20}>
            <h2 style={SECTION_HEADING_STYLE}>Scoring Rules</h2>
            <pre style={PRE_STYLE}>
              {JSON.stringify(config?.rules, null, 2)}
            </pre>
          </Card>

          <Card padding={20}>
            <h2 style={SECTION_HEADING_STYLE}>Rubric Dimensions</h2>
            <pre style={PRE_STYLE}>
              {JSON.stringify(config?.dimensions, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
