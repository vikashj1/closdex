import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogInput {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/** Fire-and-forget usage logger for LLM calls. Never throws — logging
 *  failures must not affect user-facing behaviour. */
@Injectable()
export class LlmUsageService {
  private readonly logger = new Logger(LlmUsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  log(input: LogInput): void {
    void this.prisma.llmUsageLog
      .create({ data: input })
      .catch((err) => this.logger.warn(`LlmUsageLog write failed: ${(err as Error).message}`));
  }

  /** Aggregation for the admin panel. Returns totals + per-day + per-model
   *  breakdowns for the last `days` (default 7). Bucket start-of-day in UTC. */
  async summary(days = 7) {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.prisma.llmUsageLog.findMany({
      where: { createdAt: { gte: from } },
      select: {
        provider: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        latencyMs: true,
        createdAt: true,
      },
    });

    const totals = rows.reduce(
      (acc, r) => ({
        calls: acc.calls + 1,
        inputTokens: acc.inputTokens + r.inputTokens,
        outputTokens: acc.outputTokens + r.outputTokens,
        totalLatencyMs: acc.totalLatencyMs + r.latencyMs,
      }),
      { calls: 0, inputTokens: 0, outputTokens: 0, totalLatencyMs: 0 },
    );

    const byModel = groupBy(rows, (r) => `${r.provider}/${r.model}`);
    const byDay = groupBy(rows, (r) => r.createdAt.toISOString().slice(0, 10));

    return {
      windowDays: days,
      totals: {
        ...totals,
        avgLatencyMs: totals.calls > 0 ? Math.round(totals.totalLatencyMs / totals.calls) : 0,
      },
      byModel: Object.entries(byModel).map(([k, list]) => ({
        model: k,
        calls: list.length,
        inputTokens: sumBy(list, 'inputTokens'),
        outputTokens: sumBy(list, 'outputTokens'),
        avgLatencyMs: list.length > 0 ? Math.round(sumBy(list, 'latencyMs') / list.length) : 0,
      })).sort((a, b) => b.calls - a.calls),
      byDay: Object.entries(byDay).map(([day, list]) => ({
        day,
        calls: list.length,
        inputTokens: sumBy(list, 'inputTokens'),
        outputTokens: sumBy(list, 'outputTokens'),
      })).sort((a, b) => (a.day > b.day ? 1 : -1)),
    };
  }
}

function groupBy<T, K extends string>(items: T[], key: (it: T) => K): Record<K, T[]> {
  const acc = {} as Record<K, T[]>;
  for (const it of items) {
    const k = key(it);
    if (!acc[k]) acc[k] = [];
    acc[k].push(it);
  }
  return acc;
}
function sumBy<T>(items: T[], key: keyof T): number {
  let s = 0;
  for (const it of items) s += Number(it[key] ?? 0);
  return s;
}
