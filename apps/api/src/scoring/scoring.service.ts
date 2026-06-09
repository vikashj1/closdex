import { Injectable, Logger } from '@nestjs/common';
import {
  AttemptStatus, DifficultyTier, PointsReason, Prisma, Rank,
} from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { RubricService, QualityDims, ScoreBreakdown, ScoringRules } from './rubric.service';
import { AiEvaluatorService, AiEvaluation } from './ai-evaluator.service';
import { MessageClientMeta, SuspicionService } from './suspicion.service';

const DIFFICULTY_ORDER: DifficultyTier[] = [
  DifficultyTier.ROOKIE, DifficultyTier.EASY, DifficultyTier.MEDIUM,
  DifficultyTier.HARD, DifficultyTier.EXPERT,
];

/** Highest DifficultyTier normally unlocked by a given Rank.
 *  Per SOW T6 privileges: Rookie→Easy, Bronze→Medium, Silver→Hard, Gold+→Expert. */
const RANK_DIFFICULTY_UNLOCK: Record<Rank, DifficultyTier> = {
  ROOKIE: DifficultyTier.EASY,
  BRONZE: DifficultyTier.MEDIUM,
  SILVER: DifficultyTier.HARD,
  GOLD: DifficultyTier.EXPERT,
  PLATINUM: DifficultyTier.EXPERT,
  DIAMOND: DifficultyTier.EXPERT,
  MASTER: DifficultyTier.EXPERT,
  GRANDMASTER: DifficultyTier.EXPERT,
};

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rubric: RubricService,
    private readonly aiEvaluator: AiEvaluatorService,
    private readonly leaderboards: LeaderboardsService,
    private readonly suspicion: SuspicionService,
  ) {}

  /** Idempotent. Skips if attempt is still in progress or already scored. */
  async scoreAttempt(attemptId: string): Promise<void> {
    const attempt = await this.prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: {
        challenge: { include: { persona: true } },
        conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
        salesperson: true,
      },
    });
    if (!attempt) {
      this.logger.warn(`Attempt ${attemptId} not found`);
      return;
    }
    if (attempt.status === AttemptStatus.IN_PROGRESS) return;
    if (attempt.finalScore !== null) {
      this.logger.warn(`Attempt ${attemptId} already scored — skipping`);
      return;
    }

    const [tierConfig, goalConfig, rankConfigs, ruleRows] = await Promise.all([
      this.prisma.difficultyTierConfig.findUnique({ where: { tier: attempt.challenge.difficulty } }),
      this.prisma.goalTypeConfig.findUnique({ where: { goalType: attempt.challenge.goalType } }),
      this.prisma.rankConfig.findMany({ orderBy: { minPoints: 'asc' } }),
      this.prisma.scoringRuleConfig.findMany(),
    ]);
    if (!tierConfig || !goalConfig) {
      this.logger.error(`Missing tier/goal config for attempt ${attemptId} — seed not loaded?`);
      return;
    }

    const rules = this.rulesFromRows(ruleRows);
    const abandoned = attempt.status === AttemptStatus.ABANDONED;

    const evaluation: AiEvaluation | null = abandoned
      ? null
      : await this.aiEvaluator.evaluate({
          personaName: attempt.challenge.persona.name,
          goalDescription: attempt.challenge.goalDescription,
          messages: attempt.conversation?.messages ?? [],
        });

    const streakDays = await this.updateStreak(attempt.salespersonId);

    const unlockCeiling = RANK_DIFFICULTY_UNLOCK[attempt.salesperson.rank];
    const difficultyTierDelta =
      DIFFICULTY_ORDER.indexOf(attempt.challenge.difficulty) -
      DIFFICULTY_ORDER.indexOf(unlockCeiling);

    const breakdown = this.rubric.compute({
      basePoints: tierConfig.basePoints,
      goalMultiplier: goalConfig.multiplier,
      qualityDims: evaluation?.qualityDims ?? {
        discoveryListening: 0, objectionHandling: 0, valueArticulation: 0,
        conversationalQuality: 0, goalExecution: 0,
      },
      goalAchieved: evaluation?.goalAchieved ?? false,
      messagesUsed: attempt.messagesUsed,
      maxMessages: attempt.challenge.maxMessages,
      attemptNumber: attempt.attemptNumber,
      streakDays,
      difficultyTierDelta,
      flags: {
        spam: evaluation?.spamDetected ?? false,
        lying: evaluation?.lyingDetected ?? false,
        abandoned,
      },
      rules,
    });

    // Anti-cheat: aggregate suspicion telemetry across SALESPERSON messages.
    // Quarantined attempts get a finalScore (for admin review) but don't credit
    // points or touch the leaderboard until an admin clears them.
    const salespersonMessages = (attempt.conversation?.messages ?? []).filter(
      (m) => m.sender === 'SALESPERSON',
    );
    const suspicion = this.suspicion.compute(
      salespersonMessages.map((m) => ({ clientMeta: (m as any).clientMeta as MessageClientMeta | null })),
    );

    await this.persistScore(
      attempt.id,
      attempt.salespersonId,
      breakdown,
      evaluation?.notes ?? null,
      evaluation?.qualityDims ?? null,
      suspicion,
    );

    if (suspicion.quarantined) {
      this.logger.warn(
        `Attempt ${attemptId} quarantined (suspicionScore=${suspicion.score}) — leaderboard + points withheld`,
      );
      return;
    }

    await this.recomputeRank(attempt.salespersonId, rankConfigs);

    // Update Redis leaderboards last — failures are logged inside, never thrown
    // (Postgres is source of truth; leaderboards are a read-optimized projection).
    await this.leaderboards.recordScore(
      attempt.salespersonId,
      breakdown.total,
      attempt.challenge.category,
    );
  }

  private rulesFromRows(rows: Array<{ key: string; value: number }>): ScoringRules {
    const m = new Map(rows.map((r) => [r.key, r.value]));
    const g = (k: string, d: number) => m.get(k) ?? d;
    return {
      speedBonusPct: g('speed_bonus_pct', 0.10),
      firstTryBonusPct: g('first_try_bonus_pct', 0.15),
      streakBonusPerDay: g('streak_bonus_per_day', 5),
      streakBonusCap: g('streak_bonus_cap', 50),
      difficultyJumpBonusPct: g('difficulty_jump_bonus_pct', 0.20),
      spamPenalty: g('spam_penalty', -50),
      lyingPenalty: g('lying_penalty', -100),
      abandonmentPenalty: g('abandonment_penalty', -25),
      repeatAttemptDecay: g('repeat_attempt_decay', 0.70),
      goalNotAchievedPartial: g('goal_not_achieved_partial', 0.40),
    };
  }

  /** Updates SalespersonProfile.currentStreakDays/lastChallengeDate and returns new streak. */
  private async updateStreak(salespersonId: string): Promise<number> {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { id: salespersonId } });
    if (!profile) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let next = 1;
    if (profile.lastChallengeDate) {
      const last = new Date(profile.lastChallengeDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (24 * 3600 * 1000));
      if (diffDays === 0) next = profile.currentStreakDays;
      else if (diffDays === 1) next = profile.currentStreakDays + 1;
      else next = 1;
    }

    await this.prisma.salespersonProfile.update({
      where: { id: salespersonId },
      data: { currentStreakDays: next, lastChallengeDate: today },
    });
    return next;
  }

  private async persistScore(
    attemptId: string,
    salespersonId: string,
    breakdown: ScoreBreakdown,
    notes: string | null,
    qualityDims: QualityDims | null,
    suspicion: { score: number; quarantined: boolean; flags: object },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.challengeAttempt.update({
        where: { id: attemptId },
        data: {
          finalScore: breakdown.total,
          scoreBreakdown: { ...breakdown, notes, qualityDims } as unknown as Prisma.InputJsonValue,
          suspicionScore: suspicion.score,
          quarantined: suspicion.quarantined,
          suspicionFlags: suspicion.flags as unknown as Prisma.InputJsonValue,
        },
      });

      // Quarantined attempts skip all points + leaderboard side-effects. The
      // finalScore stays on the row so admins can review what the legitimate
      // outcome would have been before deciding to un-quarantine.
      if (suspicion.quarantined) return;

      if (breakdown.baseScore !== 0) {
        await tx.pointsTransaction.create({
          data: {
            salespersonId, attemptId,
            reason: PointsReason.CHALLENGE_SCORE,
            points: breakdown.baseScore,
          },
        });
      }
      for (const b of breakdown.bonuses) {
        await tx.pointsTransaction.create({
          data: { salespersonId, attemptId, reason: this.reasonFor(b.reason), points: b.points },
        });
      }
      for (const p of breakdown.penalties) {
        await tx.pointsTransaction.create({
          data: { salespersonId, attemptId, reason: this.reasonFor(p.reason), points: p.points },
        });
      }

      // Clamp totalPoints at 0 — net-negative attempts can't drag a salesperson below zero.
      const profile = await tx.salespersonProfile.findUnique({ where: { id: salespersonId } });
      if (profile) {
        await tx.salespersonProfile.update({
          where: { id: salespersonId },
          data: { totalPoints: Math.max(0, profile.totalPoints + breakdown.total) },
        });
      }
    });
  }

  private reasonFor(s: string): PointsReason {
    switch (s) {
      case 'SPEED_BONUS': return PointsReason.SPEED_BONUS;
      case 'FIRST_TRY_BONUS': return PointsReason.FIRST_TRY_BONUS;
      case 'STREAK_BONUS': return PointsReason.STREAK_BONUS;
      case 'DIFFICULTY_JUMP_BONUS': return PointsReason.DIFFICULTY_JUMP_BONUS;
      case 'SPAM_PENALTY': return PointsReason.SPAM_PENALTY;
      case 'LYING_PENALTY': return PointsReason.LYING_PENALTY;
      case 'ABANDONMENT_PENALTY': return PointsReason.ABANDONMENT_PENALTY;
      default: return PointsReason.ADMIN_ADJUSTMENT;
    }
  }

  /** Rank never decays (SOW §6.5) — only promotes upward. */
  private async recomputeRank(
    salespersonId: string,
    rankConfigs: Array<{ rank: Rank; minPoints: number; maxPoints: number | null }>,
  ): Promise<void> {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { id: salespersonId } });
    if (!profile) return;

    let newRank: Rank = Rank.ROOKIE;
    for (const c of rankConfigs) {
      if (profile.totalPoints >= c.minPoints) newRank = c.rank;
    }

    const currentIdx = rankConfigs.findIndex((c) => c.rank === profile.rank);
    const newIdx = rankConfigs.findIndex((c) => c.rank === newRank);
    if (newIdx > currentIdx) {
      await this.prisma.salespersonProfile.update({
        where: { id: salespersonId },
        data: { rank: newRank },
      });
    }
  }
}
