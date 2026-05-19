import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { RubricService } from './rubric.service';
import { AiEvaluatorService } from './ai-evaluator.service';
import { ScoringService } from './scoring.service';

@Module({
  imports: [AiModule],
  providers: [RubricService, AiEvaluatorService, ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
