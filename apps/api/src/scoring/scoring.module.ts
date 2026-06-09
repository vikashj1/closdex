import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { RubricService } from './rubric.service';
import { AiEvaluatorService } from './ai-evaluator.service';
import { ScoringService } from './scoring.service';
import { ScoringQueueService } from './scoring-queue.service';
import { ScoringWorker } from './scoring.worker';
import { SuspicionService } from './suspicion.service';

@Module({
  imports: [AiModule, LeaderboardsModule],
  providers: [
    RubricService,
    AiEvaluatorService,
    ScoringService,
    ScoringQueueService,
    ScoringWorker,
    SuspicionService,
  ],
  exports: [ScoringService, ScoringQueueService],
})
export class ScoringModule {}
