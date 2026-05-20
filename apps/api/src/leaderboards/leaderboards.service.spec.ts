import { Test } from '@nestjs/testing';
import { LeaderboardsService } from './leaderboards.service';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Period } from './dto/list-leaderboard.dto';

// ---------------------------------------------------------------------------
// Mock factories — recreated fresh per test via jest.clearAllMocks()
// ---------------------------------------------------------------------------

const mockPipeline = {
  zincrby: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockRedis = {
  pipeline: jest.fn(() => mockPipeline),
  zrevrange: jest.fn(),
};

const mockPrisma = {
  salespersonProfile: { findMany: jest.fn() },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal profile object returned by Prisma. */
function makeProfile(id: string, overrides: Partial<{ name: string; rank: string; totalPoints: number; photoUrl: string | null; publicSlug: string }> = {}) {
  return {
    id,
    publicSlug: overrides.publicSlug ?? `slug-${id}`,
    rank: overrides.rank ?? 'BRONZE',
    totalPoints: overrides.totalPoints ?? 100,
    user: {
      name: overrides.name ?? `User ${id}`,
      photoUrl: overrides.photoUrl ?? null,
    },
  };
}

/** Build a raw zrevrange WITHSCORES array. */
function makeRaw(pairs: Array<[string, number]>): string[] {
  return pairs.flatMap(([id, score]) => [id, String(score)]);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LeaderboardsService,
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(LeaderboardsService);
    jest.clearAllMocks();
    // Restore default resolved values cleared by clearAllMocks
    mockPipeline.exec.mockResolvedValue([]);
    mockPipeline.zincrby.mockReturnThis();
    mockPipeline.expire.mockReturnThis();
    mockRedis.pipeline.mockReturnValue(mockPipeline);
  });

  // -------------------------------------------------------------------------
  // recordScore
  // -------------------------------------------------------------------------

  describe('recordScore', () => {
    it('1. returns early without touching the pipeline when delta = 0', async () => {
      await service.recordScore('sp-1', 0, 'tech-sales');
      expect(mockRedis.pipeline).not.toHaveBeenCalled();
      expect(mockPipeline.zincrby).not.toHaveBeenCalled();
      expect(mockPipeline.exec).not.toHaveBeenCalled();
    });

    it('2. calls pipeline.zincrby for 4 periods × 2 scopes = 8 keys when delta > 0', async () => {
      await service.recordScore('sp-2', 10, 'it-sales');
      // 4 periods × 2 scopes (global + category)
      expect(mockPipeline.zincrby).toHaveBeenCalledTimes(8);
    });

    it('3. calls pipeline.expire for 3 time-bounded periods; NOT for all-time', async () => {
      await service.recordScore('sp-3', 5, 'pharma');
      // daily, weekly, monthly each have 2 scopes → 6 expire calls; all-time has none
      expect(mockPipeline.expire).toHaveBeenCalledTimes(6);

      // Verify no expire call references an all-time key
      const expireKeys: string[] = mockPipeline.expire.mock.calls.map((c: any[]) => c[0] as string);
      expect(expireKeys.every((k) => !k.includes('all-time'))).toBe(true);
    });

    it('4. pipeline.exec is called exactly once', async () => {
      await service.recordScore('sp-4', 20, 'banking');
      expect(mockPipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('5. Redis failure (exec rejects) is swallowed — does not propagate', async () => {
      mockPipeline.exec.mockRejectedValueOnce(new Error('Redis connection lost'));
      await expect(service.recordScore('sp-5', 15, 'fintech')).resolves.toBeUndefined();
    });

    it('2b. zincrby keys include both global scope (g) and category scope (c:xxx)', async () => {
      await service.recordScore('sp-6', 7, 'IT Sales');
      const keys: string[] = mockPipeline.zincrby.mock.calls.map((c: any[]) => c[0] as string);
      const globalKeys = keys.filter((k) => k.endsWith(':g'));
      const categoryKeys = keys.filter((k) => k.includes(':c:'));
      expect(globalKeys).toHaveLength(4); // 4 periods
      expect(categoryKeys).toHaveLength(4); // 4 periods
    });

    it('2c. category is normalized before building the scope key', async () => {
      await service.recordScore('sp-7', 3, 'IT Sales');
      const keys: string[] = mockPipeline.zincrby.mock.calls.map((c: any[]) => c[0] as string);
      // "IT Sales" should normalize to "it-sales"
      expect(keys.some((k) => k.includes('c:it-sales'))).toBe(true);
      expect(keys.some((k) => k.includes('c:IT Sales'))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // list
  // -------------------------------------------------------------------------

  describe('list', () => {
    it('6. uses global scope key (ending :g) when category is undefined', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce([]);
      await service.list('all-time', undefined, 10);
      const calledKey: string = mockRedis.zrevrange.mock.calls[0][0];
      expect(calledKey).toMatch(/:g$/);
    });

    it('7. uses category scope key (c:xxx) when category is provided', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce([]);
      await service.list('all-time', 'fintech', 10);
      const calledKey: string = mockRedis.zrevrange.mock.calls[0][0];
      expect(calledKey).toMatch(/:c:fintech$/);
    });

    it('8. category is normalized: lowercase + special chars → hyphens ("IT Sales" → "it-sales")', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce([]);
      await service.list('all-time', 'IT Sales', 10);
      const calledKey: string = mockRedis.zrevrange.mock.calls[0][0];
      expect(calledKey).toContain('c:it-sales');
    });

    it('9. empty zrevrange → returns { entries: [] }', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce([]);
      const result = await service.list('daily', undefined, 10);
      expect(result.entries).toEqual([]);
    });

    it('10. Redis zrevrange failure → returns { entries: [] } without throwing', async () => {
      mockRedis.zrevrange.mockRejectedValueOnce(new Error('timeout'));
      await expect(service.list('weekly', undefined, 10)).resolves.toMatchObject({ entries: [] });
    });

    it('11. pairs WITHSCORES correctly: raw[0]=id, raw[1]=score, raw[2]=id2, raw[3]=score2', async () => {
      const raw = makeRaw([['sp-a', 200], ['sp-b', 150]]);
      mockRedis.zrevrange.mockResolvedValueOnce(raw);
      mockPrisma.salespersonProfile.findMany.mockResolvedValueOnce([
        makeProfile('sp-a', { totalPoints: 200 }),
        makeProfile('sp-b', { totalPoints: 150 }),
      ]);

      const result = await service.list('all-time', undefined, 10);
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].score).toBe(200);
      expect(result.entries[1].score).toBe(150);
    });

    it('12. hydrates from Prisma: entry includes name, rank, totalPoints, photoUrl, publicSlug, position', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce(makeRaw([['sp-x', 500]]));
      mockPrisma.salespersonProfile.findMany.mockResolvedValueOnce([
        makeProfile('sp-x', {
          name: 'Riya Sharma',
          rank: 'SILVER',
          totalPoints: 1200,
          photoUrl: 'https://cdn.example.com/riya.jpg',
          publicSlug: 'riya-sharma',
        }),
      ]);

      const result = await service.list('monthly', undefined, 10);
      expect(result.entries).toHaveLength(1);
      const entry = result.entries[0];
      expect(entry.position).toBe(1);
      expect(entry.score).toBe(500);
      expect(entry.salesperson.name).toBe('Riya Sharma');
      expect(entry.salesperson.rank).toBe('SILVER');
      expect(entry.salesperson.totalPoints).toBe(1200);
      expect(entry.salesperson.photoUrl).toBe('https://cdn.example.com/riya.jpg');
      expect(entry.salesperson.publicSlug).toBe('riya-sharma');
    });

    it('13. filters out salespersonIds not found in Prisma (missing profile → entry omitted)', async () => {
      // 3 entries in Redis, but only 2 in the DB
      mockRedis.zrevrange.mockResolvedValueOnce(
        makeRaw([['sp-1', 300], ['sp-ghost', 200], ['sp-2', 100]]),
      );
      mockPrisma.salespersonProfile.findMany.mockResolvedValueOnce([
        makeProfile('sp-1'),
        makeProfile('sp-2'),
        // sp-ghost intentionally missing
      ]);

      const result = await service.list('all-time', undefined, 10);
      expect(result.entries).toHaveLength(2);
      const ids = result.entries.map((e: any) => e.salesperson.publicSlug);
      expect(ids).not.toContain('slug-sp-ghost');
    });

    it('14. results are in rank order (position 1, 2, 3…)', async () => {
      mockRedis.zrevrange.mockResolvedValueOnce(
        makeRaw([['sp-a', 900], ['sp-b', 600], ['sp-c', 300]]),
      );
      mockPrisma.salespersonProfile.findMany.mockResolvedValueOnce([
        makeProfile('sp-a'),
        makeProfile('sp-b'),
        makeProfile('sp-c'),
      ]);

      const result = await service.list('all-time', undefined, 10);
      expect(result.entries.map((e: any) => e.position)).toEqual([1, 2, 3]);
      expect(result.entries.map((e: any) => e.score)).toEqual([900, 600, 300]);
    });
  });

  // -------------------------------------------------------------------------
  // keyFor (private — accessed via cast)
  // -------------------------------------------------------------------------

  describe('keyFor (private)', () => {
    const svc = () => service as any;

    it('15. keyFor("daily", ...) includes the current IST date string (YYYY-MM-DD)', () => {
      // We freeze "now" to a known UTC time: 2026-01-15T20:00:00Z → IST 2026-01-16 01:30
      const now = new Date('2026-01-15T20:00:00.000Z');
      const key: string = svc().keyFor('daily', 'g', now);
      // IST = UTC + 5:30 → 2026-01-16
      expect(key).toContain('2026-01-16');
      expect(key).toMatch(/^closdex:lb:daily:\d{4}-\d{2}-\d{2}:g$/);
    });

    it('16. keyFor("all-time", "g", ...) produces stable key with no date suffix', () => {
      const key: string = svc().keyFor('all-time', 'g', new Date());
      expect(key).toBe('closdex:lb:all-time:g');
    });

    it('16b. keyFor("all-time", "c:fintech", ...) produces stable category key', () => {
      const key: string = svc().keyFor('all-time', 'c:fintech', new Date());
      expect(key).toBe('closdex:lb:all-time:c:fintech');
    });

    it('16c. keyFor("monthly", ...) includes YYYY-MM', () => {
      const now = new Date('2026-03-10T00:00:00.000Z');
      const key: string = svc().keyFor('monthly', 'g', now);
      expect(key).toMatch(/closdex:lb:monthly:\d{4}-\d{2}:g/);
    });

    it('16d. keyFor("weekly", ...) includes YYYY-Www', () => {
      const now = new Date('2026-03-10T00:00:00.000Z');
      const key: string = svc().keyFor('weekly', 'g', now);
      expect(key).toMatch(/closdex:lb:weekly:\d{4}-W\d{2}:g/);
    });
  });

  // -------------------------------------------------------------------------
  // normalizeCategory (private)
  // -------------------------------------------------------------------------

  describe('normalizeCategory (private)', () => {
    const norm = (c: string) => (service as any).normalizeCategory(c);

    it('17a. "IT Sales" → "it-sales"', () => {
      expect(norm('IT Sales')).toBe('it-sales');
    });

    it('17b. empty string → "misc"', () => {
      expect(norm('')).toBe('misc');
    });

    it('17c. preserves alphanumeric and collapses multiple separators', () => {
      expect(norm('Pharma & Healthcare')).toBe('pharma-healthcare');
    });

    it('17d. strips leading/trailing hyphens', () => {
      expect(norm('---tech---')).toBe('tech');
    });

    it('17e. all non-alphanumeric → "misc"', () => {
      expect(norm('!!!---!!!')).toBe('misc');
    });

    it('17f. already normalized string is unchanged', () => {
      expect(norm('fintech')).toBe('fintech');
    });
  });
});
