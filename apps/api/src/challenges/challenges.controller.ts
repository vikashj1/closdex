import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChallengeStatus, UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { ChallengesService } from './challenges.service';
import { ListChallengesDto } from './dto/list-challenges.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
  constructor(private readonly challenges: ChallengesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListChallengesDto) {
    return this.challenges.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.challenges.get(user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateChallengeDto) {
    return this.challenges.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.challenges.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.challenges.setStatus(id, ChallengeStatus.PUBLISHED);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.challenges.setStatus(id, ChallengeStatus.ARCHIVED);
  }
}
