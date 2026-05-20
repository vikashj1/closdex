import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, ProfileVisibility, Rank, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { SearchTalentDto } from './dto/search-talent.dto';

const RANK_ORDER: Rank[] = [
  Rank.ROOKIE, Rank.BRONZE, Rank.SILVER, Rank.GOLD,
  Rank.PLATINUM, Rank.DIAMOND, Rank.MASTER, Rank.GRANDMASTER,
];

@Injectable()
export class TalentService {
  constructor(private readonly prisma: PrismaService) {}

  /** Company-side talent discovery. Only PUBLIC profiles are returned. */
  async search(viewer: AuthUser, query: SearchTalentDto) {
    if (viewer.role !== UserRole.COMPANY && viewer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only company users can search talent.');
    }

    const where: Prisma.SalespersonProfileWhereInput = {
      visibility: ProfileVisibility.PUBLIC,
    };

    if (query.minRank) {
      const idx = RANK_ORDER.indexOf(query.minRank);
      where.rank = { in: RANK_ORDER.slice(idx) };
    }
    if (query.minPoints !== undefined) {
      where.totalPoints = { gte: query.minPoints };
    }
    if (query.category) {
      where.attempts = { some: { challenge: { category: query.category } } };
    }
    if (query.location) {
      where.user = { location: { contains: query.location, mode: 'insensitive' } };
    }
    if (query.minExperienceYears !== undefined) {
      where.experienceYears = { gte: query.minExperienceYears };
    }
    if (query.openToWork) {
      where.openToWork = true;
    }
    if (query.specializationTags && query.specializationTags.length > 0) {
      where.specializationTags = { hasSome: query.specializationTags };
    }

    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.salespersonProfile.findMany({
        where,
        orderBy: [{ totalPoints: 'desc' }, { rank: 'desc' }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          publicSlug: true,
          rank: true,
          totalPoints: true,
          experienceYears: true,
          specializationTags: true,
          openToWork: true,
          currentCompany: true,
          user: { select: { name: true, photoUrl: true, location: true } },
        },
      }),
      this.prisma.salespersonProfile.count({ where }),
    ]);

    return { items, total, page, perPage };
  }
}
