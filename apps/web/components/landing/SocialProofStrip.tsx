const LOGOS = ['Razorpay', 'Zoho', 'Freshworks', 'Postman', 'Atlan', 'Mindtickle', 'Browserstack'];

const BADGES = [
  { e: '🔒', t: 'SOC 2 Type II in progress' },
  { e: '🇮🇳', t: 'GST + Indian payments' },
  { e: '✅', t: '90-day replacement guarantee' },
  { e: '⚡', t: 'Razorpay + Stripe payments' },
];

export function SocialProofStrip() {
  return (
    <section style={{ padding: '48px 64px', borderTop: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24, fontSize: 11.5, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
        Hiring on Closdex
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.7 }}>
        {LOGOS.map((l) => (
          <div key={l} className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
        {BADGES.map((b) => (
          <div key={b.t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-mute)' }}>
            <span>{b.e}</span>{b.t}
          </div>
        ))}
      </div>
    </section>
  );
}
