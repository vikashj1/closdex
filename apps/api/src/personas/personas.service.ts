import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AiLeadService } from '../ai/ai-lead.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

/** One turn from either side in a test-chat conversation. */
export interface TestChatTurn {
  sender: 'SALESPERSON' | 'LEAD';
  content: string;
}

@Injectable()
export class PersonasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiLead: AiLeadService,
  ) {}

  list() {
    return this.prisma.leadPersona.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const persona = await this.prisma.leadPersona.findUnique({ where: { id } });
    if (!persona) throw new NotFoundException('Persona not found.');
    return persona;
  }

  create(dto: CreatePersonaDto) {
    return this.prisma.leadPersona.create({ data: dto });
  }

  async update(id: string, dto: UpdatePersonaDto) {
    try {
      return await this.prisma.leadPersona.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Persona not found.');
    }
  }

  /** Stateless dev sandbox for admins to sanity-check persona behaviour
   *  before publishing a challenge. Never writes to the DB — no attempts,
   *  no scoring, no leaderboard side effects. History is passed in from the
   *  client (which owns the ephemeral conversation state) plus the new
   *  admin turn, we send it through AiLeadService.respond and echo the
   *  reply. Not billed to any user's telemetry. */
  async testChat(personaId: string, history: TestChatTurn[], message: string) {
    const persona = await this.get(personaId);
    const nextHistory = [
      ...history.map((h) => ({
        sender: h.sender === 'SALESPERSON' ? MessageSender.SALESPERSON : MessageSender.LEAD,
        content: h.content,
      })),
      { sender: MessageSender.SALESPERSON, content: message },
    ];
    const reply = await this.aiLead.respond({
      personaName: persona.name,
      personaPrompt: persona.personalityPrompt,
      history: nextHistory,
      turnCount: nextHistory.length,
      // No priorSummary / resolvedTopics — admin test chat is short-form
      // by design; if you need to test the loop-breaking behaviour, run a
      // full attempt as a salesperson account instead.
    });
    return { reply };
  }
}
