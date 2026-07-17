import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ConfigService } from './config.service';

/** Read-only public snapshots of scoring/rank config. The write side lives on
 *  the admin-guarded ConfigController; this exposes just the values the
 *  signed-in dashboard needs to render (rank ladder + difficulty tiers) so we
 *  don't hardcode point thresholds on the client. */
@Controller('config')
export class PublicConfigController {
  constructor(private readonly config: ConfigService) {}

  @Get('ranks')
  @Public()
  ranks() {
    return this.config.listRanks();
  }

  @Get('difficulty-tiers')
  @Public()
  tiers() {
    return this.config.listTiers();
  }
}
