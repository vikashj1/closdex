import { Injectable, NotFoundException } from '@nestjs/common';
import { DifficultyTier, GoalType, Rank } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { AuditService } from './audit.service';
import { UpdateTierConfigDto } from './dto/update-tier-config.dto';
import { UpdateGoalConfigDto } from './dto/update-goal-config.dto';
import { UpdateRankConfigDto } from './dto/update-rank-config.dto';
import { UpdateRuleConfigDto } from './dto/update-rule-config.dto';
import { UpdateDimensionConfigDto } from './dto/update-dimension-config.dto';

/** Admin-tunable config — every mutation writes an AdminAuditLog entry. */
@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Difficulty tiers ─────────────────────────────────────────────────

  listTiers() {
    return this.prisma.difficultyTierConfig.findMany();
  }

  async updateTier(actor: AuthUser, tier: DifficultyTier, dto: UpdateTierConfigDto) {
    try {
      const updated = await this.prisma.difficultyTierConfig.update({
        where: { tier },
        data: dto,
      });
      await this.audit.log({
        actorId: actor.id, action: 'CONFIG_TIER_UPDATED',
        entity: 'DifficultyTierConfig', entityId: tier, metadata: dto as Record<string, unknown>,
      });
      return updated;
    } catch {
      throw new NotFoundException(`DifficultyTierConfig '${tier}' not found.`);
    }
  }

  // ─── Goal types ───────────────────────────────────────────────────────

  listGoals() {
    return this.prisma.goalTypeConfig.findMany();
  }

  async updateGoal(actor: AuthUser, goalType: GoalType, dto: UpdateGoalConfigDto) {
    try {
      const updated = await this.prisma.goalTypeConfig.update({
        where: { goalType },
        data: dto,
      });
      await this.audit.log({
        actorId: actor.id, action: 'CONFIG_GOAL_UPDATED',
        entity: 'GoalTypeConfig', entityId: goalType, metadata: dto as Record<string, unknown>,
      });
      return updated;
    } catch {
      throw new NotFoundException(`GoalTypeConfig '${goalType}' not found.`);
    }
  }

  // ─── Ranks ────────────────────────────────────────────────────────────

  listRanks() {
    return this.prisma.rankConfig.findMany({ orderBy: { minPoints: 'asc' } });
  }

  async updateRank(actor: AuthUser, rank: Rank, dto: UpdateRankConfigDto) {
    try {
      const updated = await this.prisma.rankConfig.update({
        where: { rank },
        data: dto,
      });
      await this.audit.log({
        actorId: actor.id, action: 'CONFIG_RANK_UPDATED',
        entity: 'RankConfig', entityId: rank, metadata: dto as Record<string, unknown>,
      });
      return updated;
    } catch {
      throw new NotFoundException(`RankConfig '${rank}' not found.`);
    }
  }

  // ─── Scoring rules ────────────────────────────────────────────────────

  listRules() {
    return this.prisma.scoringRuleConfig.findMany();
  }

  async updateRule(actor: AuthUser, key: string, dto: UpdateRuleConfigDto) {
    try {
      const updated = await this.prisma.scoringRuleConfig.update({
        where: { key },
        data: dto,
      });
      await this.audit.log({
        actorId: actor.id, action: 'CONFIG_RULE_UPDATED',
        entity: 'ScoringRuleConfig', entityId: key, metadata: dto as Record<string, unknown>,
      });
      return updated;
    } catch {
      throw new NotFoundException(`ScoringRuleConfig '${key}' not found.`);
    }
  }

  // ─── Rubric dimensions ────────────────────────────────────────────────

  listDimensions() {
    return this.prisma.rubricDimensionConfig.findMany();
  }

  async updateDimension(actor: AuthUser, id: string, dto: UpdateDimensionConfigDto) {
    try {
      const updated = await this.prisma.rubricDimensionConfig.update({
        where: { id },
        data: dto,
      });
      await this.audit.log({
        actorId: actor.id, action: 'CONFIG_DIMENSION_UPDATED',
        entity: 'RubricDimensionConfig', entityId: id, metadata: dto as Record<string, unknown>,
      });
      return updated;
    } catch {
      throw new NotFoundException(`RubricDimensionConfig '${id}' not found.`);
    }
  }
}
