import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileVisibility, Rank, UserRole } from '@closdex/db';
import { TalentService } from './talent.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockPrisma = {
  salespersonProfile: {
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(async (arr) => Promise.all(arr)),
};

const companyViewer: AuthUser = { id: 'c-1', role: 'COMPANY' as any, email: 'c@test.com' };
const adminViewer: AuthUser   = { id: 'a-1', role: 'ADMIN'   as any, email: 'a@test.com' };
const spViewer: AuthUser      = { id: 's-1', role: 'SALESPERSON' as any, email: 's@test.com' };

const ALL_RANKS: Rank[] = [
  Rank.ROOKIE, Rank.BRONZE, Rank.SILVER, Rank.GOLD,
  Rank.PLATINUM, Rank.DIAMOND, Rank.MASTER, Rank.GRANDMASTER,
];

/** Captures the `where` arg passed to the most-recent findMany call. */
function capturedWhere() {
  return mockPrisma.salespersonProfile.findMany.mock.calls[0][0].where;
}

describe('TalentService', () => {
  let service: TalentService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default happy-path returns so callers don't get undefined errors
    mockPrisma.salespersonProfile.findMany.mockResolvedValue([]);
    mockPrisma.salespersonProfile.count.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TalentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TalentService>(TalentService);
  });

  // ---------------------------------------------------------------------------
  // search — access control
  // ---------------------------------------------------------------------------
  describe('search — access control', () => {
    it('1. throws ForbiddenException for SALESPERSON viewer', async () => {
      await expect(service.search(spViewer, {})).rejects.toThrow(ForbiddenException);
    });

    it('2. allows COMPANY viewer', async () => {
      await expect(service.search(companyViewer, {})).resolves.toBeDefined();
    });

    it('3. allows ADMIN viewer', async () => {
      await expect(service.search(adminViewer, {})).resolves.toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // search — filter building
  // ---------------------------------------------------------------------------
  describe('search — filter building', () => {
    it('4. no filters → only visibility: PUBLIC in where', async () => {
      await service.search(companyViewer, {});
      expect(capturedWhere()).toEqual({ visibility: ProfileVisibility.PUBLIC });
    });

    it('5. minRank = GOLD → rank.in = [GOLD, PLATINUM, DIAMOND, MASTER, GRANDMASTER]', async () => {
      await service.search(companyViewer, { minRank: Rank.GOLD });
      expect(capturedWhere().rank).toEqual({
        in: [Rank.GOLD, Rank.PLATINUM, Rank.DIAMOND, Rank.MASTER, Rank.GRANDMASTER],
      });
    });

    it('6. minRank = ROOKIE → rank.in = all 8 ranks', async () => {
      await service.search(companyViewer, { minRank: Rank.ROOKIE });
      expect(capturedWhere().rank).toEqual({ in: ALL_RANKS });
    });

    it('7. minPoints = 1000 → totalPoints.gte = 1000', async () => {
      await service.search(companyViewer, { minPoints: 1000 });
      expect(capturedWhere().totalPoints).toEqual({ gte: 1000 });
    });

    it("8. category = 'SaaS' → attempts.some.challenge.category = 'SaaS'", async () => {
      await service.search(companyViewer, { category: 'SaaS' });
      expect(capturedWhere().attempts).toEqual({
        some: { challenge: { category: 'SaaS' } },
      });
    });

    it("9. location = 'Bangalore' → user.location.contains = 'Bangalore' (insensitive)", async () => {
      await service.search(companyViewer, { location: 'Bangalore' });
      expect(capturedWhere().user).toEqual({
        location: { contains: 'Bangalore', mode: 'insensitive' },
      });
    });

    it('10. minExperienceYears = 3 → experienceYears.gte = 3', async () => {
      await service.search(companyViewer, { minExperienceYears: 3 });
      expect(capturedWhere().experienceYears).toEqual({ gte: 3 });
    });

    it('11. openToWork = true → openToWork: true in where', async () => {
      await service.search(companyViewer, { openToWork: true });
      expect(capturedWhere().openToWork).toBe(true);
    });

    it("12. specializationTags = ['IT Sales', 'Cloud'] → specializationTags.hasSome set", async () => {
      await service.search(companyViewer, { specializationTags: ['IT Sales', 'Cloud'] });
      expect(capturedWhere().specializationTags).toEqual({ hasSome: ['IT Sales', 'Cloud'] });
    });

    it('13. empty specializationTags = [] → specializationTags filter NOT added', async () => {
      await service.search(companyViewer, { specializationTags: [] });
      expect(capturedWhere().specializationTags).toBeUndefined();
    });

    it('14. all filters combined → all where conditions present simultaneously', async () => {
      await service.search(companyViewer, {
        minRank: Rank.SILVER,
        minPoints: 500,
        category: 'B2B',
        location: 'Mumbai',
        minExperienceYears: 2,
        openToWork: true,
        specializationTags: ['Enterprise'],
      });
      const where = capturedWhere();
      expect(where.visibility).toBe(ProfileVisibility.PUBLIC);
      expect(where.rank).toBeDefined();
      expect(where.totalPoints).toEqual({ gte: 500 });
      expect(where.attempts).toBeDefined();
      expect(where.user).toBeDefined();
      expect(where.experienceYears).toEqual({ gte: 2 });
      expect(where.openToWork).toBe(true);
      expect(where.specializationTags).toEqual({ hasSome: ['Enterprise'] });
    });
  });

  // ---------------------------------------------------------------------------
  // search — pagination
  // ---------------------------------------------------------------------------
  describe('search — pagination', () => {
    it('15. default page=1, perPage=20 → skip=0, take=20', async () => {
      await service.search(companyViewer, {});
      const call = mockPrisma.salespersonProfile.findMany.mock.calls[0][0];
      expect(call.skip).toBe(0);
      expect(call.take).toBe(20);
    });

    it('16. page=3, perPage=10 → skip=20, take=10', async () => {
      await service.search(companyViewer, { page: 3, perPage: 10 });
      const call = mockPrisma.salespersonProfile.findMany.mock.calls[0][0];
      expect(call.skip).toBe(20);
      expect(call.take).toBe(10);
    });

    it('returns page and perPage in the response envelope', async () => {
      mockPrisma.salespersonProfile.findMany.mockResolvedValue([{ id: 'p1' }]);
      mockPrisma.salespersonProfile.count.mockResolvedValue(1);
      const result = await service.search(companyViewer, { page: 2, perPage: 5 });
      expect(result).toMatchObject({ page: 2, perPage: 5, total: 1 });
      expect(result.items).toHaveLength(1);
    });
  });

  // ---------------------------------------------------------------------------
  // getBySlug — access control
  // ---------------------------------------------------------------------------
  describe('getBySlug — access control', () => {
    it('17. throws ForbiddenException for SALESPERSON viewer', async () => {
      await expect(service.getBySlug(spViewer, 'some-slug')).rejects.toThrow(ForbiddenException);
    });

    it('18. throws NotFoundException when findFirst returns null', async () => {
      mockPrisma.salespersonProfile.findFirst.mockResolvedValue(null);
      await expect(service.getBySlug(companyViewer, 'missing-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // getBySlug — stats computation
  // ---------------------------------------------------------------------------
  describe('getBySlug — stats computation', () => {
    const baseProfile = {
      id: 'p1',
      publicSlug: 'alice',
      rank: Rank.GOLD,
      totalPoints: 800,
      experienceYears: 4,
      specializationTags: ['SaaS'],
      openToWork: true,
      currentCompany: 'Acme',
      currentStreakDays: 5,
      resumeUrl: 'https://example.com/cv.pdf',
      user: { name: 'Alice', photoUrl: null, location: 'Delhi' },
    };

    it('19. 3 completed (2 wins) + 1 in-progress → winRate=67, completedAttempts=3, totalAttempts=4', async () => {
      mockPrisma.salespersonProfile.findFirst.mockResolvedValue({
        ...baseProfile,
        attempts: [
          { status: 'COMPLETED', goalAchieved: true },
          { status: 'COMPLETED', goalAchieved: true },
          { status: 'COMPLETED', goalAchieved: false },
          { status: 'IN_PROGRESS', goalAchieved: null },
        ],
      });

      const result = await service.getBySlug(companyViewer, 'alice');

      expect(result._stats).toEqual({
        totalAttempts: 4,
        completedAttempts: 3,
        winRate: 67,
      });
    });

    it('20. 0 completed attempts → winRate=0 (no division-by-zero)', async () => {
      mockPrisma.salespersonProfile.findFirst.mockResolvedValue({
        ...baseProfile,
        attempts: [],
      });

      const result = await service.getBySlug(adminViewer, 'alice');

      expect(result._stats).toEqual({
        totalAttempts: 0,
        completedAttempts: 0,
        winRate: 0,
      });
    });

    it('21. attempts field is NOT present in the returned object', async () => {
      mockPrisma.salespersonProfile.findFirst.mockResolvedValue({
        ...baseProfile,
        attempts: [{ status: 'COMPLETED', goalAchieved: true }],
      });

      const result = await service.getBySlug(companyViewer, 'alice');

      expect(result).not.toHaveProperty('attempts');
    });

    it('22. _stats object is present with correct shape', async () => {
      mockPrisma.salespersonProfile.findFirst.mockResolvedValue({
        ...baseProfile,
        attempts: [
          { status: 'COMPLETED', goalAchieved: true },
          { status: 'COMPLETED', goalAchieved: false },
        ],
      });

      const result = await service.getBySlug(companyViewer, 'alice');

      expect(result).toHaveProperty('_stats');
      expect(result._stats).toMatchObject({
        totalAttempts: expect.any(Number),
        completedAttempts: expect.any(Number),
        winRate: expect.any(Number),
      });
      // Verify correct values as well
      expect(result._stats.totalAttempts).toBe(2);
      expect(result._stats.completedAttempts).toBe(2);
      expect(result._stats.winRate).toBe(50);
    });
  });
});
