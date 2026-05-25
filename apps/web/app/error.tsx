'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
      <div style={{ fontSize: 48 }}>⚠</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Something went wrong</h1>
      <p style={{ fontSize: 14, color: 'var(--text-mute)', margin: 0, maxWidth: 380 }}>
        An unexpected error occurred. You can try refreshing the page or go back home.
      </p>
      {error.digest && (
        <code style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'monospace' }}>
          {error.digest}
        </code>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 22px',
            borderRadius: 9,
            background: 'var(--cool)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: '10px 22px',
            borderRadius: 9,
            background: 'var(--bg-2)',
            color: 'var(--text-dim)',
            fontSize: 14,
            fontWeight: 600,
            border: '1px solid var(--border)',
            textDecoration: 'none',
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
