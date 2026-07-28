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

function parseTopics(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split('|').map((t) => t.trim()).filter(Boolean)));
}

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

    const conversation = attempt.conversation!;
    const conversationId = conversation.id;
    const priorHistory = conversation.messages;

    // Rolling-summary strategy (slice 124): when the chat grows past
    // RECENT_WINDOW messages, summarize everything older than the last
    // RECENT_WINDOW and pass only {persona + summary + last RECENT_WINDOW + new}
    // to the lead. Cuts input tokens ~50% on a typical 15-turn challenge.
    const RECENT_WINDOW = 5;
    const SUMMARY_REFRESH_INTERVAL = 4;

    const fullHistory = [
      ...priorHistory.map((m) => ({ sender: m.sender, content: m.content })),
      { sender: MessageSender.SALESPERSON, content },
    ];

    let priorSummary: string | null = conversation.summary ?? null;
    let summaryUpToCount: number = conversation.summaryUpToCount ?? 0;
    // resolvedTopics is stored pipe-delimited on the Conversation so we don't
    // need a new Prisma type for a small text list. Parsed back into an array
    // for injection into the lead's system prompt.
    let resolvedTopics: string[] = parseTopics(
      (conversation as { resolvedTopics?: string | null }).resolvedTopics,
    );
    const summarizableCount = Math.max(0, fullHistory.length - RECENT_WINDOW);
    const needsRefresh =
      summarizableCount > 0 &&
      summarizableCount - summaryUpToCount >= SUMMARY_REFRESH_INTERVAL;

    if (needsRefresh) {
      const newToFold = fullHistory.slice(summaryUpToCount, summarizableCount);
      try {
        const result = await this.aiLead.summarize({
          personaName: attempt.challenge.persona.name,
          existingSummary: priorSummary,
          existingResolvedTopics: resolvedTopics,
          newMessages: newToFold,
        });
        priorSummary = result.summary;
        resolvedTopics = result.resolvedTopics;
        summaryUpToCount = summarizableCount;
      } catch (err) {
        // Summarize failure is non-fatal — we just send a slightly longer
        // context this turn and try again next turn.
        this.logger.warn(`Summary refresh failed for attempt ${attempt.id}: ${(err as Error).message}`);
      }
    }

    const trimmedHistory = priorSummary && summaryUpToCount > 0
      ? fullHistory.slice(summaryUpToCount)
      : fullHistory;

    let leadReply: string;
    try {
      const raw = await this.aiLead.respond({
        personaName: attempt.challenge.persona.name,
        personaPrompt: attempt.challenge.persona.personalityPrompt,
        history: trimmedHistory,
        priorSummary: priorSummary ?? undefined,
        resolvedTopics,
        // fullHistory includes the message we're about to store plus every
        // prior turn from BOTH sides — accurate turn count for the
        // convergence bias in respond().
        turnCount: fullHistory.length,
        // No goalDescription here — the lead model must stay blind to the
        // salesperson's target so it can't cooperatively cave.
      });
      leadReply = raw.trim();
    } catch (err) {
      this.logger.error('AI lead failed to respond', err);
      throw new ServiceUnavailableException(
        'The AI lead is temporarily unavailable. Please try again in a moment.',
      );
    }

    // Goal + closure detection is a separate, low-temperature judge call. The
    // lead never saw the goal text. Closed=true means either party has walked
    // away ("goodbye", "I'm done here", "I don't want to work with you") — we
    // end the attempt so the user can't keep spamming messages into a dead
    // conversation. If the judge fails we fall back to {no, no}.
    let goalAchievedSignal = false;
    let conversationClosed = false;
    try {
      const verdict = await this.aiLead.evaluateGoal({
        personaName: attempt.challenge.persona.name,
        goalDescription: attempt.challenge.goalDescription,
        history: [...trimmedHistory, { sender: MessageSender.LEAD, content: leadReply }],
        priorSummary: priorSummary ?? undefined,
      });
      goalAchievedSignal = verdict.goalAchieved;
      conversationClosed = verdict.closed;
    } catch (err) {
      this.logger.warn(`Goal evaluator failed for attempt ${attempt.id}: ${(err as Error).message}`);
    }

    const messagesUsed = attempt.messagesUsed + 1;
    const reachedCap = messagesUsed >= attempt.challenge.maxMessages;
    const shouldComplete = reachedCap || goalAchievedSignal || conversationClosed;

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
      if (needsRefresh) {
        await tx.conversation.update({
          where: { id: conversationId },
          data: {
            summary: priorSummary,
            summaryUpToCount,
            resolvedTopics: resolvedTopics.length > 0 ? resolvedTopics.join('|') : null,
          },
        });
      }
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
