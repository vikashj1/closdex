import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';

@Module({
  imports: [AiModule],
  providers: [PersonasService],
  controllers: [PersonasController],
  exports: [PersonasService],
})
export class PersonasModule {}
