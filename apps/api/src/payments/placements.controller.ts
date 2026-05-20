import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { PlacementsService } from './placements.service';
import { ListPlacementsDto } from './dto/list-placements.dto';
import { HireApplicationDto } from './dto/hire-application.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PlacementsController {
  constructor(private readonly placements: PlacementsService) {}

  /** Hire a candidate: transitions Application to HIRED + creates Placement + DRAFT Invoice. */
  @Post('applications/:id/hire')
  hire(
    @CurrentUser() user: AuthUser,
    @Param('id') applicationId: string,
    @Body() dto: HireApplicationDto,
  ) {
    return this.placements.hire(user, applicationId, dto.annualCtc, dto.commissionRate);
  }

  @Get('placements')
  list(@CurrentUser() user: AuthUser, @Query() query: ListPlacementsDto) {
    return this.placements.list(user, query);
  }

  @Get('placements/:id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.placements.get(user, id);
  }
}
