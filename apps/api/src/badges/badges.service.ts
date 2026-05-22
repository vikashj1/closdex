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
