import { Controller, Get, Param } from '@nestjs/common';
import { TalentService } from './talent.service';

@Controller('talent/public')
export class PublicTalentController {
  constructor(private readonly talent: TalentService) {}

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.talent.getPublicBySlug(slug);
  }
}
