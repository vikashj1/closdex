import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';
import { Period } from './dto/list-leaderboard.dto';

// SOW §6.6 — resets in IST. We compute period buckets in IST so the keys rotate
// at the wall-clock boundaries the spec describes (00:00 IST daily, Mon for weekly, 1st for monthly).
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toIST(d: Date): Date {
  return new Date(d.getTime() + IST_OFFSET_MS);
}

function dailyKey(d: Date): string {
  return toIST(d).toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthlyKey(d: Date): string {
  return toIST(d).toISOString().slice(0, 7); // YYYY-MM
}

function isoWeek(d: Date): { year: number; week: number } {
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = u.getUTCDay() || 7;
  u.setUTCDate(u.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((u.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { year: u.getUTCFullYear(), week };
}

function weeklyKey(d: Date): string {
  const { year, week } = isoWeek(toIST(d));
  return `${year}-W${String(week).padStart(2, '0')}`;
}

@Injectable()
export class LeaderboardsService {
  private readonly logger = new Logger(LeaderboardsService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly prisma: PrismaService,
  ) {}

  /** Called from ScoringService after a score is persisted. Best-effort: Redis failure
   *  is logged but doesn't throw — Postgres is the source of truth, leaderboards are
   *  the read-optimized projection. */
  async recordScore(salespersonId: string, delta: number, category: string): Promise<void> {
    if (delta === 0) return;
    const now = new Date();
    const scopes = ['g', `c:${this.normalizeCategory(category)}`];
    const periods: Array<{ key: string; ttlSec: number | null }> = [
      { key: `daily:${dailyKey(now)}`, ttlSec: 48 * 3600 },
      { key: `weekly:${weeklyKey(now)}`, ttlSec: 14 * 24 * 3600 },
      { key: `monthly:${monthlyKey(now)}`, ttlSec: 60 * 24 * 3600 },
      { key: `all-time`, ttlSec: null },
    ];

    try {
      const pipe = this.redis.pipeline();
      for (const period of periods) {
        for (const scope of scopes) {
          const key = `closdex:lb:${period.key}:${scope}`;
          pipe.zincrby(key, delta, salespersonId);
          if (period.ttlSec) pipe.expire(key, period.ttlSec);
        }
      }
      await pipe.exec();
    } catch (err) {
      this.logger.error(`Leaderboard update failed for ${salespersonId}: ${err}`);
    }
  }

  async list(period: Period, category: string | undefined, limit: number) {
    // For "all-time" the source of truth is Postgres `totalPoints`. Redis can
    // drift whenever points are reset / disputed / manually adjusted — the
    // recordScore path is incremental only and never reconciles. So we
    // project all-time directly from Postgres to avoid showing stale Redis
    // values after admin intervention. Time-bounded periods (daily/weekly/
    // monthly) keep their Redis path because their keys have TTLs and any
    // drift heals naturally at the next bucket rollover.
    if (period === 'all-time' && !category) {
      const profiles = await this.prisma.salespersonProfile.findMany({
        orderBy: [{ totalPoints: 'desc' }, { id: 'asc' }],
        take: limit,
        select: {
          id: true,
          publicSlug: true,
          rank: true,
          totalPoints: true,
          user: { select: { name: true, photoUrl: true } },
        },
      });
      return {
        period,
        category: null,
        entries: profiles.map((p, i) => ({
          position: i + 1,
          score: p.totalPoints,
          salesperson: {
            publicSlug: p.publicSlug,
            name: p.user.name,
            photoUrl: p.user.photoUrl,
            rank: p.rank,
            totalPoints: p.totalPoints,
          },
        })),
      };
    }

    const scope = category ? `c:${this.normalizeCategory(category)}` : 'g';
    const key = this.keyFor(period, scope, new Date());

    let raw: string[];
    try {
      raw = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    } catch (err) {
      this.logger.error(`Leaderboard read failed for ${key}: ${err}`);
      return { period, category: category ?? null, entries: [] };
    }

    const pairs: Array<{ salespersonId: string; score: number }> = [];
    for (let i = 0; i < raw.length; i += 2) {
      pairs.push({ salespersonId: raw[i], score: Math.round(Number(raw[i + 1])) });
    }
    if (pairs.length === 0) return { period, category: category ?? null, entries: [] };

    const profiles = await this.prisma.salespersonProfile.findMany({
      where: { id: { in: pairs.map((p) => p.salespersonId) } },
      select: {
        id: true,
        publicSlug: true,
        rank: true,
        totalPoints: true,
        user: { select: { name: true, photoUrl: true } },
      },
    });
    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    return {
      period,
      category: category ?? null,
      entries: pairs
        .map((p, i) => {
          const profile = profileMap.get(p.salespersonId);
          if (!profile) return null;
          return {
            position: i + 1,
            score: p.score,
            salesperson: {
              publicSlug: profile.publicSlug,
              name: profile.user.name,
              photoUrl: profile.user.photoUrl,
              rank: profile.rank,
              totalPoints: profile.totalPoints,
            },
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null),
    };
  }

  private keyFor(period: Period, scope: string, now: Date): string {
    switch (period) {
      case 'daily': return `closdex:lb:daily:${dailyKey(now)}:${scope}`;
      case 'weekly': return `closdex:lb:weekly:${weeklyKey(now)}:${scope}`;
      case 'monthly': return `closdex:lb:monthly:${monthlyKey(now)}:${scope}`;
      case 'all-time': return `closdex:lb:all-time:${scope}`;
    }
  }

  private normalizeCategory(c: string): string {
    return c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'misc';
  }
}
