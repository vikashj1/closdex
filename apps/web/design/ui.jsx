/* Shared UI primitives for SalesArena. Globals exported to window. */

const { useState, useEffect, useRef, useMemo } = React;

/* -------- Logo -------- */
function Logo({ size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 18 L9 18 L11 12 L13 18 L19 18 L15 6 L9 6 Z" fill="var(--gold)" />
        <path d="M3 21 L21 21" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      <span className="display" style={{ fontWeight: 700, fontSize: size * 0.82, letterSpacing: "-0.03em" }}>
        Sales<span style={{ color: "var(--gold)" }}>Arena</span>
      </span>
    </div>
  );
}

/* -------- Difficulty tag -------- */
const DIFFICULTY = {
  Rookie:  { color: "var(--d-rookie)", base: 50 },
  Easy:    { color: "var(--d-easy)",   base: 100 },
  Medium:  { color: "var(--d-medium)", base: 200 },
  Hard:    { color: "var(--d-hard)",   base: 400 },
  Expert:  { color: "var(--d-expert)", base: 800 },
};

function DifficultyTag({ level, size = "md" }) {
  const d = DIFFICULTY[level] || DIFFICULTY.Rookie;
  const padY = size === "sm" ? 2 : 4;
  const padX = size === "sm" ? 8 : 10;
  const fs = size === "sm" ? 10.5 : 11.5;
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: `${padY}px ${padX}px`, borderRadius: 999,
      fontSize: fs, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: d.color, background: `color-mix(in oklch, ${d.color} 14%, transparent)`,
      border: `1px solid color-mix(in oklch, ${d.color} 35%, transparent)`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
      {level}
    </span>
  );
}

/* -------- Rank badge -------- */
const RANKS = {
  Rookie:      { color: "var(--r-rookie)",  min: 0 },
  Bronze:      { color: "var(--r-bronze)",  min: 500 },
  Silver:      { color: "var(--r-silver)",  min: 1500 },
  Gold:        { color: "var(--r-gold)",    min: 4000 },
  Platinum:    { color: "var(--r-platinum)",min: 9000 },
  Diamond:     { color: "var(--r-diamond)", min: 18000 },
  Master:      { color: "var(--r-master)",  min: 35000 },
  Grandmaster: { color: "var(--r-gm)",      min: 70000 },
};

