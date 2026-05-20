import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    PersonasModule,
    ChallengesModule,
    AiModule,
    LeaderboardsModule,
    ScoringModule,
    AttemptsModule,
  ],
})
export class AppModule {}
