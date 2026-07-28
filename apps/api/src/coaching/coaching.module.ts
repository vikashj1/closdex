import { Module } from '@nestjs/common';
import { CoachingService } from './coaching.service';

@Module({
  providers: [CoachingService],
  exports: [CoachingService],
})
export class CoachingModule {}
