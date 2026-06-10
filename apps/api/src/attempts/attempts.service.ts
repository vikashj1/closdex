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
import { AiLeadService, GOAL_ACHIEVED_TOKEN } from '../ai/ai-lead.service';
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

  async sendMessage(
    user: AuthUser,
    attemptId: string,
    content: string,
    clientMeta?: object,
  ) {
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

    let rawReply: string;
    try {
      rawReply = await this.aiLead.respond({
        personaName: attempt.challenge.persona.name,
        personaPrompt: attempt.challenge.persona.personalityPrompt,
        history: aiHistory,
        goalDescription: attempt.challenge.goalDescription,
      });
    } catch (err) {
      this.logger.error('AI lead failed to respond', err);
      throw new ServiceUnavailableException(
        'The AI lead is temporarily unavailable. Please try again in a moment.',
      );
    }

    // Detect goal achievement signalled by the lead (no extra LLM call).
    const goalAchievedSignal = rawReply.includes(GOAL_ACHIEVED_TOKEN);
    const leadReply = rawReply.replace(GOAL_ACHIEVED_TOKEN, '').trimEnd();

    const messagesUsed = attempt.messagesUsed + 1;
    const reachedCap = messagesUsed >= attempt.challenge.maxMessages;
    const shouldComplete = reachedCap || goalAchievedSignal;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          conversationId,
          sender: MessageSender.SALESPERSON,
          content,
          ...(clientMeta ? { clientMeta: clientMeta as any } : {}),
        },
      });
      await tx.message.create({
        data: { conversationId, sender: MessageSender.LEAD, content: leadReply },
      });
      return tx.challengeAttempt.update({
        where: { id: attempt.id },
        data: {
          messagesUsed,
          ...(shouldComplete
            ? {
                status: AttemptStatus.COMPLETED,
                completedAt: new Date(),
                ...(goalAchievedSignal ? { goalAchieved: true } : {}),
              }
            : {}),
        },
        include: {
          conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
          challenge: { include: { persona: true } },
          salesperson: true,
        },
      });
    });

    if (shouldComplete) {
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
    const rows = await this.prisma.challengeAttempt.findMany({
      where: { salespersonId: profile.id },
      orderBy: { startedAt: 'desc' },
      include: { challenge: { select: { id: true, title: true, difficulty: true } } },
    });
    return rows.map((r) => this.shape(r));
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

  /** Strip persona prompt + project scoring fields to frontend-expected names. */
  private shape(attempt: any) {
    const bd = attempt.scoreBreakdown as any;
    const projected = {
      ...attempt,
      pointsAwarded: attempt.finalScore ?? null,
      score: bd?.qualityMultiplier != null ? Math.round(bd.qualityMultiplier * 100) : null,
      rubricScores: bd?.qualityDims ?? null,
      feedback: bd?.notes ?? null,
      // Slice 123: surface quarantine state to the result page so we can show
      // "score withheld for review" instead of pretending the attempt earned 0.
      // We deliberately do NOT leak the underlying suspicionScore / flags to
      // the salesperson — that stays admin-only on /admin/quarantine.
      quarantined: attempt.quarantined ?? false,
    };
    if (!attempt?.challenge?.persona) return projected;
    const { personalityPrompt, ...persona } = attempt.challenge.persona;
    return { ...projected, challenge: { ...attempt.challenge, persona } };
  }
}
