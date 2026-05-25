import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StatsService } from './stats.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('stats')
  platformStats() {
    return this.stats.platformStats();
  }

  @Get('users')
  listUsers(
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.stats.listUsers({
      role,
      search,
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
    });
  }

  @Patch('users/:id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.stats.updateUserRole(id, role);
  }
}
