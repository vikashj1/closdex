import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER, EmailProvider } from './email-provider.interface';
import { LogEmailProvider } from './log-email.provider';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

/** @Global so any service can inject NotificationsService without explicit module imports. */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LogEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService, LogEmailProvider],
      useFactory: (_config: ConfigService, log: LogEmailProvider): EmailProvider => {
        // When SES/Sendgrid credentials land, switch on EMAIL_PROVIDER env here.
        return log;
      },
    },
    NotificationsService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
