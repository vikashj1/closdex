import { Module } from '@nestjs/common';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';

@Module({
  imports: [LeaderboardsModule],
  providers: [LearningService],
  controllers: [LearningController],
  exports: [LearningService],
})
export class LearningModule {}
