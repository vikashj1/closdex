import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DisputeStatus, PointsReason, Prisma, UserRole,
} from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { AuditService } from './audit.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto, DisputeAction } from './dto/resolve-dispute.dto';
import { ListDisputesDto } from './dto/list-disputes.dto';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly leaderboards: LeaderboardsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Salesperson flags a score for review. One open dispute per attempt. */
  async create(viewer: AuthUser, dto: CreateDisputeDto) {
    if (viewer.role !== UserRole.SALESPERSON) {
      throw new ForbiddenException('Only salespeople can file score disputes.');
    }
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!profile) throw new NotFoundException('Salesperson profile missing.');

    const attempt = await this.prisma.challengeAttempt.findUnique({ where: { id: dto.attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found.');
    if (attempt.salespersonId !== profile.id) {
      throw new ForbiddenException('You can only dispute your own attempts.');
    }
    if (attempt.finalScore === null) {
      throw new BadRequestException('Attempt has not been scored yet.');
    }

    const existing = await this.prisma.scoreDispute.findUnique({
      where: { attemptId: dto.attemptId },
    });
    if (existing) {
      throw new BadRequestException('A dispute already exists for this attempt.');
    }

    return this.prisma.scoreDispute.create({
      data: {
        attemptId: dto.attemptId,
        salespersonId: profile.id,
        reason: dto.reason,
      },
    });
  }

  async listMine(viewer: AuthUser) {
    if (viewer.role !== UserRole.SALESPERSON) return [];
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!profile) return [];
    return this.prisma.scoreDispute.findMany({
      where: { salespersonId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        attempt: {
          select: {
            id: true,
            finalScore: true,
            challengeId: true,
            // Frontend's DisputeSummary expects attempt.challenge.{id,title} on
            // the My Disputes page; without this nested include the page
            // crashed reading d.attempt.challenge.title on render.
            challenge: { select: { id: true, title: true } },
          },
        },
      },
    });
  }

  async adminList(query: ListDisputesDto) {
    const where: Prisma.ScoreDisputeWhereInput = {};
    if (query.status) where.status = query.status;
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.scoreDispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          salesperson: { select: { id: true, publicSlug: true, user: { select: { name: true } } } },
          attempt: { select: { id: true, finalScore: true, challengeId: true } },
        },
      }),
      this.prisma.scoreDispute.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  async adminGet(id: string) {
    const dispute = await this.prisma.scoreDispute.findUnique({
      where: { id },
      include: {
        salesperson: { include: { user: { select: { name: true, email: true } } } },
        attempt: {
          include: {
            challenge: { select: { id: true, title: true, difficulty: true, category: true } },
            conversation: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found.');
    return dispute;
  }

  /** ADJUST: writes ADMIN_ADJUSTMENT PointsTransaction = newScore − oldScore;
   *  REJECT: just marks the dispute REJECTED. Both write an AdminAuditLog entry. */
  async adminResolve(actor: AuthUser, id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.scoreDispute.findUnique({
      where: { id }, include: { attempt: true },
    });
    if (!dispute) throw new NotFoundException('Dispute not found.');
    if (dispute.status === DisputeStatus.RESOLVED || dispute.status === DisputeStatus.REJECTED) {
      throw new BadRequestException(`Dispute already ${dispute.status}.`);
    }
    if (dto.action === 'ADJUST' && dto.newScore === undefined) {
      throw new BadRequestException('newScore is required when action=ADJUST.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = dto.action === 'ADJUST' ? DisputeStatus.RESOLVED : DisputeStatus.REJECTED;
      const resolved = await tx.scoreDispute.update({
        where: { id },
        data: { status: next, resolution: dto.resolution, resolvedAt: new Date() },
      });

      if (dto.action === 'ADJUST') {
        const oldScore = dispute.attempt.finalScore ?? 0;
        const delta = (dto.newScore ?? 0) - oldScore;
        await tx.challengeAttempt.update({
          where: { id: dispute.attemptId },
          data: { finalScore: dto.newScore },
        });
        if (delta !== 0) {
          await tx.pointsTransaction.create({
            data: {
              salespersonId: dispute.salespersonId,
              attemptId: dispute.attemptId,
              reason: PointsReason.ADMIN_ADJUSTMENT,
              points: delta,
            },
          });
          const profile = await tx.salespersonProfile.findUnique({ where: { id: dispute.salespersonId } });
          if (profile) {
            await tx.salespersonProfile.update({
              where: { id: dispute.salespersonId },
              data: { totalPoints: Math.max(0, profile.totalPoints + delta) },
            });
          }
        }
      }

      await this.audit.log(
        {
          actorId: actor.id,
          action: dto.action === 'ADJUST' ? 'DISPUTE_ADJUSTED' : 'DISPUTE_REJECTED',
          entity: 'ScoreDispute',
          entityId: id,
          metadata: {
            resolution: dto.resolution,
            ...(dto.action === 'ADJUST' ? { newScore: dto.newScore } : {}),
          },
        },
        tx,
      );

      return resolved;
    });

    // Best-effort leaderboard sync on adjustment — outside the tx since Redis can fail.
    if (dto.action === 'ADJUST') {
      const delta = (dto.newScore ?? 0) - (dispute.attempt.finalScore ?? 0);
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: dispute.attempt.challengeId },
        select: { category: true },
      });
      if (challenge && delta !== 0) {
        await this.leaderboards.recordScore(dispute.salespersonId, delta, challenge.category);
      }
    }

    // Notify the salesperson of the resolution.
    const profile = await this.prisma.salespersonProfile.findUnique({
      where: { id: dispute.salespersonId },
      select: { userId: true },
    });
    if (profile) {
      const isAdjust = dto.action === 'ADJUST';
      await this.notifications.notify({
        userId: profile.userId,
        type: isAdjust ? 'DISPUTE_RESOLVED' : 'DISPUTE_REJECTED',
        title: isAdjust ? 'Your score dispute was resolved' : 'Your score dispute was rejected',
        body: isAdjust
          ? `An admin adjusted your score to ${dto.newScore}. Note: ${dto.resolution}`
          : `An admin reviewed your dispute and declined to adjust the score. Note: ${dto.resolution}`,
        payload: { disputeId: id, attemptId: dispute.attemptId },
      });
    }

    return updated;
  }
}
