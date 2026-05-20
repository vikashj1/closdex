import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';

@Module({
  imports: [JobsModule],
  providers: [PlacementsService, InvoicesService],
  controllers: [PlacementsController, InvoicesController],
  exports: [PlacementsService, InvoicesService],
})
export class PaymentsModule {}
