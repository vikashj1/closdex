import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { PersonasModule } from './personas/personas.module';
import { ChallengesModule } from './challenges/challenges.module';
import { AiModule } from './ai/ai.module';
import { ScoringModule } from './scoring/scoring.module';
import { AttemptsModule } from './attempts/attempts.module';
import { RedisModule } from './redis/redis.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { LearningModule } from './learning/learning.module';
import { JobsModule } from './jobs/jobs.module';
import { TalentModule } from './talent/talent.module';
import { ShortlistsModule } from './shortlists/shortlists.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { QueueModule } from './queue/queue.module';
import { BadgesModule } from './badges/badges.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    QueueModule,
    NotificationsModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    PersonasModule,
    ChallengesModule,
    AiModule,
    LeaderboardsModule,
    ScoringModule,
    AttemptsModule,
    LearningModule,
    JobsModule,
    TalentModule,
    ShortlistsModule,
    PaymentsModule,
    AdminModule,
    BadgesModule,
  ],
})
export class AppModule {}
