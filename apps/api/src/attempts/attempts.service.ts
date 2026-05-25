import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AttemptStatus, ChallengeStatus, MessageSender, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { AiLeadService } from '../ai/ai-lead.service';
import { ScoringQueueService } from '../scoring/scoring-queue.service';

@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiLead: AiLeadService,
    private readonly scoringQueue: ScoringQueueService,
  ) {}

  async start(user: AuthUser, challengeId: string) {
    if (user.role !== UserRole.SALESPERSON) {
      throw new ForbiddenException('Only salespeople can start challenge attempts.');
    }
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException('Salesperson profile missing.');

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { persona: true },
    });
    if (!challenge || challenge.status !== ChallengeStatus.PUBLISHED) {
      throw new NotFoundException('Challenge not available.');
    }

    const inProgress = await this.prisma.challengeAttempt.findFirst({
      where: {
        salespersonId: profile.id,
        challengeId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });
    if (inProgress) {
      throw new BadRequestException('You already have an attempt in progress for this challenge.');
    }

    const previousCount = await this.prisma.challengeAttempt.count({
      where: { salespersonId: profile.id, challengeId },
    });
    if (challenge.attemptsAllowed && previousCount >= challenge.attemptsAllowed) {
      throw new ForbiddenException('No attempts remaining for this challenge.');
    }

    const attempt = await this.prisma.challengeAttempt.create({
      data: {
        salespersonId: profile.id,
        challengeId,
        attemptNumber: previousCount + 1,
        conversation: { create: {} },
      },
      include: { conversation: { include: { messages: true } } },
    });

    return this.shape(attempt);
  }

  async sendMessage(user: AuthUser, attemptId: string, content: string) {
    const attempt = await this.loadOwnedAttempt(user, attemptId);
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress.');
    }

    const conversationId = attempt.conversation!.id;
    const priorHistory = attempt.conversation!.messages;

    const aiHistory = [
      ...priorHistory.map((m) => ({ sender: m.sender, content: m.content })),
      { sender: MessageSender.SALESPERSON, content },
    ];

    let leadReply: string;
    try {
      leadReply = await this.aiLead.respond({
        personaName: attempt.challenge.persona.name,
        personaPrompt: attempt.challenge.persona.personalityPrompt,
        history: aiHistory,
      });
    } catch (err) {
      this.logger.error('AI lead failed to respond', err);
      throw new ServiceUnavailableException(
        'The AI lead is temporarily unavailable. Please try again in a moment.',
      );
    }

    const messagesUsed = attempt.messagesUsed + 1;
    const reachedCap = messagesUsed >= attempt.challenge.maxMessages;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: { conversationId, sender: MessageSender.SALESPERSON, content },
      });
      await tx.message.create({
        data: { conversationId, sender: MessageSender.LEAD, content: leadReply },
      });
      return tx.challengeAttempt.update({
        where: { id: attempt.id },
        data: {
          messagesUsed,
          ...(reachedCap
            ? { status: AttemptStatus.COMPLETED, completedAt: new Date() }
            : {}),
        },
        include: {
          conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
          challenge: { include: { persona: true } },
          salesperson: true,
        },
      });
    });

    if (reachedCap) {
      // Async: enqueue scoring so the salesperson's request returns immediately
      // (the LLM evaluator is the slowest hop). Worker lives in scoring/scoring.worker.ts.
      await this.scoringQueue.enqueue(updated.id);
    }

    return { attempt: this.shape(updated), leadReply };
  }

  async end(user: AuthUser, attemptId: string) {
    const attempt = await this.loadOwnedAttempt(user, attemptId);
    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return this.shape(attempt);
    }
    const updated = await this.prisma.challengeAttempt.update({
      where: { id: attempt.id },
      data: { status: AttemptStatus.ABANDONED, completedAt: new Date() },
      include: {
        conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
        challenge: { include: { persona: true } },
        salesperson: true,
      },
    });

    await this.scoringQueue.enqueue(updated.id);

    return this.shape(updated);
  }

  async get(user: AuthUser, attemptId: string) {
    return this.shape(await this.loadOwnedAttempt(user, attemptId));
  }

  async listMine(user: AuthUser) {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return [];
    return this.prisma.challengeAttempt.findMany({
      where: { salespersonId: profile.id },
      orderBy: { startedAt: 'desc' },
      include: { challenge: { select: { id: true, title: true, difficulty: true } } },
    });
  }

  private async loadOwnedAttempt(user: AuthUser, attemptId: string) {
    const attempt = await this.prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: {
        challenge: { include: { persona: true } },
        conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
        salesperson: true,
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.salesperson.userId !== user.id) {
      throw new ForbiddenException('This attempt is not yours.');
    }
    return attempt;
  }

  /** Strip the persona's `personalityPrompt` before returning to a client. */
  private shape(attempt: any) {
    if (!attempt?.challenge?.persona) return attempt;
    const { personalityPrompt, ...persona } = attempt.challenge.persona;
    return { ...attempt, challenge: { ...attempt.challenge, persona } };
  }
}
