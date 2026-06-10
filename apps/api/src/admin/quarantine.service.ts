import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PointsReason, Prisma } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { AuthUser } from '../auth/jwt.strategy';

interface ListParams {
  page?: number;
  perPage?: number;
}

@Injectable()
export class QuarantineService {
  private readonly logger = new Logger(QuarantineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  /** Paginated list of attempts currently held in quarantine. Newest first. */
  async list({ page = 1, perPage = 20 }: ListParams) {
    const skip = Math.max(0, (page - 1) * perPage);
    const where = { quarantined: true } as Prisma.ChallengeAttemptWhereInput;

    const [items, total] = await Promise.all([
      this.prisma.challengeAttempt.findMany({
        where,
        orderBy: { completedAt: 'desc' },
        skip,
        take: perPage,
        include: {
          challenge: { select: { id: true, title: true, difficulty: true, goalType: true } },
          salesperson: {
            select: {
              id: true,
              publicSlug: true,
              rank: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.challengeAttempt.count({ where }),
    ]);

    return {
      total,
      page,
      perPage,
      items: items.map((a) => ({
        id: a.id,
        attemptNumber: a.attemptNumber,
        suspicionScore: a.suspicionScore,
        suspicionFlags: a.suspicionFlags,
        finalScore: a.finalScore,
        completedAt: a.completedAt?.toISOString() ?? null,
        challenge: a.challenge,
        salesperson: {
          id: a.salesperson.id,
          publicSlug: a.salesperson.publicSlug,
          rank: a.salesperson.rank,
          name: a.salesperson.user.name,
          email: a.salesperson.user.email,
        },
      })),
    };
  }

  /** Full detail incl conversation transcript + client telemetry per message. */
  async get(attemptId: string) {
    const a = await this.prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: {
        challenge: { select: { id: true, title: true, difficulty: true, goalType: true } },
        salesperson: {
          select: {
            id: true,
            publicSlug: true,
            rank: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        conversation: {
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
    if (!a) throw new NotFoundException('Attempt not found.');
    return {
      id: a.id,
      attemptNumber: a.attemptNumber,
      status: a.status,
      quarantined: a.quarantined,
      suspicionScore: a.suspicionScore,
      suspicionFlags: a.suspicionFlags,
      finalScore: a.finalScore,
      scoreBreakdown: a.scoreBreakdown,
      completedAt: a.completedAt?.toISOString() ?? null,
      challenge: a.challenge,
      salesperson: {
        id: a.salesperson.id,
        publicSlug: a.salesperson.publicSlug,
        rank: a.salesperson.rank,
        name: a.salesperson.user.name,
        email: a.salesperson.user.email,
      },
      messages: (a.conversation?.messages ?? []).map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        clientMeta: m.clientMeta,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  /** Clear quarantine: un-flag, write the points transactions that were
   *  withheld at scoring time, push the score onto the leaderboard, log to
   *  audit. Idempotent — clearing a non-quarantined attempt is a no-op. */
  async clear(admin: AuthUser, attemptId: string, reason?: string) {
    const attempt = await this.prisma.challengeAttempt.findUnique({
      where: { id: attemptId },
      include: { challenge: { select: { category: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (!attempt.quarantined) {
      return { id: attempt.id, quarantined: false, action: 'noop' as const };
    }
    if (attempt.finalScore == null) {
      throw new BadRequestException('Attempt has no finalScore — cannot apply points.');
    }

    const finalScore = attempt.finalScore;

    await this.prisma.$transaction(async (tx) => {
      await tx.challengeAttempt.update({
        where: { id: attempt.id },
        data: { quarantined: false },
      });

      // Apply the withheld points as a single CHALLENGE_SCORE transaction.
      // We don't break it back out into base/bonus/penalty lines because the
      // breakdown is still on the attempt — the audit trail stays clean.
      if (finalScore !== 0) {
        await tx.pointsTransaction.create({
          data: {
            salespersonId: attempt.salespersonId,
            attemptId: attempt.id,
            reason: PointsReason.CHALLENGE_SCORE,
            points: finalScore,
          },
        });
      }

      const profile = await tx.salespersonProfile.findUnique({ where: { id: attempt.salespersonId } });
      if (profile) {
        await tx.salespersonProfile.update({
          where: { id: attempt.salespersonId },
          data: { totalPoints: Math.max(0, profile.totalPoints + finalScore) },
        });
      }
    });

    await this.leaderboards.recordScore(attempt.salespersonId, finalScore, attempt.challenge.category);

    await this.audit.log({
      actorId: admin.id,
      action: 'QUARANTINE_CLEAR',
      entity: 'challengeAttempt',
      entityId: attempt.id,
      metadata: { reason: reason ?? null, finalScore },
    });

    this.logger.warn(`Admin ${admin.email} cleared quarantine on attempt ${attempt.id} — +${finalScore} pts applied`);
    return { id: attempt.id, quarantined: false, action: 'cleared' as const, pointsApplied: finalScore };
  }

  /** Confirm cheat: keep the attempt quarantined and write an audit note.
   *  No score / leaderboard side-effects (those were already skipped at
   *  scoring time). Idempotent. */
  async confirm(admin: AuthUser, attemptId: string, reason?: string) {
    const attempt = await this.prisma.challengeAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (!attempt.quarantined) {
      throw new BadRequestException('Attempt is not quarantined.');
    }

    await this.audit.log({
      actorId: admin.id,
      action: 'QUARANTINE_CONFIRM',
      entity: 'challengeAttempt',
      entityId: attempt.id,
      metadata: { reason: reason ?? null },
    });

    this.logger.warn(`Admin ${admin.email} confirmed quarantine on attempt ${attempt.id}`);
    return { id: attempt.id, quarantined: true, action: 'confirmed' as const };
  }
}
