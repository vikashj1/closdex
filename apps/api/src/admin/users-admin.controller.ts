import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersAdminService } from './users-admin.service';
import { AuthUser } from '../auth/jwt.strategy';

interface ReqWithUser {
  user: AuthUser;
}

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(private readonly svc: UsersAdminService) {}

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Get(':id/attempts')
  attempts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.svc.listAttempts(
      id,
      page ? parseInt(page, 10) : undefined,
      perPage ? parseInt(perPage, 10) : undefined,
    );
  }

  @Post(':id/ban')
  ban(@Req() req: ReqWithUser, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.svc.ban(req.user, id, reason);
  }

  @Post(':id/unban')
  unban(@Req() req: ReqWithUser, @Param('id') id: string) {
    return this.svc.unban(req.user, id);
  }

  @Delete(':id')
  softDelete(@Req() req: ReqWithUser, @Param('id') id: string) {
    return this.svc.softDelete(req.user, id);
  }

  @Post(':id/points-adjust')
  adjustPoints(
    @Req() req: ReqWithUser,
    @Param('id') id: string,
    @Body('delta') delta: number,
    @Body('reason') reason?: string,
  ) {
    return this.svc.adjustPoints(req.user, id, delta, reason);
  }

  @Post(':id/impersonate')
  impersonate(@Req() req: ReqWithUser, @Param('id') id: string) {
    return this.svc.impersonate(req.user, id);
  }
}
