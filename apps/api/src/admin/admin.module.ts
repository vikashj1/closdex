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

@Module({
  imports: [LeaderboardsModule],
  providers: [AuditService, DisputesService, VerificationService, ConfigService],
  controllers: [DisputesController, VerificationController, ConfigController, AuditController],
  exports: [AuditService],
})
export class AdminModule {}
