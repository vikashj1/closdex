import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeStatus, DifficultyTier, Prisma, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { DISPOSITION, deriveTurns } from '../ai/ai-lead.service';
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
    this.assertWinnableWindow(dto.difficulty, dto.maxMessages);
    return this.prisma.challenge.create({ data: dto });
  }

  async update(id: string, dto: UpdateChallengeDto) {
    if (dto.personaId) await this.assertPersonaExists(dto.personaId);
    // difficulty and maxMessages jointly determine the winnable window, so a
    // partial update of either must be validated against the effective pair.
    if (dto.difficulty != null || dto.maxMessages != null) {
      const existing = await this.prisma.challenge.findUnique({
        where: { id },
        select: { difficulty: true, maxMessages: true },
      });
      if (!existing) throw new NotFoundException('Challenge not found.');
      this.assertWinnableWindow(
        dto.difficulty ?? existing.difficulty,
        dto.maxMessages ?? existing.maxMessages,
      );
    }
    try {
      return await this.prisma.challenge.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Challenge not found.');
    }
  }

  /** Rejects message caps that leave a lead no room to be won over. The lead's
   *  commit floor and convergence point are derived from difficulty + cap
   *  (see ai-lead.service DISPOSITION); if convergence lands too close to the
   *  floor — or the cap barely clears convergence — the challenge is
   *  mathematically unwinnable and would just loop to the cap. */
  private assertWinnableWindow(difficulty: DifficultyTier, maxMessages: number) {
    const derived = deriveTurns(DISPOSITION[difficulty], maxMessages);
    const window = derived.convergence - derived.commitFloor;
    if (window < 3 || maxMessages < derived.convergence + 2) {
      throw new BadRequestException(
        `maxMessages (${maxMessages}) is too low for ${difficulty}: the lead's commit floor is turn ` +
          `${derived.commitFloor} and it must decide by turn ${derived.convergence}, leaving a ` +
          `winnable window of ${window} (need ≥ 3) and only ${maxMessages - derived.convergence} turns ` +
          `after convergence (need ≥ 2). Raise maxMessages to at least ${derived.convergence + 2}.`,
      );
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
