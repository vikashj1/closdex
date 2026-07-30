import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { BadgesService } from './badges.service';
import { CreateBadgeDto } from './dto/create-badge.dto';

@Controller('badges')
@UseGuards(JwtAuthGuard)
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  /** List all badge definitions — any authenticated user */
  @Get()
  listDefinitions() {
    return this.badges.listDefinitions();
  }

  /** My earned badges — salesperson only */
  @Get('earned')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SALESPERSON)
  listEarned(@CurrentUser() user: AuthUser) {
    return this.badges.listEarned(user.id);
  }

  /** Earned badges for any user by userId — admin only */
  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  listEarnedForUser(@Param('userId') userId: string) {
    return this.badges.listEarned(userId);
  }

  /** Create badge definition — admin only */
  @Post('admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createDefinition(@CurrentUser() user: AuthUser, @Body() dto: CreateBadgeDto) {
    return this.badges.createDefinition(user, dto);
  }

  /** Edit badge definition (name / description / iconUrl) — admin only.
   *  `code` is immutable to preserve award history integrity. */
  @Patch('admin/:badgeId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateDefinition(
    @CurrentUser() user: AuthUser,
    @Param('badgeId') badgeId: string,
    @Body() dto: { name?: string; description?: string; iconUrl?: string | null },
  ) {
    return this.badges.updateDefinition(user, badgeId, dto);
  }

  /** Delete badge definition — admin only. Blocks if any awards exist. */
  @Delete('admin/:badgeId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteDefinition(@CurrentUser() user: AuthUser, @Param('badgeId') badgeId: string) {
    return this.badges.deleteDefinition(user, badgeId);
  }

  /** Award badge to a salesperson by userId — admin only */
  @Post('admin/:badgeId/award')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  award(
    @CurrentUser() user: AuthUser,
    @Param('badgeId') badgeId: string,
    @Body('userId') userId: string,
  ) {
    return this.badges.award(user, badgeId, userId);
  }

  /** Revoke badge from a salesperson — admin only */
  @Delete('admin/:badgeId/revoke/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  revoke(
    @CurrentUser() user: AuthUser,
    @Param('badgeId') badgeId: string,
    @Param('userId') userId: string,
  ) {
    return this.badges.revoke(user, badgeId, userId);
  }
}
