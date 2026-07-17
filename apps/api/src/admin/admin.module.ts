import { Module } from '@nestjs/common';
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

@Module({
  imports: [LeaderboardsModule],
  providers: [
    AuditService,
    DisputesService,
    VerificationService,
    ConfigService,
    StatsService,
    QuarantineService,
  ],
  controllers: [
    DisputesController,
    VerificationController,
    ConfigController,
    PublicConfigController,
    AuditController,
    StatsController,
    QuarantineController,
  ],
  exports: [AuditService],
})
export class AdminModule {}
