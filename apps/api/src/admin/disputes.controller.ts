import {
  Body, Controller, Get, Param, Post, Query, UseGuards,
} from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { ListDisputesDto } from './dto/list-disputes.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  // ─── Salesperson side ─────────────────────────────────────────────────

  @Post('disputes')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDisputeDto) {
    return this.disputes.create(user, dto);
  }

  @Get('disputes/me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.disputes.listMine(user);
  }

  // ─── Admin side ───────────────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/disputes')
  adminList(@Query() query: ListDisputesDto) {
    return this.disputes.adminList(query);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/disputes/:id')
  adminGet(@Param('id') id: string) {
    return this.disputes.adminGet(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/disputes/:id/resolve')
  adminResolve(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputes.adminResolve(user, id, dto);
  }
}
