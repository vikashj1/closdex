import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Worker, Job } from 'bullmq';
import { BULL_CONNECTION } from '../queue/queue.module';
import { ScoringService } from './scoring.service';
import { ScoreAttemptJob } from './scoring-queue.service';

@Injectable()
export class ScoringWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('ScoringWorker');
  private worker?: Worker;

  constructor(
    @Inject(BULL_CONNECTION) private readonly connection: Redis,
    private readonly scoring: ScoringService,
  ) {}

  onModuleInit() {
    this.worker = new Worker<ScoreAttemptJob>(
      'scoring',
      async (job: Job<ScoreAttemptJob>) => {
        await this.scoring.scoreAttempt(job.data.attemptId);
      },
      {
        connection: this.connection,
        concurrency: Number(process.env.SCORING_WORKER_CONCURRENCY ?? 5),
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `Scoring job ${job?.id} (attempt=${job?.data?.attemptId}) failed: ${err.message}`,
      );
    });
    this.worker.on('completed', (job) => {
      this.logger.debug(`Scoring job ${job.id} completed (attempt=${job.data.attemptId})`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
