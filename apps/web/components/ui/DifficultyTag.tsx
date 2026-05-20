import { DIFFICULTY, DifficultyLevel } from '@/lib/constants';

interface Props {
  level: DifficultyLevel;
  size?: 'sm' | 'md';
}

export function DifficultyTag({ level, size = 'md' }: Props) {
  const d = DIFFICULTY[level] || DIFFICULTY.Rookie;
  const padY = size === 'sm' ? 2 : 4;
  const padX = size === 'sm' ? 8 : 10;
  const fs = size === 'sm' ? 10.5 : 11.5;
  return (
    <span
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: `${padY}px ${padX}px`,
        borderRadius: 999,
        fontSize: fs,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: d.color,
        background: `color-mix(in oklch, ${d.color} 14%, transparent)`,
        border: `1px solid color-mix(in oklch, ${d.color} 35%, transparent)`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: d.color,
          boxShadow: `0 0 8px ${d.color}`,
        }}
      />
      {level}
    </span>
  );
}
