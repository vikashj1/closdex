import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeStatus, Prisma, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { ListChallengesDto } from './dto/list-challenges.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

/** Persona fields safe to return to non-admin viewers. The `personalityPrompt` is
 *  intentionally NOT included — that's the LLM system prompt and leaking it to
 *  salespeople would ruin the sim. */
const SAFE_PERSONA_SELECT = {
  id: true,
  name: true,
  role: true,
  company: true,
  contextSnippet: true,
} as const;

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(viewer: AuthUser, query: ListChallengesDto) {
    const where: Prisma.ChallengeWhereInput = {};
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.goalType) where.goalType = query.goalType;
    if (query.category) where.category = query.category;

    if (viewer.role === UserRole.ADMIN) {
      if (query.status) where.status = query.status;
    } else {
      where.status = ChallengeStatus.PUBLISHED;
    }

    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.challenge.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { persona: { select: SAFE_PERSONA_SELECT } },
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async get(viewer: AuthUser, id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: { persona: { select: SAFE_PERSONA_SELECT } },
    });
    if (!challenge) throw new NotFoundException('Challenge not found.');
    if (
      challenge.status !== ChallengeStatus.PUBLISHED &&
      viewer.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Challenge is not available.');
    }
    return challenge;
  }

  async create(dto: CreateChallengeDto) {
    await this.assertPersonaExists(dto.personaId);
    return this.prisma.challenge.create({ data: dto });
  }

  async update(id: string, dto: UpdateChallengeDto) {
    if (dto.personaId) await this.assertPersonaExists(dto.personaId);
    try {
      return await this.prisma.challenge.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Challenge not found.');
    }
  }

  async setStatus(id: string, status: ChallengeStatus) {
    try {
      return await this.prisma.challenge.update({ where: { id }, data: { status } });
    } catch {
      throw new NotFoundException('Challenge not found.');
    }
  }

  private async assertPersonaExists(personaId: string) {
    const exists = await this.prisma.leadPersona.findUnique({ where: { id: personaId } });
    if (!exists) throw new NotFoundException(`LeadPersona '${personaId}' not found.`);
  }
}
