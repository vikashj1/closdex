import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/jwt.strategy';
import { JobsService } from './jobs.service';
import { ApplicationsService } from './applications.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsDto } from './dto/list-jobs.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly applications: ApplicationsService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListJobsDto) {
    return this.jobs.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.get(user, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateJobDto) {
    return this.jobs.create(user, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobs.update(user, id, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.publish(user, id);
  }

  @Post(':id/pause')
  pause(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.pause(user, id);
  }

  @Post(':id/close')
  close(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.close(user, id);
  }

  @Post(':id/repost')
  repost(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.repost(user, id);
  }

  // ─── Saved jobs ──────────────────────────────────────────────────────────

  @Get('saved/list')
  listSaved(@CurrentUser() user: AuthUser) {
    return this.jobs.listSaved(user);
  }

  @Get('saved/ids')
  savedJobIds(@CurrentUser() user: AuthUser) {
    return this.jobs.savedJobIds(user);
  }

  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  save(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.saveJob(user, id);
  }

  @Delete(':id/save')
  @HttpCode(HttpStatus.OK)
  unsave(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.jobs.unsaveJob(user, id);
  }

  // ─── Application routes nested under the job ─────────────────────────

  @Post(':id/apply')
  apply(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applications.apply(user, id);
  }

  @Get(':id/applications')
  listApplicants(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applications.listForJob(user, id);
  }
}