function RankBadge({ rank = "Gold", size = 28, showLabel = false }) {
  const r = RANKS[rank] || RANKS.Rookie;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <defs>
          <linearGradient id={`g-${rank}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`color-mix(in oklch, ${r.color} 130%, white 0%)`} />
            <stop offset="1" stopColor={`color-mix(in oklch, ${r.color} 70%, black 30%)`} />
          </linearGradient>
        </defs>
        <path d="M16 2 L28 8 V18 C28 24 22 28 16 30 C10 28 4 24 4 18 V8 Z"
              fill={`url(#g-${rank})`}
              stroke={`color-mix(in oklch, ${r.color} 60%, black 30%)`} strokeWidth="0.8" />
        <path d="M11 13 L16 9 L21 13 L19 21 L13 21 Z"
              fill="rgba(0,0,0,0.18)" />
      </svg>
      {showLabel && (
        <span className="display" style={{ fontWeight: 600, fontSize: 13, color: r.color }}>
          {rank}
        </span>
      )}
    </div>
  );
}

/* -------- Buttons -------- */
function Btn({ kind = "primary", size = "md", icon, children, onClick, style = {}, full, type = "button" }) {
  const sizes = {
    sm: { padY: 7, padX: 12, fs: 12.5, gap: 6 },
    md: { padY: 11, padX: 16, fs: 13.5, gap: 8 },
    lg: { padY: 14, padX: 22, fs: 15, gap: 10 },
  };
  const s = sizes[size];
  const variants = {
    primary: { bg: "var(--gold)", color: "oklch(0.18 0.02 75)", border: "1px solid transparent" },
    secondary: { bg: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
    ghost: { bg: "transparent", color: "var(--text)", border: "1px solid var(--border)" },
    danger: { bg: "var(--d-expert)", color: "white", border: "1px solid transparent" },
    success: { bg: "var(--emerald)", color: "oklch(0.18 0.02 75)", border: "1px solid transparent" },
  };
  const v = variants[kind] || variants.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
        padding: `${s.padY}px ${s.padX}px`,
        background: v.bg, color: v.color, border: v.border,
        borderRadius: 10, fontWeight: 600, fontSize: s.fs,
        width: full ? "100%" : "auto",
        transition: "transform 0.08s ease, filter 0.15s",
        ...style,
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      {icon}
      {children}
    </button>
  );
}

/* -------- Card -------- */
function Card({ children, style = {}, hover = false, onClick, padding = 18 }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hover && h ? "var(--surface-3)" : "var(--border-soft)"}`,
        borderRadius: "var(--radius)",
        padding,
        cursor: onClick || hover ? "pointer" : "default",
        transform: hover && h ? "translateY(-2px)" : "none",
        transition: "transform 0.12s ease, border-color 0.15s",
        boxShadow: hover && h ? "var(--shadow-md)" : "var(--shadow-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* -------- Avatar -------- */
function Avatar({ name = "AB", size = 36, color }) {
  const initials = name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
  const hue = (name.charCodeAt(0) * 17) % 360;
  const bg = color || `oklch(0.55 0.13 ${hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, background: bg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 700, fontSize: size * 0.4, fontFamily: "Space Grotesk",
      letterSpacing: "-0.02em",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* -------- Stat -------- */
function Stat({ label, value, sub, accent, icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-mute)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
        {icon}{label}
      </div>
      <div className="display mono" style={{ fontSize: 24, fontWeight: 700, color: accent || "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{sub}</div>}
    </div>
  );
}

/* -------- Field -------- */
function Field({ label, children, hint, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-dim)" }}>
        {label}{required && <span style={{ color: "var(--d-expert)" }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{hint}</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", style }) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 13.5,
        color: "var(--text)",
        ...style,
      }}
    />
  );
}

/* -------- Chip -------- */
function Chip({ children, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 11px", borderRadius: 999,
      background: active ? (color || "var(--gold)") : "var(--bg-2)",
      color: active ? "oklch(0.18 0.02 75)" : "var(--text-dim)",
      border: `1px solid ${active ? "transparent" : "var(--border)"}`,
      fontSize: 12, fontWeight: 600,
    }}>
      {children}
    </button>
  );
}

/* -------- Image placeholder -------- */
function ImgPh({ label = "image", height = 160, style }) {
  return (
    <div className="stripe-ph" style={{
      height, borderRadius: 10,
      border: "1px dashed var(--border)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--text-mute)", fontSize: 11.5, fontFamily: "JetBrains Mono",
      ...style,
    }}>
      {label}
    </div>
  );
}

/* -------- Icons (simple inline) -------- */
const Icon = {
  home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>,
  trophy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 4h12v3a6 6 0 0 1-12 0z"/><path d="M6 4H4a2 2 0 0 0 2 4M18 4h2a2 2 0 0 1-2 4M12 13v4M8 21h8M9 17h6"/></svg>,
  target: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  bolt: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>,
  fire: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-5 1 1 2 1 2-1 0-1 0-2 1-3z"/></svg>,
  book: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>,
  briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>,
  bell: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9a6 6 0 0 1 12 0v5l2 3H4l2-3zM9 19a3 3 0 0 0 6 0"/></svg>,
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></svg>,
  filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
  send: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21l18-9L3 3l4 9z"/><path d="M7 12h14"/></svg>,
  clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m4 12 6 6L20 6"/></svg>,
  arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>,
  chevDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 9 6 6 6-6"/></svg>,
  trend: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  google: () => <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v3.8h5.4c-.2 1.4-1.6 4-5.4 4-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 4.4 14.5 3.5 12 3.5 7.3 3.5 3.5 7.3 3.5 12s3.8 8.5 8.5 8.5c4.9 0 8.2-3.5 8.2-8.3 0-.6-.1-1-.1-1.5z"/></svg>,
  linkedin: () => <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#0A66C2" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 18H5V10h3zM6.5 8.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 18h-3v-4.4c0-1.1-.4-1.8-1.4-1.8a1.5 1.5 0 0 0-1.4 1 1.8 1.8 0 0 0-.1.7V18h-3V10h3v1.3c.4-.6 1.2-1.5 2.8-1.5 2 0 3.5 1.3 3.5 4.2z"/></svg>,
};

/* -------- Activity Heatmap (GitHub-style contribution grid) -------- */
function generateActivityData(days = 182, seed = 42) {
  const out = [];
  let s = seed;
  const today = days - 1;
  for (let i = 0; i < days; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const daysFromToday = today - i;

    // Recent 5 days = current streak (1-3 each)
    if (daysFromToday < 5) {
      out.push(1 + Math.floor(r * 3));
      continue;
    }
    // Past 12-day streak ~30 days ago
    if (daysFromToday >= 28 && daysFromToday <= 39) {
      out.push(1 + Math.floor(r * 4));
      continue;
    }
    // General pattern: ~50% blank, sometimes bursts
    if (r < 0.55) { out.push(0); continue; }
    if (r < 0.78) { out.push(1 + Math.floor(r * 2)); continue; } // 1-2
    if (r < 0.92) { out.push(3 + Math.floor(r * 2)); continue; } // 3-4
    out.push(5 + Math.floor(r * 4)); // 5-8 (rare burst)
  }
  return out;
}

const HEATMAP_LEVELS = [
  "oklch(0.945 0.005 80)",   // 0 — warm neutral
  "oklch(0.86 0.06 150)",    // 1-2 — pale green
  "oklch(0.74 0.11 150)",    // 3-4 — light green
  "oklch(0.62 0.14 150)",    // 5-6 — mid green
  "oklch(0.5 0.16 150)",     // 7+ — deep green
];

function heatLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ActivityHeatmap({ weeks = 26, compact = false, seed = 42, showLabels = true, showLegend = true }) {
  const days = weeks * 7;
  const data = useMemo(() => generateActivityData(days, seed), [days, seed]);
  const cell = compact ? 9 : 12;
  const gap = compact ? 2 : 3;
  const radius = compact ? 2 : 3;

  // Build column starts → month labels (rough)
  const today = new Date();
  const colDate = (c) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (weeks - 1 - c) * 7);
    return d;
  };

  // Pick month label per column when month changes
  const monthMarkers = [];
  let lastMonth = -1;
  for (let c = 0; c < weeks; c++) {
    const m = colDate(c).getMonth();
    if (m !== lastMonth) {
      monthMarkers.push({ col: c, label: MONTH_LABELS[m] });
      lastMonth = m;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {showLabels && !compact && (
        <div style={{ display: "flex", paddingLeft: 26, gap, fontSize: 9.5, color: "var(--text-mute)", fontWeight: 500 }}>
          {Array.from({ length: weeks }).map((_, c) => {
            const mk = monthMarkers.find(m => m.col === c);
            return <div key={c} style={{ width: cell, textAlign: "left", overflow: "visible", whiteSpace: "nowrap" }}>{mk ? mk.label : ""}</div>;
          })}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        {showLabels && !compact && (
          <div style={{ display: "flex", flexDirection: "column", gap, fontSize: 9.5, color: "var(--text-mute)", width: 20, paddingTop: 0, fontWeight: 500 }}>
            {[" ", "Mon", " ", "Wed", " ", "Fri", " "].map((d, i) => (
              <div key={i} style={{ height: cell, lineHeight: `${cell}px` }}>{d}</div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap }}>
          {Array.from({ length: weeks }).map((_, c) => (
            <div key={c} style={{ display: "flex", flexDirection: "column", gap }}>
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
                    title={`${count} challenge${count !== 1 ? "s" : ""} · ${dateStr}`}
                    style={{
                      width: cell, height: cell, borderRadius: radius,
                      background: HEATMAP_LEVELS[lvl],
                      outline: count > 0 ? "1px solid color-mix(in oklch, var(--text) 5%, transparent)" : "1px solid color-mix(in oklch, var(--text) 3%, transparent)",
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
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-mute)" }}>
          <span>Less</span>
          {HEATMAP_LEVELS.map((bg, i) => (
            <div key={i} style={{ width: cell, height: cell, borderRadius: radius, background: bg, outline: "1px solid color-mix(in oklch, var(--text) 3%, transparent)", outlineOffset: -1 }} />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  Logo, DifficultyTag, RankBadge, Btn, Card, Avatar, Stat, Field, TextInput, Chip, ImgPh, Icon,
  DIFFICULTY, RANKS, ActivityHeatmap, generateActivityData, heatLevel, HEATMAP_LEVELS,
});
