import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalespersonDto } from './dto/update-salesperson.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserDto) {
    return this.users.updateUser(user.id, dto);
  }

  /** Salesperson-only — guarded by role; companies can't write to a salesperson profile. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALESPERSON)
  @Patch('me/salesperson')
  updateMySalesperson(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateSalespersonDto,
  ) {
    return this.users.updateSalespersonProfile(user.id, dto);
  }
}
