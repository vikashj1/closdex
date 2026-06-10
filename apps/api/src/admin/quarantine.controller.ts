import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { QuarantineService } from './quarantine.service';
import { QuarantineReviewDto } from './dto/quarantine-review.dto';

@Controller('admin/quarantine')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QuarantineController {
  constructor(private readonly quarantine: QuarantineService) {}

  @Get()
  list(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.quarantine.list({
      page: page ? Math.max(1, parseInt(page, 10)) : 1,
      perPage: perPage ? Math.min(100, Math.max(1, parseInt(perPage, 10))) : 20,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.quarantine.get(id);
  }

  @Post(':id/clear')
  clear(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: QuarantineReviewDto) {
    return this.quarantine.clear(user, id, dto.reason);
  }

  @Post(':id/confirm')
  confirm(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: QuarantineReviewDto) {
    return this.quarantine.confirm(user, id, dto.reason);
  }
}
