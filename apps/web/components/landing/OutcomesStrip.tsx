import { pill } from './pill';

const OUTCOMES = [
  { n: '3.4x',  l: 'faster time to first interview',  sub: 'vs untracked LinkedIn applies', c: 'var(--gold)' },
  { n: '18d',   l: 'average time to confirmed hire',  sub: 'across 47 hiring partners',     c: 'var(--cool)' },
  { n: '73%',   l: 'median challenge completion rate', sub: 'industry avg: 41%',             c: 'var(--emerald)' },
  { n: '₹1.2L', l: 'avg placement commission',         sub: '12.5% of first-year CTC',       c: 'var(--r-master)' },
];

export function OutcomesStrip() {
  return (
    <section style={{ padding: '72px 64px', borderTop: '1px solid var(--border-soft)' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={pill('var(--emerald)')}>Outcomes — first 6 months of closed beta</div>
        <h2 className="display" style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', margin: '16px 0 0' }}>
          Numbers that move careers and pipelines.
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
        {OUTCOMES.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '28px 24px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--border-soft)',
              textAlign: 'left',
            }}
          >
            <div className="display mono" style={{ fontSize: 56, fontWeight: 700, color: s.c, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 10 }}>{s.l}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
