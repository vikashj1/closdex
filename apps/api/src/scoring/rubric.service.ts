import { Injectable } from '@nestjs/common';

export interface ScoringRules {
  speedBonusPct: number;
  firstTryBonusPct: number;
  streakBonusPerDay: number;
  streakBonusCap: number;
  difficultyJumpBonusPct: number;
  spamPenalty: number;
  lyingPenalty: number;
  abandonmentPenalty: number;
  repeatAttemptDecay: number;
  goalNotAchievedPartial: number;
}

export interface QualityDims {
  discoveryListening: number;
  objectionHandling: number;
  valueArticulation: number;
  conversationalQuality: number;
  goalExecution: number;
}

export interface RubricInputs {
  basePoints: number;
  goalMultiplier: number;
  qualityDims: QualityDims;
  goalAchieved: boolean;
  messagesUsed: number;
  maxMessages: number;
  attemptNumber: number;
  streakDays: number;
  /** How many tiers above the salesperson's rank-unlocked ceiling the challenge is. */
  difficultyTierDelta: number;
  flags: { spam: boolean; lying: boolean; abandoned: boolean };
  rules: ScoringRules;
}

export interface ScoreLineItem {
  reason: string;
  points: number;
}

export interface ScoreBreakdown {
  qualityMultiplier: number;
  baseScore: number;
  bonuses: ScoreLineItem[];
  penalties: ScoreLineItem[];
  decayMultiplier: number;
  preDecayPositive: number;
  total: number;
}

/** Pure rubric math. Mirrors SOW §6.3 exactly. */
@Injectable()
export class RubricService {
  compute(input: RubricInputs): ScoreBreakdown {
    const {
      basePoints, goalMultiplier, qualityDims, goalAchieved, messagesUsed,
      maxMessages, attemptNumber, streakDays, difficultyTierDelta, flags, rules,
    } = input;

    const dimSum =
      qualityDims.discoveryListening +
      qualityDims.objectionHandling +
      qualityDims.valueArticulation +
      qualityDims.conversationalQuality +
      qualityDims.goalExecution;
    const qualityMultiplier = Math.max(0, Math.min(1, dimSum / 25));

    let baseScore: number;
    if (flags.abandoned) {
      baseScore = 0;
    } else if (goalAchieved) {
      baseScore = basePoints * goalMultiplier * qualityMultiplier;
    } else {
      baseScore = basePoints * qualityMultiplier * rules.goalNotAchievedPartial;
    }

    const bonuses: ScoreLineItem[] = [];
    if (goalAchieved && !flags.abandoned) {
      if (maxMessages > 0 && messagesUsed < 0.6 * maxMessages) {
        bonuses.push({ reason: 'SPEED_BONUS', points: basePoints * rules.speedBonusPct });
      }
      if (attemptNumber === 1) {
        bonuses.push({ reason: 'FIRST_TRY_BONUS', points: basePoints * rules.firstTryBonusPct });
      }
      if (difficultyTierDelta >= 2) {
        bonuses.push({ reason: 'DIFFICULTY_JUMP_BONUS', points: basePoints * rules.difficultyJumpBonusPct });
      }
    }
    if (!flags.abandoned && streakDays > 0) {
      bonuses.push({
        reason: 'STREAK_BONUS',
        points: Math.min(streakDays * rules.streakBonusPerDay, rules.streakBonusCap),
      });
    }

    const penalties: ScoreLineItem[] = [];
    if (flags.spam) penalties.push({ reason: 'SPAM_PENALTY', points: rules.spamPenalty });
    if (flags.lying) penalties.push({ reason: 'LYING_PENALTY', points: rules.lyingPenalty });
    if (flags.abandoned) penalties.push({ reason: 'ABANDONMENT_PENALTY', points: rules.abandonmentPenalty });

    const sumBonuses = bonuses.reduce((s, b) => s + b.points, 0);
    const sumPenalties = penalties.reduce((s, p) => s + p.points, 0);

    // Repeat-attempt decay applies to earnings (base + bonuses) only — not to penalties,
    // otherwise spam/lying disincentives would soften on retries (opposite of intent).
    const decayMultiplier = Math.pow(rules.repeatAttemptDecay, Math.max(0, attemptNumber - 1));
    const positive = baseScore + sumBonuses;
    const total = Math.round(positive * decayMultiplier + sumPenalties);

    return {
      qualityMultiplier,
      baseScore: Math.round(baseScore),
      bonuses: bonuses.map((b) => ({ ...b, points: Math.round(b.points) })),
      penalties: penalties.map((p) => ({ ...p, points: Math.round(p.points) })),
      decayMultiplier,
      preDecayPositive: Math.round(positive),
      total,
    };
  }
}
