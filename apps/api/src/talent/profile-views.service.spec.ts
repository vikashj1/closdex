import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@closdex/db';
import { ProfileViewsService } from './profile-views.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockPrisma = {
  salespersonProfile: { findUnique: jest.fn() },
  profileView: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  companyMembership: { findFirst: jest.fn() },
};

const salesperson: AuthUser = { id: 'user-sp', email: 'sp@test.com', role: UserRole.SALESPERSON };
const companyUser: AuthUser = { id: 'user-co', email: 'co@test.com', role: UserRole.COMPANY };

describe('ProfileViewsService', () => {
  let service: ProfileViewsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileViewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProfileViewsService>(ProfileViewsService);
  });

  // ─── recordView ───────────────────────────────────────────────────────────

  describe('recordView', () => {
    it('creates a view with null viewerUserId when viewer is null', async () => {
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', null);

      expect(mockPrisma.profileView.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.profileView.create).toHaveBeenCalledWith({
        data: { salespersonId: 'sp-1', viewerUserId: null, viewerCompany: null },
      });
    });

    it('skips creation when viewer already viewed within the last hour (dedup)', async () => {
      mockPrisma.profileView.findFirst.mockResolvedValue({ id: 'existing-view' });

      await service.recordView('sp-1', salesperson);

      expect(mockPrisma.profileView.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ salespersonId: 'sp-1', viewerUserId: salesperson.id }),
        }),
      );
      expect(mockPrisma.profileView.create).not.toHaveBeenCalled();
    });

    it('creates view on first-time view from a SALESPERSON (no recent record)', async () => {
      mockPrisma.profileView.findFirst.mockResolvedValue(null);
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', salesperson);

      expect(mockPrisma.profileView.create).toHaveBeenCalledWith({
        data: { salespersonId: 'sp-1', viewerUserId: salesperson.id, viewerCompany: null },
      });
    });

    it('does not look up company membership for a SALESPERSON viewer', async () => {
      mockPrisma.profileView.findFirst.mockResolvedValue(null);
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', salesperson);

      expect(mockPrisma.companyMembership.findFirst).not.toHaveBeenCalled();
    });

    it('fetches company membership and includes company name for a COMPANY viewer', async () => {
      mockPrisma.profileView.findFirst.mockResolvedValue(null);
      mockPrisma.companyMembership.findFirst.mockResolvedValue({
        company: { name: 'Acme Corp' },
      });
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', companyUser);

      expect(mockPrisma.companyMembership.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: companyUser.id } }),
      );
      expect(mockPrisma.profileView.create).toHaveBeenCalledWith({
        data: { salespersonId: 'sp-1', viewerUserId: companyUser.id, viewerCompany: 'Acme Corp' },
      });
    });

    it('sets viewerCompany to null when COMPANY viewer has no membership', async () => {
      mockPrisma.profileView.findFirst.mockResolvedValue(null);
      mockPrisma.companyMembership.findFirst.mockResolvedValue(null);
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', companyUser);

      expect(mockPrisma.profileView.create).toHaveBeenCalledWith({
        data: { salespersonId: 'sp-1', viewerUserId: companyUser.id, viewerCompany: null },
      });
    });

    it('passes a viewedAt gte filter roughly 1 hour in the past for dedup check', async () => {
      const before = Date.now() - 60 * 60 * 1000;
      mockPrisma.profileView.findFirst.mockResolvedValue(null);
      mockPrisma.profileView.create.mockResolvedValue({});

      await service.recordView('sp-1', salesperson);

      const call = mockPrisma.profileView.findFirst.mock.calls[0][0];
      const gte: Date = call.where.viewedAt.gte;
      expect(gte.getTime()).toBeGreaterThanOrEqual(before - 100);
      expect(gte.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  // ─── listForMe ────────────────────────────────────────────────────────────

  describe('listForMe', () => {
    it('returns [] when no salesperson profile is found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      const result = await service.listForMe('user-1');

      expect(result).toEqual([]);
      expect(mockPrisma.profileView.findMany).not.toHaveBeenCalled();
    });

    it('returns mapped view objects with correct shape when views exist', async () => {
      const profile = { id: 'profile-1' };
      const views = [
        {
          id: 'view-1',
          viewedAt: new Date('2026-05-22T10:00:00Z'),
          viewerCompany: 'Beta Inc',
          viewerUser: { name: 'Bob', photoUrl: 'https://img/bob.jpg', role: UserRole.COMPANY },
        },
        {
          id: 'view-2',
          viewedAt: new Date('2026-05-22T09:00:00Z'),
          viewerCompany: null,
          viewerUser: null,
        },
      ];

      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(profile);
      mockPrisma.profileView.findMany.mockResolvedValue(views);

      const result = await service.listForMe('user-1');

      expect(result).toEqual([
        {
          id: 'view-1',
          viewedAt: views[0].viewedAt,
          viewerCompany: 'Beta Inc',
          viewerName: 'Bob',
          viewerRole: UserRole.COMPANY,
          viewerPhotoUrl: 'https://img/bob.jpg',
        },
        {
          id: 'view-2',
          viewedAt: views[1].viewedAt,
          viewerCompany: null,
          viewerName: null,
          viewerRole: null,
          viewerPhotoUrl: null,
        },
      ]);
    });

    it('queries views ordered by viewedAt desc and limited to 20', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      mockPrisma.profileView.findMany.mockResolvedValue([]);

      await service.listForMe('user-1');

      expect(mockPrisma.profileView.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { viewedAt: 'desc' },
          take: 20,
        }),
      );
    });
  });

  // ─── countRecent ──────────────────────────────────────────────────────────

  describe('countRecent', () => {
    it('returns 0 when no salesperson profile is found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      const result = await service.countRecent('user-1');

      expect(result).toBe(0);
      expect(mockPrisma.profileView.count).not.toHaveBeenCalled();
    });

    it('returns count from prisma when profile exists', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      mockPrisma.profileView.count.mockResolvedValue(7);

      const result = await service.countRecent('user-1');

      expect(result).toBe(7);
      expect(mockPrisma.profileView.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ salespersonId: 'profile-1' }),
        }),
      );
    });

    it('passes a viewedAt gte filter roughly 30 days in the past', async () => {
      const before = Date.now() - 30 * 24 * 60 * 60 * 1000;
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'profile-1' });
      mockPrisma.profileView.count.mockResolvedValue(0);

      await service.countRecent('user-1');

      const call = mockPrisma.profileView.count.mock.calls[0][0];
      const gte: Date = call.where.viewedAt.gte;
      expect(gte.getTime()).toBeGreaterThanOrEqual(before - 100);
      expect(gte.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
