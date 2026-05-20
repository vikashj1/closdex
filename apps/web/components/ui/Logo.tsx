export function Logo({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 18 L9 18 L11 12 L13 18 L19 18 L15 6 L9 6 Z" fill="var(--gold)" />
        <path d="M3 21 L21 21" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span
        className="display"
        style={{ fontWeight: 700, fontSize: size * 0.82, letterSpacing: '-0.03em' }}
      >
        Clos<span style={{ color: 'var(--gold)' }}>dex</span>
      </span>
    </div>
  );
}
