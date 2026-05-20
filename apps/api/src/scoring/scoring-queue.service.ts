import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SCORING_QUEUE } from '../queue/queue.module';

export interface ScoreAttemptJob {
  attemptId: string;
}

/** Producer side of the scoring queue. Workers live in scoring.worker.ts. */
@Injectable()
export class ScoringQueueService {
  private readonly logger = new Logger(ScoringQueueService.name);

  constructor(@Inject(SCORING_QUEUE) private readonly queue: Queue) {}

  async enqueue(attemptId: string): Promise<void> {
    try {
      await this.queue.add('score-attempt', { attemptId } satisfies ScoreAttemptJob);
    } catch (err) {
      // Don't fail the caller's request just because Redis hiccuped — the attempt
      // is recoverable via an admin re-run. Log loudly so it's visible in dashboards.
      this.logger.error(`Failed to enqueue scoring for attempt ${attemptId}: ${err}`);
    }
  }
}
