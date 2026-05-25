import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async platformStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalSalespersons,
      totalCompanies,
      totalAdmins,
      totalChallenges,
      publishedChallenges,
      totalAttempts,
      attemptsThisWeek,
      completedThisWeek,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.SALESPERSON } }),
      this.prisma.user.count({ where: { role: UserRole.COMPANY } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.challenge.count(),
      this.prisma.challenge.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.challengeAttempt.count(),
      this.prisma.challengeAttempt.count({ where: { startedAt: { gte: weekAgo } } }),
      this.prisma.challengeAttempt.count({ where: { status: 'COMPLETED', completedAt: { gte: weekAgo } } }),
    ]);

    return {
      users: { salespersons: totalSalespersons, companies: totalCompanies, admins: totalAdmins },
      challenges: { total: totalChallenges, published: publishedChallenges },
      attempts: { total: totalAttempts, thisWeek: attemptsThisWeek, completedThisWeek },
    };
  }

  async listUsers(query: { role?: UserRole; search?: string; page?: number; perPage?: number }) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 25;
    const where: Prisma.UserWhereInput = {};

    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          salesperson: { select: { totalPoints: true, rank: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, perPage };
  }

  async updateUserRole(userId: string, role: UserRole) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }
}
