import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { CreateBadgeDto } from './dto/create-badge.dto';

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  listDefinitions() {
    return this.prisma.badge.findMany({ orderBy: { name: 'asc' } });
  }

  async listEarned(userId: string) {
    const profile = await this.prisma.salespersonProfile.findUnique({
      where: { userId },
      include: { badges: { include: { badge: true }, orderBy: { awardedAt: 'desc' } } },
    });
    if (!profile) return [];
    return profile.badges.map(ub => ({ ...ub.badge, awardedAt: ub.awardedAt }));
  }

  async listEarnedByProfileId(salespersonId: string) {
    const ubs = await this.prisma.userBadge.findMany({
      where: { salespersonId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
    return ubs.map(ub => ({ ...ub.badge, awardedAt: ub.awardedAt }));
  }

  async createDefinition(_actor: AuthUser, dto: CreateBadgeDto) {
    const existing = await this.prisma.badge.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException(`Badge code '${dto.code}' already exists.`);
    return this.prisma.badge.create({ data: dto });
  }

  /** Edit a badge definition. `code` is immutable (it's the stable slug the
   *  scoring engine looks up by). Only name / description / iconUrl are
   *  updatable so we don't accidentally rewrite awards' meaning. */
  async updateDefinition(
    _actor: AuthUser,
    badgeId: string,
    patch: { name?: string; description?: string; iconUrl?: string | null },
  ) {
    const existing = await this.prisma.badge.findUnique({ where: { id: badgeId } });
    if (!existing) throw new NotFoundException('Badge not found.');
    return this.prisma.badge.update({
      where: { id: badgeId },
      data: {
        ...(patch.name != null ? { name: patch.name } : {}),
        ...(patch.description != null ? { description: patch.description } : {}),
        ...(patch.iconUrl !== undefined ? { iconUrl: patch.iconUrl } : {}),
      },
    });
  }

  /** Delete a badge definition. Refuses if any UserBadge references it so
   *  we don't wipe earned-history when someone typos a code. Admin must
   *  explicitly revoke every award first (or we could add a cascade flag
   *  later; keep the safer default for now). */
  async deleteDefinition(_actor: AuthUser, badgeId: string) {
    const badge = await this.prisma.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge not found.');
    const awardedCount = await this.prisma.userBadge.count({ where: { badgeId } });
    if (awardedCount > 0) {
      throw new BadRequestException(
        `Cannot delete — ${awardedCount} user(s) have this badge. Revoke all awards first.`,
      );
    }
    await this.prisma.badge.delete({ where: { id: badgeId } });
    return { success: true };
  }

  async award(_actor: AuthUser, badgeId: string, userId: string) {
    const [badge, profile] = await Promise.all([
      this.prisma.badge.findUnique({ where: { id: badgeId } }),
      this.prisma.salespersonProfile.findUnique({ where: { userId } }),
    ]);
    if (!badge) throw new NotFoundException('Badge not found.');
    if (!profile) throw new NotFoundException('Salesperson profile not found.');
    try {
      return await this.prisma.userBadge.create({
        data: { badgeId, salespersonId: profile.id },
        include: { badge: true },
      });
    } catch {
      throw new BadRequestException('User already has this badge.');
    }
  }

  async revoke(_actor: AuthUser, badgeId: string, userId: string) {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Salesperson profile not found.');
    const ub = await this.prisma.userBadge.findUnique({
      where: { salespersonId_badgeId: { salespersonId: profile.id, badgeId } },
    });
    if (!ub) throw new NotFoundException('User does not have this badge.');
    await this.prisma.userBadge.delete({ where: { id: ub.id } });
    return { success: true };
  }
}
