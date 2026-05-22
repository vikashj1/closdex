import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { TalentService } from './talent.service';
import { ProfileViewsService } from './profile-views.service';
import { SearchTalentDto } from './dto/search-talent.dto';

@Controller('talent')
@UseGuards(JwtAuthGuard)
export class TalentController {
  constructor(
    private readonly talent: TalentService,
    private readonly profileViews: ProfileViewsService,
  ) {}

  @Get()
  search(@CurrentUser() user: AuthUser, @Query() query: SearchTalentDto) {
    return this.talent.search(user, query);
  }

  /** Who viewed my profile — salesperson only */
  @Get('me/viewers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SALESPERSON)
  myViewers(@CurrentUser() user: AuthUser) {
    return this.profileViews.listForMe(user.id);
  }

  @Get(':slug')
  getBySlug(@CurrentUser() user: AuthUser, @Param('slug') slug: string) {
    return this.talent.getBySlug(user, slug);
  }
}
