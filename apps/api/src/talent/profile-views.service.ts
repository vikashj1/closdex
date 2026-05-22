import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { UserRole } from '@closdex/db';

@Injectable()
export class ProfileViewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Record a view — deduplicated per viewer+salesperson within 1 hour. */
  async recordView(salespersonId: string, viewer: AuthUser | null) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Skip if same viewer already viewed in the last hour
    if (viewer) {
      const recent = await this.prisma.profileView.findFirst({
        where: { salespersonId, viewerUserId: viewer.id, viewedAt: { gte: oneHourAgo } },
      });
      if (recent) return;
    }

    let viewerCompany: string | undefined;
    if (viewer && viewer.role === UserRole.COMPANY) {
      const membership = await this.prisma.companyMembership.findFirst({
        where: { userId: viewer.id },
        include: { company: { select: { name: true } } },
      });
      viewerCompany = membership?.company.name;
    }

    await this.prisma.profileView.create({
      data: {
        salespersonId,
        viewerUserId: viewer?.id ?? null,
        viewerCompany: viewerCompany ?? null,
      },
    });
  }

  /** List recent viewers for the logged-in salesperson. Returns last 20. */
  async listForMe(userId: string) {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const views = await this.prisma.profileView.findMany({
      where: { salespersonId: profile.id },
      orderBy: { viewedAt: 'desc' },
      take: 20,
      include: {
        viewerUser: { select: { name: true, photoUrl: true, role: true } },
      },
    });

    return views.map(v => ({
      id: v.id,
      viewedAt: v.viewedAt,
      viewerCompany: v.viewerCompany,
      viewerName: v.viewerUser?.name ?? null,
      viewerRole: v.viewerUser?.role ?? null,
      viewerPhotoUrl: v.viewerUser?.photoUrl ?? null,
    }));
  }

  /** Total unique viewers in the last 30 days. */
  async countRecent(userId: string) {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId } });
    if (!profile) return 0;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.prisma.profileView.count({
      where: { salespersonId: profile.id, viewedAt: { gte: since } },
    });
  }
}
