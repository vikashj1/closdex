import { SuspicionService, QUARANTINE_THRESHOLD } from './suspicion.service';

describe('SuspicionService', () => {
  const svc = new SuspicionService();

  it('returns score=0 + noTelemetry when no salesperson messages have clientMeta', () => {
    const result = svc.compute([{ clientMeta: null }, { clientMeta: null }]);
    expect(result.score).toBe(0);
    expect(result.quarantined).toBe(false);
    expect(result.flags.noTelemetry).toBe(true);
  });

  it('returns low score for a clean human typing pattern', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 8000, charCount: 80 } },
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 12000, charCount: 120 } },
    ]);
    expect(result.score).toBe(0);
    expect(result.quarantined).toBe(false);
    expect(result.flags.pasteRatio).toBe(0);
    expect(result.flags.instantTyping).toBe(false);
    expect(result.flags.superhumanSpeed).toBe(false);
    expect(result.flags.pasteBurst).toBe(false);
  });

  it('quarantines a fully-pasted attempt (paste ratio ~1)', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 1, pastedChars: 200, totalTypingMs: 5000, charCount: 200 } },
    ]);
    expect(result.flags.pasteRatio).toBe(1);
    expect(result.score).toBeGreaterThanOrEqual(QUARANTINE_THRESHOLD);
    expect(result.quarantined).toBe(true);
  });

  it('quarantines a long message submitted in under a second (instant typing)', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 300, charCount: 250 } },
    ]);
    expect(result.flags.instantTyping).toBe(true);
    expect(result.quarantined).toBe(true);
  });

  it('quarantines superhuman typing speed (>20 chars/sec sustained)', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 2000, charCount: 80 } },
    ]);
    expect(result.flags.superhumanSpeed).toBe(true);
    expect(result.quarantined).toBe(true);
  });

  it('flags pasteBurst (>=3 paste events) but does not alone quarantine', () => {
    // Typing pace: 200 chars in 18s = ~11 cps, comfortably human.
    const result = svc.compute([
      { clientMeta: { pasteCount: 2, pastedChars: 20, totalTypingMs: 18000, charCount: 200 } },
      { clientMeta: { pasteCount: 1, pastedChars: 10, totalTypingMs: 18000, charCount: 200 } },
    ]);
    expect(result.flags.pasteBurst).toBe(true);
    expect(result.flags.superhumanSpeed).toBe(false);
    expect(result.flags.contributions.pasteBurst).toBe(25);
    // pasteRatio is small here (~30/400 ≈ 0.075) so the total stays under threshold.
    expect(result.quarantined).toBe(false);
  });

  it('handles missing typing-time without dividing by zero', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 0, charCount: 80 } },
    ]);
    expect(result.flags.instantTyping).toBe(false);
    expect(result.flags.superhumanSpeed).toBe(false);
  });
});
