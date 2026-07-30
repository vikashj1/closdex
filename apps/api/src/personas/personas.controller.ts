import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

/** All persona endpoints are ADMIN-only — personas are content the CMS curates,
 *  and their LLM `personalityPrompt` must never leak to salespeople. */
@Controller('personas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PersonasController {
  constructor(private readonly personas: PersonasService) {}

  @Get()
  list() {
    return this.personas.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.personas.get(id);
  }

  @Post()
  create(@Body() dto: CreatePersonaDto) {
    return this.personas.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonaDto) {
    return this.personas.update(id, dto);
  }

  /** Admin-only sandbox — send a message to the persona and get a reply
   *  without creating an attempt or affecting scoring. History is client-
   *  owned; we don't persist anything. */
  @Post(':id/test-chat')
  testChat(
    @Param('id') id: string,
    @Body('history') history: Array<{ sender: 'SALESPERSON' | 'LEAD'; content: string }> = [],
    @Body('message') message: string,
  ) {
    return this.personas.testChat(id, history, message);
  }
}
