import { QualityDims, RubricInputs, RubricService, ScoringRules } from './rubric.service';

const RULES: ScoringRules = {
  speedBonusPct: 0.1,
  firstTryBonusPct: 0.15,
  streakBonusPerDay: 5,
  streakBonusCap: 100,
  difficultyJumpBonusPct: 0.2,
  spamPenalty: -50,
  lyingPenalty: -100,
  abandonmentPenalty: -25,
  repeatAttemptDecay: 0.7,
  goalNotAchievedPartial: 0.3,
};

const PERFECT_DIMS: QualityDims = {
  discoveryListening: 5,
  objectionHandling: 5,
  valueArticulation: 5,
  conversationalQuality: 5,
  goalExecution: 5,
};

const ZERO_FLAGS = { spam: false, lying: false, abandoned: false };

function makeInput(overrides: Partial<RubricInputs> = {}): RubricInputs {
  return {
    basePoints: 400,
    goalMultiplier: 1.2,
    qualityDims: PERFECT_DIMS,
    goalAchieved: true,
    messagesUsed: 10,
    maxMessages: 25,
    attemptNumber: 1,
    streakDays: 0,
    difficultyTierDelta: 0,
    flags: ZERO_FLAGS,
    rules: RULES,
    ...overrides,
  };
}

function reasons(items: { reason: string }[]): string[] {
  return items.map((i) => i.reason).sort();
}

