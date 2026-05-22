import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { UserRole } from '@closdex/db';

const actor: AuthUser = { id: 'actor-1', email: 'admin@test.com', role: UserRole.ADMIN as any };

const mockPrisma = {
  badge: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  salespersonProfile: {
    findUnique: jest.fn(),
  },
  userBadge: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BadgesService', () => {
  let service: BadgesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BadgesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    jest.clearAllMocks();
  });

  // ─── listDefinitions ─────────────────────────────────────────────────────

  describe('listDefinitions', () => {
    it('calls prisma.badge.findMany with orderBy name asc', async () => {
      const badges = [{ id: 'b1', name: 'Alpha' }, { id: 'b2', name: 'Beta' }];
      mockPrisma.badge.findMany.mockResolvedValue(badges);

      const result = await service.listDefinitions();

      expect(mockPrisma.badge.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
      expect(result).toBe(badges);
    });

    it('returns empty array when no badges exist', async () => {
      mockPrisma.badge.findMany.mockResolvedValue([]);
      const result = await service.listDefinitions();
      expect(result).toEqual([]);
    });
  });

  // ─── listEarned ──────────────────────────────────────────────────────────

  describe('listEarned', () => {
    it('returns [] when salesperson profile not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      const result = await service.listEarned('user-99');

      expect(result).toEqual([]);
      expect(mockPrisma.salespersonProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-99' },
        include: { badges: { include: { badge: true }, orderBy: { awardedAt: 'desc' } } },
      });
    });

    it('returns mapped badges with awardedAt when profile is found', async () => {
      const awardedAt = new Date('2026-01-01');
      const badge = { id: 'b1', name: 'Top Closer', code: 'TOP_CLOSER' };
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({
        id: 'sp-1',
        badges: [{ badge, awardedAt }],
      });

      const result = await service.listEarned('user-1');

      expect(result).toEqual([{ ...badge, awardedAt }]);
    });

    it('returns empty array when profile has no badges', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1', badges: [] });

      const result = await service.listEarned('user-1');

      expect(result).toEqual([]);
    });
  });

  // ─── createDefinition ────────────────────────────────────────────────────

  describe('createDefinition', () => {
    it('throws BadRequestException if badge code already exists', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue({ id: 'b1', code: 'DUP' });

      await expect(
        service.createDefinition(actor, { code: 'DUP', name: 'Duplicate' } as any),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrisma.badge.create).not.toHaveBeenCalled();
    });

    it('includes the code in the error message on duplicate', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue({ id: 'b1', code: 'DUP' });

      await expect(
        service.createDefinition(actor, { code: 'DUP', name: 'Duplicate' } as any),
      ).rejects.toThrow("Badge code 'DUP' already exists.");
    });

    it('creates and returns a badge when code is new', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue(null);
      const created = { id: 'b2', code: 'NEW', name: 'New Badge' };
      mockPrisma.badge.create.mockResolvedValue(created);

      const result = await service.createDefinition(actor, { code: 'NEW', name: 'New Badge' } as any);

      expect(mockPrisma.badge.create).toHaveBeenCalledWith({ data: { code: 'NEW', name: 'New Badge' } });
      expect(result).toBe(created);
    });
  });

  // ─── award ───────────────────────────────────────────────────────────────

  describe('award', () => {
    it('throws NotFoundException if badge not found', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue(null);
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1' });

      await expect(service.award(actor, 'b-missing', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.award(actor, 'b-missing', 'user-1')).rejects.toThrow('Badge not found.');
    });

    it('throws NotFoundException if salesperson profile not found', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue({ id: 'b1' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      await expect(service.award(actor, 'b1', 'user-missing')).rejects.toThrow(NotFoundException);
      await expect(service.award(actor, 'b1', 'user-missing')).rejects.toThrow(
        'Salesperson profile not found.',
      );
    });

    it('throws BadRequestException on duplicate award (prisma create throws)', async () => {
      mockPrisma.badge.findUnique.mockResolvedValue({ id: 'b1' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1' });
      mockPrisma.userBadge.create.mockRejectedValue(new Error('Unique constraint'));

      await expect(service.award(actor, 'b1', 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.award(actor, 'b1', 'user-1')).rejects.toThrow(
        'User already has this badge.',
      );
    });

    it('returns the created UserBadge on success', async () => {
      const badge = { id: 'b1', name: 'Top Closer' };
      const profile = { id: 'sp-1' };
      const userBadge = { id: 'ub-1', badgeId: 'b1', salespersonId: 'sp-1', badge };
      mockPrisma.badge.findUnique.mockResolvedValue(badge);
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(profile);
      mockPrisma.userBadge.create.mockResolvedValue(userBadge);

      const result = await service.award(actor, 'b1', 'user-1');

      expect(mockPrisma.userBadge.create).toHaveBeenCalledWith({
        data: { badgeId: 'b1', salespersonId: 'sp-1' },
        include: { badge: true },
      });
      expect(result).toBe(userBadge);
    });
  });

  // ─── revoke ──────────────────────────────────────────────────────────────

  describe('revoke', () => {
    it('throws NotFoundException if salesperson profile not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      await expect(service.revoke(actor, 'b1', 'user-missing')).rejects.toThrow(NotFoundException);
      await expect(service.revoke(actor, 'b1', 'user-missing')).rejects.toThrow(
        'Salesperson profile not found.',
      );
    });

    it('throws NotFoundException if user does not have the badge', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1' });
      mockPrisma.userBadge.findUnique.mockResolvedValue(null);

      await expect(service.revoke(actor, 'b1', 'user-1')).rejects.toThrow(NotFoundException);
      await expect(service.revoke(actor, 'b1', 'user-1')).rejects.toThrow(
        'User does not have this badge.',
      );
    });

    it('deletes the UserBadge and returns { success: true }', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1' });
      mockPrisma.userBadge.findUnique.mockResolvedValue({ id: 'ub-1' });
      mockPrisma.userBadge.delete.mockResolvedValue({ id: 'ub-1' });

      const result = await service.revoke(actor, 'b1', 'user-1');

      expect(mockPrisma.userBadge.findUnique).toHaveBeenCalledWith({
        where: { salespersonId_badgeId: { salespersonId: 'sp-1', badgeId: 'b1' } },
      });
      expect(mockPrisma.userBadge.delete).toHaveBeenCalledWith({ where: { id: 'ub-1' } });
      expect(result).toEqual({ success: true });
    });
  });
});
