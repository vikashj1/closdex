import { RANKS, RankName } from '@/lib/constants';

interface Props {
  rank?: RankName;
  size?: number;
  showLabel?: boolean;
}

export function RankBadge({ rank = 'Gold', size = 28, showLabel = false }: Props) {
  const r = RANKS[rank] || RANKS.Rookie;
  const gradId = `g-${rank}`;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={`color-mix(in oklch, ${r.color} 130%, white 0%)`} />
            <stop offset="1" stopColor={`color-mix(in oklch, ${r.color} 70%, black 30%)`} />
          </linearGradient>
        </defs>
        <path
          d="M16 2 L28 8 V18 C28 24 22 28 16 30 C10 28 4 24 4 18 V8 Z"
          fill={`url(#${gradId})`}
          stroke={`color-mix(in oklch, ${r.color} 60%, black 30%)`}
          strokeWidth="0.8"
        />
        <path d="M11 13 L16 9 L21 13 L19 21 L13 21 Z" fill="rgba(0,0,0,0.18)" />
      </svg>
      {showLabel && (
        <span
          className="display"
          style={{ fontWeight: 600, fontSize: 13, color: r.color }}
        >
          {rank}
        </span>
      )}
    </div>
  );
}
