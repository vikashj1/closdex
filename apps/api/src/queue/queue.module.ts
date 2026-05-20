import { Global, Logger, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';
import { Queue } from 'bullmq';

/** Separate ioredis connection just for BullMQ — its blocking commands would
 *  otherwise stall ops on the shared REDIS_CLIENT used by leaderboards. */
export const BULL_CONNECTION = Symbol('BULL_CONNECTION');
export const SCORING_QUEUE = Symbol('SCORING_QUEUE');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BULL_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        // BullMQ requires `maxRetriesPerRequest: null` and `enableReadyCheck: false` is recommended.
        const c = new IORedis(url, { maxRetriesPerRequest: null });
        const log = new Logger('BullMQ.connection');
        c.on('error', (err) => log.error(`Redis error: ${err.message}`));
        return c;
      },
    },
    {
      provide: SCORING_QUEUE,
      inject: [BULL_CONNECTION],
      useFactory: (connection: Redis): Queue => {
        return new Queue('scoring', {
          connection,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5_000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: false,
          },
        });
      },
    },
  ],
  exports: [BULL_CONNECTION, SCORING_QUEUE],
})
export class QueueModule implements OnApplicationShutdown {
  constructor(@Inject(BULL_CONNECTION) private readonly connection: Redis) {}

  async onApplicationShutdown() {
    await this.connection.quit().catch(() => undefined);
  }
}
