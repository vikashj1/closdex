import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PointsReason, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { AuthUser } from '../auth/jwt.strategy';

@Injectable()
export class UsersAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  /** Rich detail view for /admin/users/[id]. Includes salesperson profile
   *  when present, membership summary for companies, attempts + points
   *  headline numbers. Never leaks passwordHash. */
  async getById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        salesperson: true,
        companyMemberships: { include: { company: true } },
        oauthAccounts: { select: { provider: true, createdAt: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    const attemptsCount = user.salesperson
      ? await this.prisma.challengeAttempt.count({ where: { salespersonId: user.salesperson.id } })
      : 0;

    const { passwordHash, ...safe } = user;
    return { ...safe, attemptsCount };
  }

  /** Attempts timeline for the user detail page. Newest first, paginated. */
  async listAttempts(userId: string, page = 1, perPage = 20) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { salesperson: true },
    });
    if (!user) throw new NotFoundException('User not found.');
    if (!user.salesperson) return { items: [], total: 0, page, perPage };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.challengeAttempt.findMany({
        where: { salespersonId: user.salesperson.id },
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          status: true,
          goalAchieved: true,
          finalScore: true,
          quarantined: true,
          messagesUsed: true,
          startedAt: true,
          completedAt: true,
          challenge: { select: { id: true, title: true, difficulty: true } },
        },
      }),
      this.prisma.challengeAttempt.count({ where: { salespersonId: user.salesperson.id } }),
    ]);
    return { items, total, page, perPage };
  }

  async ban(actor: AuthUser, userId: string, reason?: string) {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found.');
    if (target.id === actor.id) throw new BadRequestException('You cannot ban yourself.');
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot ban another admin. Demote them first.');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date(), bannedReason: reason ?? null },
      select: { id: true, bannedAt: true, bannedReason: true },
    });
    await this.audit.log({ actorId: actor.id, action: 'USER_BAN', entity: 'User', entityId: userId, metadata: { reason } });
    return updated;
  }

  async unban(actor: AuthUser, userId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found.');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: null, bannedReason: null },
      select: { id: true, bannedAt: true, bannedReason: true },
    });
    await this.audit.log({ actorId: actor.id, action: 'USER_UNBAN', entity: 'User', entityId: userId, metadata: {} });
    return updated;
  }

  /** Soft-delete — anonymize email so the row no longer conflicts with a
   *  re-signup, mark deletedAt. Keeps attempts / transactions for audit. */
  async softDelete(actor: AuthUser, userId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found.');
    if (target.id === actor.id) throw new BadRequestException('You cannot delete yourself.');
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete another admin. Demote them first.');
    }
    const anonymizedEmail = `deleted-${userId}@closdex.local`;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: anonymizedEmail,
        name: 'Deleted user',
        photoUrl: null,
      },
      select: { id: true, deletedAt: true },
    });
    await this.audit.log({
      actorId: actor.id, action: 'USER_DELETE', entity: 'User', entityId: userId,
      metadata: { originalEmail: target.email },
    });
    return updated;
  }

  /** Manual points adjustment (add or subtract). Only meaningful for
   *  salespersons. Writes a PointsTransaction with ADMIN_ADJUSTMENT reason
   *  so the change shows up in the user's history + is fully auditable. */
  async adjustPoints(actor: AuthUser, userId: string, delta: number, reason?: string) {
    if (!Number.isInteger(delta) || delta === 0) {
      throw new BadRequestException('delta must be a non-zero integer.');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { salesperson: true },
    });
    if (!target) throw new NotFoundException('User not found.');
    if (!target.salesperson) {
      throw new BadRequestException('User has no salesperson profile — points not applicable.');
    }

    const nextTotal = Math.max(0, target.salesperson.totalPoints + delta);
    await this.prisma.$transaction([
      this.prisma.pointsTransaction.create({
        data: {
          salespersonId: target.salesperson.id,
          reason: PointsReason.ADMIN_ADJUSTMENT,
          points: delta,
        },
      }),
      this.prisma.salespersonProfile.update({
        where: { id: target.salesperson.id },
        data: { totalPoints: nextTotal },
      }),
    ]);
    await this.audit.log({
      actorId: actor.id, action: 'USER_POINTS_ADJUST', entity: 'User', entityId: userId,
      metadata: { delta, reason, newTotal: nextTotal },
    });
    return { id: userId, delta, newTotal: nextTotal };
  }

  /** Issues a JWT as the target user, with an `impersonatedBy` claim so the
   *  frontend can display a banner and offer an "exit impersonation" action.
   *  Guarded — admins cannot impersonate other admins. */
  async impersonate(actor: AuthUser, userId: string) {
    if (userId === actor.id) {
      throw new BadRequestException('You are already this user.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!target) throw new NotFoundException('User not found.');
    if (target.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot impersonate another admin.');
    }
    if (target.bannedAt || target.deletedAt) {
      throw new BadRequestException('Cannot impersonate banned or deleted users.');
    }
    const accessToken = this.jwt.sign({
      sub: target.id,
      email: target.email,
      role: target.role,
      impersonatedBy: actor.id,
    });
    await this.audit.log({ actorId: actor.id, action: 'USER_IMPERSONATE', entity: 'User', entityId: userId, metadata: {} });
    return {
      accessToken,
      user: { id: target.id, email: target.email, role: target.role },
      impersonatedBy: actor.id,
    };
  }
}