describe('RubricService', () => {
  const svc = new RubricService();

  describe('quality multiplier', () => {
    it('is 1.0 when every dimension is the max (5)', () => {
      const r = svc.compute(makeInput());
      expect(r.qualityMultiplier).toBe(1);
    });

    it('is 0 when every dimension is 0', () => {
      const r = svc.compute(
        makeInput({
          qualityDims: {
            discoveryListening: 0,
            objectionHandling: 0,
            valueArticulation: 0,
            conversationalQuality: 0,
            goalExecution: 0,
          },
        }),
      );
      expect(r.qualityMultiplier).toBe(0);
      expect(r.baseScore).toBe(0);
    });

    it('is the sum/25 for intermediate dims', () => {
      const dims: QualityDims = {
        discoveryListening: 3,
        objectionHandling: 4,
        valueArticulation: 3,
        conversationalQuality: 4,
        goalExecution: 1,
      }; // sum 15
      const r = svc.compute(makeInput({ qualityDims: dims }));
      expect(r.qualityMultiplier).toBeCloseTo(15 / 25);
    });

    it('clamps above 1 to 1', () => {
      const dims: QualityDims = {
        discoveryListening: 10,
        objectionHandling: 10,
        valueArticulation: 10,
        conversationalQuality: 10,
        goalExecution: 10,
      };
      const r = svc.compute(makeInput({ qualityDims: dims }));
      expect(r.qualityMultiplier).toBe(1);
    });
  });

  describe('base score paths', () => {
    it('goal achieved: base = points × goalMult × qualityMult', () => {
      const r = svc.compute(makeInput({ goalAchieved: true })); // 400 * 1.2 * 1 = 480
      expect(r.baseScore).toBe(480);
    });

    it('goal not achieved: partial credit at rules.goalNotAchievedPartial', () => {
      const r = svc.compute(makeInput({ goalAchieved: false })); // 400 * 1 * 0.3 = 120
      expect(r.baseScore).toBe(120);
      // No completion bonuses on a miss
      expect(reasons(r.bonuses)).not.toContain('SPEED_BONUS');
      expect(reasons(r.bonuses)).not.toContain('FIRST_TRY_BONUS');
    });

    it('abandoned: base score is 0 even if goal was technically achieved', () => {
      const r = svc.compute(
        makeInput({
          goalAchieved: true,
          flags: { spam: false, lying: false, abandoned: true },
        }),
      );
      expect(r.baseScore).toBe(0);
      expect(reasons(r.bonuses)).not.toContain('SPEED_BONUS');
      expect(reasons(r.penalties)).toContain('ABANDONMENT_PENALTY');
    });
  });

  describe('bonuses', () => {
    it('SPEED_BONUS fires only when messagesUsed < 60% of cap', () => {
      const win = svc.compute(makeInput({ messagesUsed: 14, maxMessages: 25 }));
      expect(reasons(win.bonuses)).toContain('SPEED_BONUS');

      const lose = svc.compute(makeInput({ messagesUsed: 15, maxMessages: 25 }));
      expect(reasons(lose.bonuses)).not.toContain('SPEED_BONUS');
    });

    it('FIRST_TRY_BONUS fires only on attempt 1', () => {
      const t1 = svc.compute(makeInput({ attemptNumber: 1 }));
      expect(reasons(t1.bonuses)).toContain('FIRST_TRY_BONUS');

      const t2 = svc.compute(makeInput({ attemptNumber: 2 }));
      expect(reasons(t2.bonuses)).not.toContain('FIRST_TRY_BONUS');
    });

    it('DIFFICULTY_JUMP_BONUS requires tier delta ≥ 2', () => {
      const one = svc.compute(makeInput({ difficultyTierDelta: 1 }));
      expect(reasons(one.bonuses)).not.toContain('DIFFICULTY_JUMP_BONUS');

      const two = svc.compute(makeInput({ difficultyTierDelta: 2 }));
      expect(reasons(two.bonuses)).toContain('DIFFICULTY_JUMP_BONUS');
    });

    it('STREAK_BONUS scales linearly then caps', () => {
      const small = svc.compute(makeInput({ streakDays: 5 }));
      const streakSmall = small.bonuses.find((b) => b.reason === 'STREAK_BONUS');
      expect(streakSmall?.points).toBe(25); // 5 * 5

      const huge = svc.compute(makeInput({ streakDays: 100 }));
      const streakHuge = huge.bonuses.find((b) => b.reason === 'STREAK_BONUS');
      expect(streakHuge?.points).toBe(100); // capped
    });

    it('no completion bonuses when goal is missed, but streak still applies', () => {
      const r = svc.compute(
        makeInput({
          goalAchieved: false,
          messagesUsed: 5,
          attemptNumber: 1,
          difficultyTierDelta: 3,
          streakDays: 4,
        }),
      );
      const names = reasons(r.bonuses);
      expect(names).not.toContain('SPEED_BONUS');
      expect(names).not.toContain('FIRST_TRY_BONUS');
      expect(names).not.toContain('DIFFICULTY_JUMP_BONUS');
      expect(names).toContain('STREAK_BONUS');
    });

    it('abandoned attempts get no bonuses at all (including streak)', () => {
      const r = svc.compute(
        makeInput({
          flags: { spam: false, lying: false, abandoned: true },
          streakDays: 10,
          attemptNumber: 1,
        }),
      );
      expect(r.bonuses).toHaveLength(0);
    });
  });

  describe('penalties', () => {
    it('spam adds the spam penalty', () => {
      const r = svc.compute(
        makeInput({ flags: { spam: true, lying: false, abandoned: false } }),
      );
      expect(r.penalties.find((p) => p.reason === 'SPAM_PENALTY')?.points).toBe(-50);
    });

    it('lying adds the lying penalty', () => {
      const r = svc.compute(
        makeInput({ flags: { spam: false, lying: true, abandoned: false } }),
      );
      expect(r.penalties.find((p) => p.reason === 'LYING_PENALTY')?.points).toBe(-100);
    });

    it('penalties stack', () => {
      const r = svc.compute(
        makeInput({ flags: { spam: true, lying: true, abandoned: true } }),
      );
      expect(reasons(r.penalties)).toEqual(
        ['ABANDONMENT_PENALTY', 'LYING_PENALTY', 'SPAM_PENALTY'].sort(),
      );
    });
  });

  describe('repeat-attempt decay', () => {
    it('attempt 1: decayMultiplier is 1', () => {
      const r = svc.compute(makeInput({ attemptNumber: 1 }));
      expect(r.decayMultiplier).toBeCloseTo(1);
    });

    it('attempt 3: decay is 0.7^2 = 0.49', () => {
      const r = svc.compute(makeInput({ attemptNumber: 3, goalAchieved: true }));
      expect(r.decayMultiplier).toBeCloseTo(0.49);
    });

    it('decay applies to positives only — penalties survive at full magnitude', () => {
      const r = svc.compute(
        makeInput({
          attemptNumber: 3,
          flags: { spam: true, lying: false, abandoned: false },
        }),
      );
      // total = round((baseScore + bonuses) * 0.49 + (-50))
      const expected =
        Math.round(r.preDecayPositive * r.decayMultiplier) +
        r.penalties.reduce((s, p) => s + p.points, 0);
      // ±1 to allow for a single rounding-order delta vs the service's rounding
      expect(r.total).toBeGreaterThanOrEqual(expected - 1);
      expect(r.total).toBeLessThanOrEqual(expected + 1);
      expect(r.penalties.find((p) => p.reason === 'SPAM_PENALTY')?.points).toBe(-50);
    });
  });

  describe('integer rounding', () => {
    it('returns whole-number totals and line items', () => {
      const r = svc.compute(
        makeInput({
          basePoints: 333, // forces fractional intermediates
          qualityDims: {
            discoveryListening: 3,
            objectionHandling: 4,
            valueArticulation: 2,
            conversationalQuality: 5,
            goalExecution: 1,
          },
          attemptNumber: 2,
          streakDays: 3,
        }),
      );
      expect(Number.isInteger(r.total)).toBe(true);
      expect(Number.isInteger(r.baseScore)).toBe(true);
      for (const b of r.bonuses) expect(Number.isInteger(b.points)).toBe(true);
      for (const p of r.penalties) expect(Number.isInteger(p.points)).toBe(true);
    });
  });
});
