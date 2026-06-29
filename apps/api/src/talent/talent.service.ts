import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProfileVisibility, Rank, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { SearchTalentDto } from './dto/search-talent.dto';
import { ProfileViewsService } from './profile-views.service';

const RANK_ORDER: Rank[] = [
  Rank.ROOKIE, Rank.BRONZE, Rank.SILVER, Rank.GOLD,
  Rank.PLATINUM, Rank.DIAMOND, Rank.MASTER, Rank.GRANDMASTER,
];

/** Decay the stored currentStreakDays on read. The streak is only mutated
 *  by scoring.updateStreak when a challenge completes, so between attempts
 *  the stored value goes stale. A gap of 2+ calendar days breaks the
 *  streak; 0–1 day gaps keep it (1 day = at-risk-but-alive). */
function effectiveStreakDays(stored: number, lastChallengeDate: Date | null): number {
  if (!lastChallengeDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastChallengeDate);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (24 * 3600 * 1000));
  if (diffDays <= 1) return stored;
  return 0;
}

@Injectable()
export class TalentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileViews: ProfileViewsService,
  ) {}

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
    const userFilter: Record<string, unknown> = {};
    if (query.location) {
      userFilter.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.search) {
      userFilter.name = { contains: query.search, mode: 'insensitive' };
    }
    if (Object.keys(userFilter).length > 0) {
      where.user = userFilter as Prisma.UserWhereInput;
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

  /** No auth required — for shareable public profile links */
  async getPublicBySlug(slug: string) {
    const profile = await this.prisma.salespersonProfile.findFirst({
      where: { publicSlug: slug, visibility: ProfileVisibility.PUBLIC },
      select: {
        id: true,
        publicSlug: true,
        rank: true,
        totalPoints: true,
        experienceYears: true,
        specializationTags: true,
        openToWork: true,
        currentCompany: true,
        currentStreakDays: true,
        lastChallengeDate: true,
        resumeUrl: true,
        user: { select: { name: true, photoUrl: true, location: true } },
        attempts: {
          where: { status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
          select: { status: true, goalAchieved: true },
        },
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'desc' },
        },
      },
    });

    if (!profile) throw new NotFoundException('Talent profile not found.');

    const completed = profile.attempts.filter((a) => a.status === 'COMPLETED');
    const wins = completed.filter((a) => a.goalAchieved === true);
    const winRate = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 0;

    const { attempts, badges, lastChallengeDate, ...rest } = profile;
    return {
      ...rest,
      currentStreakDays: effectiveStreakDays(rest.currentStreakDays, lastChallengeDate),
      badges: badges.map((ub) => ({ ...ub.badge, awardedAt: ub.awardedAt })),
      _stats: {
        totalAttempts: profile.attempts.length,
        completedAttempts: completed.length,
        winRate,
      },
    };
  }

  async getBySlug(viewer: AuthUser, slug: string) {
    if (viewer.role !== UserRole.COMPANY && viewer.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only company users can view talent profiles.');
    }

    const profile = await this.prisma.salespersonProfile.findFirst({
      where: { publicSlug: slug, visibility: ProfileVisibility.PUBLIC },
      select: {
        id: true,
        publicSlug: true,
        rank: true,
        totalPoints: true,
        experienceYears: true,
        specializationTags: true,
        openToWork: true,
        currentCompany: true,
        currentStreakDays: true,
        lastChallengeDate: true,
        resumeUrl: true,
        user: { select: { name: true, photoUrl: true, location: true } },
        attempts: {
          where: { status: { in: ['COMPLETED', 'IN_PROGRESS'] } },
          select: { status: true, goalAchieved: true },
        },
      },
    });

    if (!profile) throw new NotFoundException('Talent profile not found.');

    // Record the view — fire and forget, never block the response
    void this.profileViews.recordView(profile.id, viewer);

    const completed = profile.attempts.filter((a) => a.status === 'COMPLETED');
    const wins = completed.filter((a) => a.goalAchieved === true);
    const winRate = completed.length > 0 ? Math.round((wins.length / completed.length) * 100) : 0;

    const { attempts, lastChallengeDate, ...rest } = profile;
    return {
      ...rest,
      currentStreakDays: effectiveStreakDays(rest.currentStreakDays, lastChallengeDate),
      _stats: {
        totalAttempts: profile.attempts.length,
        completedAttempts: completed.length,
        winRate,
      },
    };
  }
}
