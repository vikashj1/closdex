import { Module } from '@nestjs/common';
import { TalentService } from './talent.service';
import { TalentController } from './talent.controller';
import { PublicTalentController } from './public-talent.controller';
import { ProfileViewsService } from './profile-views.service';

@Module({
  providers: [TalentService, ProfileViewsService],
  controllers: [TalentController, PublicTalentController],
  exports: [TalentService, ProfileViewsService],
})
export class TalentModule {}
