import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 32,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1,
          color: 'var(--border)',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Page not found</h1>
      <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: 0, maxWidth: 340 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          padding: '10px 22px',
          borderRadius: 9,
          background: 'var(--cool)',
          color: 'white',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Go home
      </Link>
    </div>
  );
}
