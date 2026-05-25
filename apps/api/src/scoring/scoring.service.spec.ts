import { AttemptStatus, DifficultyTier, PointsReason, Rank } from '@closdex/db';
import { ScoringService } from './scoring.service';
import { ScoreBreakdown } from './rubric.service';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

// Declare shape first, then assign — avoids TS7022 circular-reference error.
type MockPrisma = {
  challengeAttempt: { findUnique: jest.Mock; update: jest.Mock };
  salespersonProfile: { findUnique: jest.Mock; update: jest.Mock };
  difficultyTierConfig: { findUnique: jest.Mock };
  goalTypeConfig: { findUnique: jest.Mock };
  rankConfig: { findMany: jest.Mock };
  scoringRuleConfig: { findMany: jest.Mock };
  pointsTransaction: { create: jest.Mock };
  $transaction: jest.Mock;
};

const mockPrisma: MockPrisma = {
  challengeAttempt: { findUnique: jest.fn(), update: jest.fn() },
  salespersonProfile: { findUnique: jest.fn(), update: jest.fn() },
  difficultyTierConfig: { findUnique: jest.fn() },
  goalTypeConfig: { findUnique: jest.fn() },
  rankConfig: { findMany: jest.fn() },
  scoringRuleConfig: { findMany: jest.fn() },
  pointsTransaction: { create: jest.fn() },
  $transaction: jest.fn(async (fn: (tx: MockPrisma) => Promise<void>) => fn(mockPrisma)),
};

const mockRubric = { compute: jest.fn() };
const mockAiEvaluator = { evaluate: jest.fn() };
const mockLeaderboards = { recordScore: jest.fn() };

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const ZERO_DIMS = {
  discoveryListening: 0,
  objectionHandling: 0,
  valueArticulation: 0,
  conversationalQuality: 0,
  goalExecution: 0,
};

const PERFECT_EVALUATION = {
  qualityDims: {
    discoveryListening: 5,
    objectionHandling: 5,
    valueArticulation: 5,
    conversationalQuality: 5,
    goalExecution: 5,
  },
  goalAchieved: true,
  spamDetected: false,
  lyingDetected: false,
  notes: 'Great call',
};

const DEFAULT_BREAKDOWN: ScoreBreakdown = {
  qualityMultiplier: 1,
  baseScore: 480,
  bonuses: [],
  penalties: [],
  decayMultiplier: 1,
  preDecayPositive: 480,
  total: 480,
};

const RANK_CONFIGS = [
  { rank: Rank.ROOKIE, minPoints: 0, maxPoints: 499 },
  { rank: Rank.BRONZE, minPoints: 500, maxPoints: 1499 },
  { rank: Rank.SILVER, minPoints: 1500, maxPoints: 2999 },
  { rank: Rank.GOLD, minPoints: 3000, maxPoints: null },
];

const RULE_ROWS: Array<{ key: string; value: number }> = []; // uses defaults

function makeAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: 'attempt-1',
    salespersonId: 'sp-1',
    status: AttemptStatus.COMPLETED,
    finalScore: null,
    messagesUsed: 10,
    attemptNumber: 1,
    challenge: {
      difficulty: DifficultyTier.EASY,
      goalType: 'COLD_OUTREACH',
      goalDescription: 'Book a demo',
      maxMessages: 25,
      category: 'OUTBOUND',
      persona: { name: 'Alex' },
    },
    conversation: { messages: [] },
    salesperson: { rank: Rank.ROOKIE },
    ...overrides,
  };
}

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sp-1',
    rank: Rank.ROOKIE,
    totalPoints: 100,
    currentStreakDays: 1,
    lastChallengeDate: null,
    ...overrides,
  };
}

