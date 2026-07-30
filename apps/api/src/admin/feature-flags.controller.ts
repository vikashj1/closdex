import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FeatureFlagsService, UpsertFlagInput } from './feature-flags.service';
import { AuthUser } from '../auth/jwt.strategy';

@Controller('admin/feature-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FeatureFlagsAdminController {
  constructor(private readonly svc: FeatureFlagsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Put(':key')
  upsert(
    @Req() req: { user: AuthUser },
    @Param('key') key: string,
    @Body() body: Omit<UpsertFlagInput, 'key'>,
  ) {
    return this.svc.upsert(req.user, { ...body, key });
  }
}

/** Public projection — unauthenticated. Only exposes flags marked
 *  publicRead=true so the frontend can gate UI without a login. */
@Controller('feature-flags')
export class FeatureFlagsPublicController {
  constructor(private readonly svc: FeatureFlagsService) {}

  @Get()
  publicList() {
    return this.svc.listPublic();
  }
}
