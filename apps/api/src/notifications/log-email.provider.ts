import { Injectable, Logger } from '@nestjs/common';
import { EmailPayload, EmailProvider } from './email-provider.interface';

/** Default email provider until SES/Sendgrid credentials land. Logs to stdout so
 *  flows can be tested end-to-end without sending real mail. */
@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger('Email');

  async send(p: EmailPayload): Promise<void> {
    this.logger.log(`→ ${p.to}  [${p.subject}]\n${p.body}`);
  }
}
