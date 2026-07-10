// Placeholder shown while Company + Jobs surfaces are gated for the beta launch.
export const metadata = { title: 'Coming soon · Closdex' };

export default function ComingSoonPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        background: 'var(--bg)',
        color: 'var(--text)',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          border: '0.5px solid var(--border)',
          borderRadius: 16,
          padding: 'clamp(28px, 5vw, 44px)',
          background: 'var(--surface)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--mono, "JetBrains Mono", ui-monospace, monospace)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: 18,
          }}
        >
          Coming soon
        </span>
        <h1
          style={{
            fontFamily: 'var(--display, "Space Grotesk", system-ui, sans-serif)',
            fontWeight: 700,
            fontSize: 'clamp(28px, 4.5vw, 40px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 14px',
          }}
        >
          The hiring side is on its way.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--text-dim)', margin: '0 0 26px' }}>
          Closdex is live for salespeople. Company search, the job board, and applications open next.
          Sign up on the salesperson side and be the first on the board when hiring goes live.
        </p>
        <a
          href="/signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 22px',
            borderRadius: 10,
            background: 'var(--gold)',
            color: '#0B0B0F',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Start competing — free
        </a>
      </div>
    </main>
  );
}
