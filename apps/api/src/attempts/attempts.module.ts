import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ScoringModule } from '../scoring/scoring.module';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';

@Module({
  imports: [AiModule, ScoringModule],
  providers: [AttemptsService],
  controllers: [AttemptsController],
  exports: [AttemptsService],
})
export class AttemptsModule {}
