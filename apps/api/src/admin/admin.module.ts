import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { PublicConfigController } from './public-config.controller';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { QuarantineService } from './quarantine.service';
import { QuarantineController } from './quarantine.controller';
import { UsersAdminService } from './users-admin.service';
import { UsersAdminController } from './users-admin.controller';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagsAdminController, FeatureFlagsPublicController } from './feature-flags.controller';

@Module({
  imports: [
    LeaderboardsModule,
    // JwtModule so UsersAdminService can mint impersonation tokens. Reuses
    // the same JWT_SECRET as AuthModule so tokens are cross-verifiable.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [NestConfigService],
      useFactory: (cfg: NestConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') ?? '7d' },
      }),
    }),
  ],
  providers: [
    AuditService,
    DisputesService,
    VerificationService,
    ConfigService,
    StatsService,
    QuarantineService,
    UsersAdminService,
    FeatureFlagsService,
  ],
  controllers: [
    DisputesController,
    VerificationController,
    ConfigController,
    PublicConfigController,
    AuditController,
    StatsController,
    QuarantineController,
    UsersAdminController,
    FeatureFlagsAdminController,
    FeatureFlagsPublicController,
  ],
  exports: [AuditService, FeatureFlagsService],
})
export class AdminModule {}
