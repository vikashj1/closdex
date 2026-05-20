import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { TalentService } from './talent.service';
import { SearchTalentDto } from './dto/search-talent.dto';

@Controller('talent')
@UseGuards(JwtAuthGuard)
export class TalentController {
  constructor(private readonly talent: TalentService) {}

  @Get()
  search(@CurrentUser() user: AuthUser, @Query() query: SearchTalentDto) {
    return this.talent.search(user, query);
  }
}
