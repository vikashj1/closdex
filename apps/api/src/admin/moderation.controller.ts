import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModerationService } from './moderation.service';

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ModerationController {
  constructor(private readonly svc: ModerationService) {}

  @Get('messages')
  recent(
    @Query('since') since?: string,
    @Query('limit') limit?: string,
    @Query('suspiciousOnly') suspiciousOnly?: string,
  ) {
    return this.svc.recentMessages({
      since: since ? new Date(since) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      suspiciousOnly: suspiciousOnly === 'true',
    });
  }
}
