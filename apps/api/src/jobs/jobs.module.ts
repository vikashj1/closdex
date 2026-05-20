import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
  providers: [JobsService, ApplicationsService],
  controllers: [JobsController, ApplicationsController],
  exports: [JobsService, ApplicationsService],
})
export class JobsModule {}
