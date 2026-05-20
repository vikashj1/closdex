import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { ShortlistsService } from './shortlists.service';
import { ShortlistsController } from './shortlists.controller';

@Module({
  imports: [JobsModule],
  providers: [ShortlistsService],
  controllers: [ShortlistsController],
  exports: [ShortlistsService],
})
export class ShortlistsModule {}
