export function Avatar({ name = 'AB', size = 36, color }: { name?: string; size?: number; color?: string }) {
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const hue = (name.charCodeAt(0) * 17) % 360;
  const bg = color || `oklch(0.55 0.13 ${hue})`;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: size * 0.4,
        fontFamily: 'Space Grotesk',
        letterSpacing: '-0.02em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
