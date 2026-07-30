import { LlmUsageService } from './llm-usage.service';

function makeSvc(rows: any[] = []) {
  const prisma = {
    llmUsageLog: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue(rows),
    },
  } as any;
  return { svc: new LlmUsageService(prisma), prisma };
}

describe('LlmUsageService', () => {
  describe('log', () => {
    it('is fire-and-forget: does not throw when prisma.create rejects', async () => {
      const { svc, prisma } = makeSvc();
      (prisma.llmUsageLog.create as jest.Mock).mockRejectedValue(new Error('db down'));
      // Method is synchronous void — the internal promise must swallow.
      expect(() =>
        svc.log({ provider: 'openai', model: 'gpt-4o-mini', inputTokens: 10, outputTokens: 5, latencyMs: 120 }),
      ).not.toThrow();
      // Give the microtask a beat so the catch handler runs.
      await Promise.resolve();
    });

    it('passes the row through to prisma.llmUsageLog.create', () => {
      const { svc, prisma } = makeSvc();
      svc.log({ provider: 'openai', model: 'gpt-4o-mini', inputTokens: 100, outputTokens: 50, latencyMs: 250 });
      expect(prisma.llmUsageLog.create).toHaveBeenCalledWith({
        data: { provider: 'openai', model: 'gpt-4o-mini', inputTokens: 100, outputTokens: 50, latencyMs: 250 },
      });
    });
  });

  describe('summary', () => {
    it('aggregates totals + per-model + per-day for the window', async () => {
      const now = new Date();
      const day = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const { svc } = makeSvc([
        { provider: 'openai', model: 'gpt-4o-mini', inputTokens: 100, outputTokens: 50, latencyMs: 200, createdAt: day(0) },
        { provider: 'openai', model: 'gpt-4o-mini', inputTokens: 200, outputTokens: 80, latencyMs: 400, createdAt: day(0) },
        { provider: 'anthropic', model: 'claude-haiku-4-5', inputTokens: 300, outputTokens: 120, latencyMs: 600, createdAt: day(1) },
      ]);
      const r = await svc.summary(7);
      expect(r.totals).toEqual({
        calls: 3,
        inputTokens: 600,
        outputTokens: 250,
        totalLatencyMs: 1200,
        avgLatencyMs: 400,
      });
      expect(r.byModel).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ model: 'openai/gpt-4o-mini', calls: 2 }),
          expect.objectContaining({ model: 'anthropic/claude-haiku-4-5', calls: 1 }),
        ]),
      );
      expect(r.byDay.length).toBe(2);
    });

    it('returns zeroed totals when there are no rows in the window', async () => {
      const { svc } = makeSvc([]);
      const r = await svc.summary(7);
      expect(r.totals).toEqual({ calls: 0, inputTokens: 0, outputTokens: 0, totalLatencyMs: 0, avgLatencyMs: 0 });
      expect(r.byModel).toEqual([]);
      expect(r.byDay).toEqual([]);
    });
  });
});
