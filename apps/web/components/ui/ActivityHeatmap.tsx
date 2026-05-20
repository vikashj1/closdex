'use client';

import { useMemo } from 'react';

/** Seeded PRNG-driven activity counts so the heatmap is deterministic between renders.
 *  Replace with real challenge-completion data once wired to the API. */
function generateActivityData(days = 182, seed = 42): number[] {
  const out: number[] = [];
  let s = seed;
  const today = days - 1;
  for (let i = 0; i < days; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const daysFromToday = today - i;
    if (daysFromToday < 5) { out.push(1 + Math.floor(r * 3)); continue; }
    if (daysFromToday >= 28 && daysFromToday <= 39) { out.push(1 + Math.floor(r * 4)); continue; }
    if (r < 0.55) { out.push(0); continue; }
    if (r < 0.78) { out.push(1 + Math.floor(r * 2)); continue; }
    if (r < 0.92) { out.push(3 + Math.floor(r * 2)); continue; }
    out.push(5 + Math.floor(r * 4));
  }
  return out;
}

const HEATMAP_LEVELS = [
  'oklch(0.945 0.005 80)',   // 0
  'oklch(0.86 0.06 150)',    // 1-2
  'oklch(0.74 0.11 150)',    // 3-4
  'oklch(0.62 0.14 150)',    // 5-6
  'oklch(0.5 0.16 150)',     // 7+
];

function heatLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface Props {
  weeks?: number;
  compact?: boolean;
  seed?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}

export function ActivityHeatmap({
  weeks = 26, compact = false, seed = 42, showLabels = true, showLegend = true,
}: Props) {
  const days = weeks * 7;
  const data = useMemo(() => generateActivityData(days, seed), [days, seed]);
  const cell = compact ? 9 : 12;
  const gap = compact ? 2 : 3;
  const radius = compact ? 2 : 3;

  const today = new Date();
  const colDate = (c: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (weeks - 1 - c) * 7);
    return d;
  };

  const monthMarkers: { col: number; label: string }[] = [];
  let lastMonth = -1;
  for (let c = 0; c < weeks; c++) {
    const m = colDate(c).getMonth();
    if (m !== lastMonth) {
      monthMarkers.push({ col: c, label: MONTH_LABELS[m] });
      lastMonth = m;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {showLabels && !compact && (
        <div style={{ display: 'flex', paddingLeft: 26, gap, fontSize: 9.5, color: 'var(--text-mute)', fontWeight: 500 }}>
          {Array.from({ length: weeks }).map((_, c) => {
            const mk = monthMarkers.find((m) => m.col === c);
            return (
              <div key={c} style={{ width: cell, textAlign: 'left', overflow: 'visible', whiteSpace: 'nowrap' }}>
                {mk ? mk.label : ''}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {showLabels && !compact && (
          <div style={{ display: 'flex', flexDirection: 'column', gap, fontSize: 9.5, color: 'var(--text-mute)', width: 20, fontWeight: 500 }}>
            {[' ', 'Mon', ' ', 'Wed', ' ', 'Fri', ' '].map((d, i) => (
              <div key={i} style={{ height: cell, lineHeight: `${cell}px` }}>{d}</div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap }}>
          {Array.from({ length: weeks }).map((_, c) => (
            <div key={c} style={{ display: 'flex', flexDirection: 'column', gap }}>
              {Array.from({ length: 7 }).map((_, r) => {
                const idx = c * 7 + r;
                if (idx >= days) return <div key={r} style={{ width: cell, height: cell }} />;
                const count = data[idx];
                const lvl = heatLevel(count);
                const d = new Date(today);
                d.setDate(d.getDate() - (days - 1 - idx));
                const dateStr = `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
                return (
                  <div
                    key={r}
                    title={`${count} challenge${count !== 1 ? 's' : ''} · ${dateStr}`}
                    style={{
                      width: cell,
                      height: cell,
                      borderRadius: radius,
                      background: HEATMAP_LEVELS[lvl],
                      outline:
                        count > 0
                          ? '1px solid color-mix(in oklch, var(--text) 5%, transparent)'
                          : '1px solid color-mix(in oklch, var(--text) 3%, transparent)',
                      outlineOffset: -1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {showLegend && !compact && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--text-mute)' }}>
          <span>Less</span>
          {HEATMAP_LEVELS.map((bg, i) => (
            <div
              key={i}
              style={{
                width: cell,
                height: cell,
                borderRadius: radius,
                background: bg,
                outline: '1px solid color-mix(in oklch, var(--text) 3%, transparent)',
                outlineOffset: -1,
              }}
            />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}
