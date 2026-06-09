import { SuspicionService, QUARANTINE_THRESHOLD } from './suspicion.service';
import { AiContentDetectorService } from './ai-content-detector.service';

describe('SuspicionService', () => {
  const svc = new SuspicionService(new AiContentDetectorService());

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

  it('AI-content + paste-burst together push a borderline attempt to quarantine', () => {
    const aiText =
      'I completely understand your concern. I would be happy to provide additional information. Furthermore, I can assure you that our solution would be ideal. Additionally, please let me know at your earliest convenience.';
    const result = svc.compute([
      { clientMeta: { pasteCount: 1, pastedChars: 10, totalTypingMs: 15000, charCount: 200 }, content: aiText },
      { clientMeta: { pasteCount: 2, pastedChars: 10, totalTypingMs: 15000, charCount: 200 }, content: aiText },
    ]);
    expect(result.flags.aiContentLikeness).toBeGreaterThan(0.4);
    expect(result.flags.contributions.aiContent).toBeGreaterThan(0);
    expect(result.quarantined).toBe(true);
  });

  it('clean human content + no paste lands well under quarantine even with content provided', () => {
    const result = svc.compute([
      { clientMeta: { pasteCount: 0, pastedChars: 0, totalTypingMs: 10000, charCount: 100 }, content: "Sounds good — I'll set up a quick call tomorrow. What time works for you?" },
    ]);
    expect(result.quarantined).toBe(false);
  });
});
