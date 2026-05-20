import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { DifficultyTier, GoalType, Rank, UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { ConfigService } from './config.service';
import { UpdateTierConfigDto } from './dto/update-tier-config.dto';
import { UpdateGoalConfigDto } from './dto/update-goal-config.dto';
import { UpdateRankConfigDto } from './dto/update-rank-config.dto';
import { UpdateRuleConfigDto } from './dto/update-rule-config.dto';
import { UpdateDimensionConfigDto } from './dto/update-dimension-config.dto';

@Controller('admin/config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get('difficulty-tiers')
  listTiers() {
    return this.config.listTiers();
  }
  @Patch('difficulty-tiers/:tier')
  updateTier(
    @CurrentUser() user: AuthUser,
    @Param('tier') tier: DifficultyTier,
    @Body() dto: UpdateTierConfigDto,
  ) {
    return this.config.updateTier(user, tier, dto);
  }

  @Get('goal-types')
  listGoals() {
    return this.config.listGoals();
  }
  @Patch('goal-types/:goalType')
  updateGoal(
    @CurrentUser() user: AuthUser,
    @Param('goalType') goalType: GoalType,
    @Body() dto: UpdateGoalConfigDto,
  ) {
    return this.config.updateGoal(user, goalType, dto);
  }

  @Get('ranks')
  listRanks() {
    return this.config.listRanks();
  }
  @Patch('ranks/:rank')
  updateRank(
    @CurrentUser() user: AuthUser,
    @Param('rank') rank: Rank,
    @Body() dto: UpdateRankConfigDto,
  ) {
    return this.config.updateRank(user, rank, dto);
  }

  @Get('scoring-rules')
  listRules() {
    return this.config.listRules();
  }
  @Patch('scoring-rules/:key')
  updateRule(
    @CurrentUser() user: AuthUser,
    @Param('key') key: string,
    @Body() dto: UpdateRuleConfigDto,
  ) {
    return this.config.updateRule(user, key, dto);
  }

  @Get('rubric-dimensions')
  listDimensions() {
    return this.config.listDimensions();
  }
  @Patch('rubric-dimensions/:id')
  updateDimension(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDimensionConfigDto,
  ) {
    return this.config.updateDimension(user, id, dto);
  }
}
