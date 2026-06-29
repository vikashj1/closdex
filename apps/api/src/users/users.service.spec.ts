import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: { findUnique: jest.fn(), update: jest.fn() },
  salespersonProfile: { findUnique: jest.fn(), update: jest.fn() },
};

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'SALESPERSON',
  passwordHash: 'hashed-secret',
  salesperson: { id: 'sp-1', userId: 'user-1', bio: 'Sales pro', currentStreakDays: 0, lastChallengeDate: null },
  companyMemberships: [
    { id: 'mem-1', companyId: 'co-1', userId: 'user-1', company: { id: 'co-1', name: 'Acme' } },
  ],
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ─── getProfile ───────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('throws NotFoundException when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns user without passwordHash field', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const result = await service.getProfile('user-1');

      expect(result).not.toHaveProperty('passwordHash');
    });

    it('returns user with salesperson and companyMemberships included', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const result = await service.getProfile('user-1');

      expect(result.salesperson).toEqual(baseUser.salesperson);
      expect(result.companyMemberships).toEqual(baseUser.companyMemberships);
    });

    it('passwordHash is absent even when the user row contains it', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'super-secret' });

      const result = await service.getProfile('user-1');

      expect('passwordHash' in result).toBe(false);
    });

    it('returns salesperson: null safely for a COMPANY role user', async () => {
      const companyUser = { ...baseUser, role: 'COMPANY', salesperson: null };
      mockPrisma.user.findUnique.mockResolvedValue(companyUser);

      const result = await service.getProfile('user-1');

      expect(result.salesperson).toBeNull();
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  // ─── updateUser ───────────────────────────────────────────────────────────

  describe('updateUser', () => {
    const dto = { name: 'Updated Name' };

    beforeEach(() => {
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser });
    });

    it('calls prisma.user.update with the correct userId and dto', async () => {
      await service.updateUser('user-1', dto);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: dto,
      });
    });

    it('returns the re-fetched profile (calls getProfile after update)', async () => {
      const result = await service.updateUser('user-1', dto);

      // findUnique is called by the internal getProfile re-fetch
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      expect(result).toBeDefined();
    });

    it('returned profile has no passwordHash', async () => {
      const result = await service.updateUser('user-1', dto);

      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  // ─── updateSalespersonProfile ─────────────────────────────────────────────

  describe('updateSalespersonProfile', () => {
    const dto = { experienceYears: 5, openToWork: true };
    const spProfile = { id: 'sp-1', userId: 'user-1', experienceYears: 3 };

    it('throws NotFoundException when salesperson profile is not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      await expect(service.updateSalespersonProfile('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('calls salespersonProfile.update with the correct userId and dto', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(spProfile);
      mockPrisma.salespersonProfile.update.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser });

      await service.updateSalespersonProfile('user-1', dto);

      expect(mockPrisma.salespersonProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: dto,
      });
    });

    it('returns the re-fetched full profile after update', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(spProfile);
      mockPrisma.salespersonProfile.update.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser });

      const result = await service.updateSalespersonProfile('user-1', dto);

      expect(result).toHaveProperty('id', 'user-1');
      expect(result).toHaveProperty('salesperson');
      expect(result).toHaveProperty('companyMemberships');
    });

    it('does NOT call salespersonProfile.update when profile is not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      await expect(service.updateSalespersonProfile('user-1', dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.salespersonProfile.update).not.toHaveBeenCalled();
    });
  });

  // ─── changePassword ───────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('missing', { currentPassword: 'old', newPassword: 'newpass1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException when current password is wrong', async () => {
      const hash = await bcrypt.hash('correct-pw', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: hash });

      await expect(
        service.changePassword('user-1', { currentPassword: 'wrong-pw', newPassword: 'newpass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when passwordHash is null', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: null });

      await expect(
        service.changePassword('user-1', { currentPassword: 'any', newPassword: 'newpass1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('updates passwordHash and returns { success: true } when current password matches', async () => {
      const hash = await bcrypt.hash('correct-pw', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: hash });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.changePassword('user-1', {
        currentPassword: 'correct-pw',
        newPassword: 'new-secure-pw',
      });

      expect(result).toEqual({ success: true });
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('stores a bcrypt hash of the new password (not plaintext)', async () => {
      const hash = await bcrypt.hash('correct-pw', 10);
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: hash });
      mockPrisma.user.update.mockResolvedValue({});

      await service.changePassword('user-1', {
        currentPassword: 'correct-pw',
        newPassword: 'new-secure-pw',
      });

      const updateCall = mockPrisma.user.update.mock.calls[0][0];
      const storedHash = updateCall.data.passwordHash;
      expect(storedHash).not.toBe('new-secure-pw');
      expect(await bcrypt.compare('new-secure-pw', storedHash)).toBe(true);
    });
  });
});
