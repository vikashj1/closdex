import {
  Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';

const ANON_VIEWER: AuthUser = { id: '', email: '', role: UserRole.SALESPERSON };
import { LearningService } from './learning.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { AttemptQuizDto } from './dto/attempt-quiz.dto';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learning: LearningService) {}

  // ─── Tracks ───────────────────────────────────────────────────────────

  @Public()
  @Get('tracks')
  listTracks() {
    return this.learning.listTracks();
  }

  @Public()
  @Get('tracks/:id')
  getTrack(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    return this.learning.getTrack(user ?? ANON_VIEWER, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('tracks')
  createTrack(@Body() dto: CreateTrackDto) {
    return this.learning.createTrack(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('tracks/:id')
  updateTrack(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.learning.updateTrack(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('tracks/:id')
  @HttpCode(204)
  deleteTrack(@Param('id') id: string) {
    return this.learning.deleteTrack(id);
  }

  // ─── Tutorials ────────────────────────────────────────────────────────

  @Public()
  @Get('tutorials/:id')
  getTutorial(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    return this.learning.getTutorial(user ?? ANON_VIEWER, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('tracks/:trackId/tutorials')
  createTutorial(@Param('trackId') trackId: string, @Body() dto: CreateTutorialDto) {
    return this.learning.createTutorial(trackId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('tutorials/:id')
  updateTutorial(@Param('id') id: string, @Body() dto: UpdateTutorialDto) {
    return this.learning.updateTutorial(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('tutorials/:id')
  @HttpCode(204)
  deleteTutorial(@Param('id') id: string) {
    return this.learning.deleteTutorial(id);
  }

  // ─── Quizzes (upsert by tutorial) ─────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('tutorials/:tutorialId/quiz')
  upsertQuiz(@Param('tutorialId') tutorialId: string, @Body() dto: UpsertQuizDto) {
    return this.learning.upsertQuiz(tutorialId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('tutorials/:tutorialId/quiz')
  @HttpCode(204)
  deleteQuiz(@Param('tutorialId') tutorialId: string) {
    return this.learning.deleteQuiz(tutorialId);
  }

  // ─── Salesperson consumption ──────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(UserRole.SALESPERSON)
  @Post('tutorials/:id/complete')
  completeTutorial(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.learning.completeTutorial(user, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SALESPERSON)
  @Post('quizzes/:id/attempt')
  attemptQuiz(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AttemptQuizDto,
  ) {
    return this.learning.attemptQuiz(user, id, dto.answerIndices);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SALESPERSON)
  @Get('me/progress')
  getMyProgress(@CurrentUser() user: AuthUser) {
    return this.learning.getMyProgress(user);
  }
}
