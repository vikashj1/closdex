import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { VerificationService } from './verification.service';
import { VerificationActionDto } from './dto/verification-action.dto';

@Controller('admin/verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get('pending')
  listPending() {
    return this.verification.listPending();
  }

  @Post('companies/:id/approve')
  approve(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: VerificationActionDto,
  ) {
    return this.verification.approve(user, id, dto.notes);
  }

  @Post('companies/:id/reject')
  reject(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: VerificationActionDto,
  ) {
    return this.verification.reject(user, id, dto.notes);
  }
}
