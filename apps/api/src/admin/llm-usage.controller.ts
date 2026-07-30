import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LlmUsageService } from '../ai/llm-usage.service';

@Controller('admin/llm-usage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LlmUsageAdminController {
  constructor(private readonly usage: LlmUsageService) {}

  @Get('summary')
  summary(@Query('days') days?: string) {
    const n = days ? Math.min(30, Math.max(1, parseInt(days, 10))) : 7;
    return this.usage.summary(Number.isFinite(n) ? n : 7);
  }
}
