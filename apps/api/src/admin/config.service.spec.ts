import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DifficultyTier, GoalType, Rank } from '@closdex/db';
import { ConfigService } from './config.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { AuthUser } from '../auth/jwt.strategy';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPrisma = {
  difficultyTierConfig: { findMany: jest.fn(), update: jest.fn() },
  goalTypeConfig:        { findMany: jest.fn(), update: jest.fn() },
  rankConfig:            { findMany: jest.fn(), update: jest.fn() },
  scoringRuleConfig:     { findMany: jest.fn(), update: jest.fn() },
  rubricDimensionConfig: { findMany: jest.fn(), update: jest.fn() },
};

const mockAudit = { log: jest.fn() };

const actor: AuthUser = { id: 'admin-1', role: 'ADMIN' as any, email: 'admin@test.com' };

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService,  useValue: mockAudit  },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  // ---- 1. listTiers ----

  it('1. listTiers delegates to prisma.difficultyTierConfig.findMany', async () => {
    const rows = [{ tier: DifficultyTier.EASY }];
    mockPrisma.difficultyTierConfig.findMany.mockResolvedValue(rows);

    const result = await service.listTiers();

    expect(mockPrisma.difficultyTierConfig.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  // ---- 2. listGoals ----

  it('2. listGoals delegates to prisma.goalTypeConfig.findMany', async () => {
    const rows = [{ goalType: GoalType.QUALIFY_LEAD }];
    mockPrisma.goalTypeConfig.findMany.mockResolvedValue(rows);

    const result = await service.listGoals();

    expect(mockPrisma.goalTypeConfig.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  // ---- 3. listRanks ----

  it('3. listRanks delegates to prisma.rankConfig.findMany', async () => {
    const rows = [{ rank: Rank.ROOKIE }];
    mockPrisma.rankConfig.findMany.mockResolvedValue(rows);

    const result = await service.listRanks();

    expect(mockPrisma.rankConfig.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  // ---- 4. listRules ----

  it('4. listRules delegates to prisma.scoringRuleConfig.findMany', async () => {
    const rows = [{ key: 'speed_bonus_pct', value: 0.1 }];
    mockPrisma.scoringRuleConfig.findMany.mockResolvedValue(rows);

    const result = await service.listRules();

    expect(mockPrisma.scoringRuleConfig.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  // ---- 5. listDimensions ----

  it('5. listDimensions delegates to prisma.rubricDimensionConfig.findMany', async () => {
    const rows = [{ id: 'dim-1', name: 'Discovery' }];
    mockPrisma.rubricDimensionConfig.findMany.mockResolvedValue(rows);

    const result = await service.listDimensions();

    expect(mockPrisma.rubricDimensionConfig.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  // ---- 6. updateTier — happy path ----

  it('6. updateTier happy path: calls prisma.difficultyTierConfig.update and audit.log with CONFIG_TIER_UPDATED', async () => {
    const updated = { tier: DifficultyTier.EASY, basePoints: 500 };
    const dto = { basePoints: 500 };
    mockPrisma.difficultyTierConfig.update.mockResolvedValue(updated);
    mockAudit.log.mockResolvedValue(undefined);

    const result = await service.updateTier(actor, DifficultyTier.EASY, dto);

    expect(mockPrisma.difficultyTierConfig.update).toHaveBeenCalledWith({
      where: { tier: DifficultyTier.EASY },
      data: dto,
    });
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'CONFIG_TIER_UPDATED',
        entity: 'DifficultyTierConfig',
        entityId: DifficultyTier.EASY,
        metadata: dto,
      }),
    );
    expect(result).toBe(updated);
  });

  // ---- 7. updateTier — not found ----

  it('7. updateTier throws NotFoundException when prisma throws', async () => {
    mockPrisma.difficultyTierConfig.update.mockRejectedValue(new Error('P2025'));

    await expect(service.updateTier(actor, DifficultyTier.HARD, {})).rejects.toThrow(NotFoundException);
    await expect(service.updateTier(actor, DifficultyTier.HARD, {})).rejects.toThrow(DifficultyTier.HARD);
  });

  // ---- 8. updateGoal — happy path ----

  it('8. updateGoal happy path: calls prisma.goalTypeConfig.update and audit.log with CONFIG_GOAL_UPDATED', async () => {
    const updated = { goalType: GoalType.QUALIFY_LEAD, multiplier: 1.5 };
    const dto = { multiplier: 1.5 };
    mockPrisma.goalTypeConfig.update.mockResolvedValue(updated);
    mockAudit.log.mockResolvedValue(undefined);

    const result = await service.updateGoal(actor, GoalType.QUALIFY_LEAD, dto);

    expect(mockPrisma.goalTypeConfig.update).toHaveBeenCalledWith({
      where: { goalType: GoalType.QUALIFY_LEAD },
      data: dto,
    });
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'CONFIG_GOAL_UPDATED',
        entity: 'GoalTypeConfig',
        entityId: GoalType.QUALIFY_LEAD,
      }),
    );
    expect(result).toBe(updated);
  });

  // ---- 9. updateGoal — not found ----

  it('9. updateGoal throws NotFoundException when prisma throws', async () => {
    mockPrisma.goalTypeConfig.update.mockRejectedValue(new Error('P2025'));

    await expect(service.updateGoal(actor, GoalType.QUALIFY_LEAD, {})).rejects.toThrow(NotFoundException);
    await expect(service.updateGoal(actor, GoalType.QUALIFY_LEAD, {})).rejects.toThrow(GoalType.QUALIFY_LEAD);
  });

  // ---- 10. updateRank — happy path ----

  it('10. updateRank happy path: calls prisma.rankConfig.update and audit.log with CONFIG_RANK_UPDATED', async () => {
    const updated = { rank: Rank.BRONZE, minPoints: 500 };
    const dto = { minPoints: 500 };
    mockPrisma.rankConfig.update.mockResolvedValue(updated);
    mockAudit.log.mockResolvedValue(undefined);

    const result = await service.updateRank(actor, Rank.BRONZE, dto);

    expect(mockPrisma.rankConfig.update).toHaveBeenCalledWith({
      where: { rank: Rank.BRONZE },
      data: dto,
    });
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'CONFIG_RANK_UPDATED',
        entity: 'RankConfig',
        entityId: Rank.BRONZE,
      }),
    );
    expect(result).toBe(updated);
  });

  // ---- 11. updateRank — not found ----

  it('11. updateRank throws NotFoundException when prisma throws', async () => {
    mockPrisma.rankConfig.update.mockRejectedValue(new Error('P2025'));

    await expect(service.updateRank(actor, Rank.GOLD, {})).rejects.toThrow(NotFoundException);
    await expect(service.updateRank(actor, Rank.GOLD, {})).rejects.toThrow(Rank.GOLD);
  });

  // ---- 12. updateRule — happy path ----

  it('12. updateRule happy path: calls prisma.scoringRuleConfig.update and audit.log with CONFIG_RULE_UPDATED', async () => {
    const updated = { key: 'speed_bonus_pct', value: 0.25 };
    const dto = { value: 0.25 };
    mockPrisma.scoringRuleConfig.update.mockResolvedValue(updated);
    mockAudit.log.mockResolvedValue(undefined);

    const result = await service.updateRule(actor, 'speed_bonus_pct', dto);

    expect(mockPrisma.scoringRuleConfig.update).toHaveBeenCalledWith({
      where: { key: 'speed_bonus_pct' },
      data: dto,
    });
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'CONFIG_RULE_UPDATED',
        entity: 'ScoringRuleConfig',
        entityId: 'speed_bonus_pct',
      }),
    );
    expect(result).toBe(updated);
  });

  // ---- 13. updateRule — not found ----

  it('13. updateRule throws NotFoundException when prisma throws', async () => {
    mockPrisma.scoringRuleConfig.update.mockRejectedValue(new Error('P2025'));

    const dto = { value: 0 };
    await expect(service.updateRule(actor, 'nonexistent_key', dto)).rejects.toThrow(NotFoundException);
    await expect(service.updateRule(actor, 'nonexistent_key', dto)).rejects.toThrow('nonexistent_key');
  });

  // ---- 14. updateDimension — happy path ----

  it('14. updateDimension happy path: calls prisma.rubricDimensionConfig.update and audit.log with CONFIG_DIMENSION_UPDATED', async () => {
    const updated = { id: 'dim-42', name: 'Objection Handling', weight: 0.3 };
    const dto = { weight: 0.3 };
    mockPrisma.rubricDimensionConfig.update.mockResolvedValue(updated);
    mockAudit.log.mockResolvedValue(undefined);

    const result = await service.updateDimension(actor, 'dim-42', dto);

    expect(mockPrisma.rubricDimensionConfig.update).toHaveBeenCalledWith({
      where: { id: 'dim-42' },
      data: dto,
    });
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        action: 'CONFIG_DIMENSION_UPDATED',
        entity: 'RubricDimensionConfig',
        entityId: 'dim-42',
      }),
    );
    expect(result).toBe(updated);
  });

  // ---- 15. updateDimension — not found ----

  it('15. updateDimension throws NotFoundException when prisma throws', async () => {
    mockPrisma.rubricDimensionConfig.update.mockRejectedValue(new Error('P2025'));

    await expect(service.updateDimension(actor, 'missing-id', {})).rejects.toThrow(NotFoundException);
    await expect(service.updateDimension(actor, 'missing-id', {})).rejects.toThrow('missing-id');
  });

  // ---- 16. audit.log spot-check: updateTier passes correct actorId + entityId ----

  it('16. audit.log receives correct actorId and entityId for updateTier', async () => {
    mockPrisma.difficultyTierConfig.update.mockResolvedValue({ tier: DifficultyTier.EXPERT });
    mockAudit.log.mockResolvedValue(undefined);

    await service.updateTier(actor, DifficultyTier.EXPERT, { basePoints: 800 });

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        entityId: DifficultyTier.EXPERT,
      }),
    );
  });

  // ---- 17. audit.log spot-check: updateRank passes correct actorId + entityId ----

  it('17. audit.log receives correct actorId and entityId for updateRank', async () => {
    mockPrisma.rankConfig.update.mockResolvedValue({ rank: Rank.SILVER });
    mockAudit.log.mockResolvedValue(undefined);

    await service.updateRank(actor, Rank.SILVER, { minPoints: 1500 });

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        entityId: Rank.SILVER,
      }),
    );
  });

  // ---- 18. updateTier: audit.log metadata matches dto ----

  it('18. updateTier audit.log metadata matches the dto payload', async () => {
    const dto = { basePoints: 999 };
    mockPrisma.difficultyTierConfig.update.mockResolvedValue({ tier: DifficultyTier.MEDIUM, ...dto });
    mockAudit.log.mockResolvedValue(undefined);

    await service.updateTier(actor, DifficultyTier.MEDIUM, dto);

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: dto }),
    );
  });

  // ---- 19. updateGoal: audit.log metadata matches dto ----

  it('19. updateGoal audit.log metadata matches the dto payload', async () => {
    const dto = { multiplier: 2.0 };
    mockPrisma.goalTypeConfig.update.mockResolvedValue({ goalType: GoalType.QUALIFY_LEAD, ...dto });
    mockAudit.log.mockResolvedValue(undefined);

    await service.updateGoal(actor, GoalType.QUALIFY_LEAD, dto);

    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: dto }),
    );
  });

  // ---- 20. audit.log is NOT called when update fails ----

  it('20. audit.log is NOT called when prisma.update rejects', async () => {
    mockPrisma.difficultyTierConfig.update.mockRejectedValue(new Error('P2025'));

    await expect(service.updateTier(actor, DifficultyTier.EASY, {})).rejects.toThrow(NotFoundException);

    expect(mockAudit.log).not.toHaveBeenCalled();
  });
});