function makeSvc() {
  return new ScoringService(
    mockPrisma as any,
    mockRubric as any,
    mockAiEvaluator as any,
    mockLeaderboards as any,
  );
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockRubric.compute.mockReturnValue(DEFAULT_BREAKDOWN);
  mockAiEvaluator.evaluate.mockResolvedValue(PERFECT_EVALUATION);
  mockLeaderboards.recordScore.mockResolvedValue(undefined);
  mockPrisma.difficultyTierConfig.findUnique.mockResolvedValue({ tier: DifficultyTier.EASY, basePoints: 400 });
  mockPrisma.goalTypeConfig.findUnique.mockResolvedValue({ goalType: 'COLD_OUTREACH', multiplier: 1.2 });
  mockPrisma.rankConfig.findMany.mockResolvedValue(RANK_CONFIGS);
  mockPrisma.scoringRuleConfig.findMany.mockResolvedValue(RULE_ROWS);
  mockPrisma.salespersonProfile.findUnique.mockResolvedValue(makeProfile());
  mockPrisma.salespersonProfile.update.mockResolvedValue({});
  mockPrisma.challengeAttempt.update.mockResolvedValue({});
  mockPrisma.pointsTransaction.create.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScoringService', () => {

  // ---- scoreAttempt skip conditions ----

  describe('scoreAttempt — skip conditions', () => {
    it('returns early if attempt not found', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(null);
      const svc = makeSvc();

      await svc.scoreAttempt('missing-id');

      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockAiEvaluator.evaluate).not.toHaveBeenCalled();
      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });

    it('returns early if attempt is IN_PROGRESS', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(
        makeAttempt({ status: AttemptStatus.IN_PROGRESS }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockAiEvaluator.evaluate).not.toHaveBeenCalled();
    });

    it('returns early if attempt already has a finalScore', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(
        makeAttempt({ finalScore: 200 }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });
  });

  // ---- scoreAttempt happy path ----

  describe('scoreAttempt — happy path', () => {
    it('calls aiEvaluator.evaluate for a COMPLETED attempt', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockAiEvaluator.evaluate).toHaveBeenCalledTimes(1);
      expect(mockAiEvaluator.evaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          personaName: 'Alex',
          goalDescription: 'Book a demo',
          messages: [],
        }),
      );
    });

    it('skips aiEvaluator.evaluate for an ABANDONED attempt and passes null dims to rubric', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(
        makeAttempt({ status: AttemptStatus.ABANDONED }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockAiEvaluator.evaluate).not.toHaveBeenCalled();
      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({
          qualityDims: ZERO_DIMS,
          goalAchieved: false,
          flags: expect.objectContaining({ abandoned: true }),
        }),
      );
    });

    it('propagates error when aiEvaluator.evaluate rejects (no silent swallow)', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      mockAiEvaluator.evaluate.mockRejectedValue(new Error('AI service unavailable'));
      const svc = makeSvc();

      await expect(svc.scoreAttempt('attempt-1')).rejects.toThrow('AI service unavailable');
      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockPrisma.salespersonProfile.update).not.toHaveBeenCalled();
    });

    it('calls rubric.compute with correct inputs derived from configs and attempt', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt({
        messagesUsed: 8,
        attemptNumber: 1,
      }));
      mockPrisma.difficultyTierConfig.findUnique.mockResolvedValue({ tier: DifficultyTier.EASY, basePoints: 400 });
      mockPrisma.goalTypeConfig.findUnique.mockResolvedValue({ goalType: 'COLD_OUTREACH', multiplier: 1.2 });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({
          basePoints: 400,
          goalMultiplier: 1.2,
          messagesUsed: 8,
          maxMessages: 25,
          attemptNumber: 1,
        }),
      );
    });

    it('calls leaderboards.recordScore after scoring with salespersonId, total, and category', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      mockRubric.compute.mockReturnValue({ ...DEFAULT_BREAKDOWN, total: 480 });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockLeaderboards.recordScore).toHaveBeenCalledTimes(1);
      expect(mockLeaderboards.recordScore).toHaveBeenCalledWith('sp-1', 480, 'OUTBOUND');
    });

    it('returns early and does not score when tierConfig is missing', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      mockPrisma.difficultyTierConfig.findUnique.mockResolvedValue(null);
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });

    it('returns early and does not score when goalConfig is missing', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      mockPrisma.goalTypeConfig.findUnique.mockResolvedValue(null);
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).not.toHaveBeenCalled();
      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });
  });

  // ---- updateStreak (exercised via scoreAttempt) ----

  describe('updateStreak — via scoreAttempt', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('first attempt (no lastChallengeDate) → streak = 1', async () => {
      jest.setSystemTime(new Date('2026-01-10T12:00:00Z'));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(
        makeProfile({ lastChallengeDate: null, currentStreakDays: 0 }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 1 }),
      );
    });

    it('same-day attempt → streak unchanged', async () => {
      jest.setSystemTime(new Date('2026-01-10T18:00:00Z'));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(
        makeProfile({
          lastChallengeDate: new Date('2026-01-10T09:00:00Z'),
          currentStreakDays: 5,
        }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 5 }),
      );
    });

    it('next-day attempt → streak incremented by 1', async () => {
      jest.setSystemTime(new Date('2026-01-11T08:00:00Z'));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(
        makeProfile({
          lastChallengeDate: new Date('2026-01-10T20:00:00Z'),
          currentStreakDays: 3,
        }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 4 }),
      );
    });

    it('gap > 1 day → streak resets to 1', async () => {
      jest.setSystemTime(new Date('2026-01-15T08:00:00Z'));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(
        makeProfile({
          lastChallengeDate: new Date('2026-01-10T20:00:00Z'),
          currentStreakDays: 7,
        }),
      );
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 1 }),
      );
    });
  });

  // ---- persistScore ----

  describe('persistScore — via scoreAttempt', () => {
    beforeEach(() => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
    });

    it('clamps totalPoints at 0 when net result would go negative', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(
        makeProfile({ totalPoints: 10 }),
      );
      mockRubric.compute.mockReturnValue({ ...DEFAULT_BREAKDOWN, total: -50 });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      // The update within $transaction should clamp: Math.max(0, 10 + (-50)) = 0
      expect(mockPrisma.salespersonProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalPoints: 0 }),
        }),
      );
    });

    it('creates a PointsTransaction for baseScore when non-zero', async () => {
      mockRubric.compute.mockReturnValue({
        ...DEFAULT_BREAKDOWN,
        baseScore: 480,
        bonuses: [],
        penalties: [],
        total: 480,
      });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockPrisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reason: PointsReason.CHALLENGE_SCORE,
            points: 480,
            salespersonId: 'sp-1',
            attemptId: 'attempt-1',
          }),
        }),
      );
    });

    it('does NOT create a PointsTransaction for baseScore when it is 0', async () => {
      mockRubric.compute.mockReturnValue({
        ...DEFAULT_BREAKDOWN,
        baseScore: 0,
        bonuses: [],
        penalties: [{ reason: 'ABANDONMENT_PENALTY', points: -25 }],
        total: -25,
      });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      const calls: Array<{ data: { reason: string } }> = mockPrisma.pointsTransaction.create.mock.calls.map(
        (c: unknown[]) => c[0] as { data: { reason: string } },
      );
      const hasChallengeScore = calls.some(
        (c) => c.data.reason === PointsReason.CHALLENGE_SCORE,
      );
      expect(hasChallengeScore).toBe(false);
    });

    it('creates a PointsTransaction for each bonus', async () => {
      mockRubric.compute.mockReturnValue({
        ...DEFAULT_BREAKDOWN,
        baseScore: 400,
        bonuses: [
          { reason: 'SPEED_BONUS', points: 40 },
          { reason: 'FIRST_TRY_BONUS', points: 60 },
        ],
        penalties: [],
        total: 500,
      });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockPrisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ reason: PointsReason.SPEED_BONUS, points: 40 }),
        }),
      );
      expect(mockPrisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ reason: PointsReason.FIRST_TRY_BONUS, points: 60 }),
        }),
      );
    });

    it('creates a PointsTransaction for each penalty', async () => {
      mockRubric.compute.mockReturnValue({
        ...DEFAULT_BREAKDOWN,
        baseScore: 400,
        bonuses: [],
        penalties: [
          { reason: 'SPAM_PENALTY', points: -50 },
          { reason: 'LYING_PENALTY', points: -100 },
        ],
        total: 250,
      });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockPrisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ reason: PointsReason.SPAM_PENALTY, points: -50 }),
        }),
      );
      expect(mockPrisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ reason: PointsReason.LYING_PENALTY, points: -100 }),
        }),
      );
    });
  });

  // ---- recomputeRank ----

  describe('recomputeRank — via scoreAttempt', () => {
    beforeEach(() => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
    });

    it('promotes rank when totalPoints crosses a threshold', async () => {
      // After scoring, totalPoints will be 100 + 480 = 580 → crosses BRONZE threshold (500)
      mockPrisma.salespersonProfile.findUnique
        .mockResolvedValueOnce(makeProfile({ totalPoints: 100, rank: Rank.ROOKIE })) // updateStreak call
        .mockResolvedValueOnce(makeProfile({ totalPoints: 100, rank: Rank.ROOKIE })) // persistScore inner find
        .mockResolvedValueOnce(makeProfile({ totalPoints: 580, rank: Rank.ROOKIE })); // recomputeRank find

      mockRubric.compute.mockReturnValue({ ...DEFAULT_BREAKDOWN, total: 480 });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      // recomputeRank should update rank to BRONZE
      expect(mockPrisma.salespersonProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rank: Rank.BRONZE }),
        }),
      );
    });

    it('does NOT downgrade rank even when totalPoints drops below current rank threshold', async () => {
      // Profile is SILVER (minPoints 1500) but totalPoints is only 200 after the deduction
      mockPrisma.salespersonProfile.findUnique
        .mockResolvedValueOnce(makeProfile({ totalPoints: 250, rank: Rank.SILVER })) // updateStreak
        .mockResolvedValueOnce(makeProfile({ totalPoints: 250, rank: Rank.SILVER })) // persistScore inner
        .mockResolvedValueOnce(makeProfile({ totalPoints: 200, rank: Rank.SILVER })); // recomputeRank

      mockRubric.compute.mockReturnValue({ ...DEFAULT_BREAKDOWN, total: -50 });
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      // recomputeRank computes ROOKIE for 200 pts, but SILVER index > ROOKIE index, so no update
      const rankUpdateCalls = mockPrisma.salespersonProfile.update.mock.calls.filter(
        (call: unknown[]) => {
          const arg = call[0] as { data?: { rank?: unknown } };
          return arg.data && 'rank' in arg.data;
        },
      );
      expect(rankUpdateCalls).toHaveLength(0);
    });
  });

  // ---- rulesFromRows (via rubric.compute call) ----

  describe('rulesFromRows — via scoreAttempt', () => {
    it('uses DB rule rows when present, falling back to defaults for missing keys', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(makeAttempt());
      mockPrisma.scoringRuleConfig.findMany.mockResolvedValue([
        { key: 'speed_bonus_pct', value: 0.25 },
        // intentionally omit others → defaults should fill in
      ]);
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({
          rules: expect.objectContaining({
            speedBonusPct: 0.25,
            firstTryBonusPct: 0.15,  // default
            streakBonusPerDay: 5,      // default
          }),
        }),
      );
    });
  });

  // ---- RANK_DIFFICULTY_UNLOCK (via difficultyTierDelta passed to rubric) ----

  describe('RANK_DIFFICULTY_UNLOCK — difficultyTierDelta passed to rubric', () => {
    it('ROOKIE rank + EASY challenge → delta 0 (EASY is the unlock ceiling for ROOKIE)', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(
        makeAttempt({ challenge: { ...makeAttempt().challenge, difficulty: DifficultyTier.EASY } }),
      );
      // salesperson.rank = ROOKIE (unlock ceiling = EASY → idx 1)
      // challenge difficulty = EASY → idx 1 → delta = 0
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ difficultyTierDelta: 0 }),
      );
    });

    it('BRONZE rank + EXPERT challenge → delta 2 (EXPERT idx 4 − MEDIUM idx 2 = 2)', async () => {
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(
        makeAttempt({
          salesperson: { rank: Rank.BRONZE },
          challenge: {
            ...makeAttempt().challenge,
            difficulty: DifficultyTier.EXPERT,
          },
        }),
      );
      // BRONZE unlock ceiling = MEDIUM (idx 2), EXPERT idx = 4 → delta = 2
      const svc = makeSvc();

      await svc.scoreAttempt('attempt-1');

      expect(mockRubric.compute).toHaveBeenCalledWith(
        expect.objectContaining({ difficultyTierDelta: 2 }),
      );
    });
  });
});
