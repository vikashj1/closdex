import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaderboardsService } from './leaderboards.service';
import { ListLeaderboardDto } from './dto/list-leaderboard.dto';

@Controller('leaderboards')
@UseGuards(JwtAuthGuard)
export class LeaderboardsController {
  constructor(private readonly leaderboards: LeaderboardsService) {}

  @Get()
  list(@Query() query: ListLeaderboardDto) {
    return this.leaderboards.list(query.period, query.category, query.limit);
  }
}
