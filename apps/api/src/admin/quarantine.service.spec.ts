import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuarantineService } from './quarantine.service';
import { AuthUser } from '../auth/jwt.strategy';
import { UserRole } from '@closdex/db';

const adminUser: AuthUser = { id: 'admin-1', email: 'admin@example.com', role: UserRole.ADMIN };

function mockPrisma() {
  const tx = {
    challengeAttempt: { update: jest.fn().mockResolvedValue({}) },
    pointsTransaction: { create: jest.fn().mockResolvedValue({}) },
    salespersonProfile: {
      findUnique: jest.fn().mockResolvedValue({ id: 'sp-1', totalPoints: 100 }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
  return {
    challengeAttempt: { findUnique: jest.fn() },
    $transaction: jest.fn(async (fn: any) => fn(tx)),
    _tx: tx,
  };
}

function mockAudit() {
  return { log: jest.fn().mockResolvedValue({}) };
}

function mockLeaderboards() {
  return { recordScore: jest.fn().mockResolvedValue(undefined) };
}

describe('QuarantineService', () => {
  describe('clear', () => {
    it('throws NotFoundException when the attempt does not exist', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce(null);
      const svc = new QuarantineService(prisma as any, mockAudit() as any, mockLeaderboards() as any);
      await expect(svc.clear(adminUser, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('is a no-op when the attempt is not quarantined', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce({
        id: 'a1', quarantined: false, finalScore: 100, salespersonId: 'sp-1', challenge: { category: 'IT Sales' },
      });
      const svc = new QuarantineService(prisma as any, mockAudit() as any, mockLeaderboards() as any);
      const result = await svc.clear(adminUser, 'a1');
      expect(result.action).toBe('noop');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('throws BadRequest when finalScore is null', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce({
        id: 'a1', quarantined: true, finalScore: null, salespersonId: 'sp-1', challenge: { category: 'IT Sales' },
      });
      const svc = new QuarantineService(prisma as any, mockAudit() as any, mockLeaderboards() as any);
      await expect(svc.clear(adminUser, 'a1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('un-flags, applies points + leaderboard delta, writes audit', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce({
        id: 'a1', quarantined: true, finalScore: 250, salespersonId: 'sp-1', challenge: { category: 'IT Sales' },
      });
      const audit = mockAudit();
      const leaderboards = mockLeaderboards();
      const svc = new QuarantineService(prisma as any, audit as any, leaderboards as any);

      const result = await svc.clear(adminUser, 'a1', 'false positive');

      expect(result.action).toBe('cleared');
      expect(result.pointsApplied).toBe(250);
      expect(prisma._tx.challengeAttempt.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { quarantined: false },
      });
      expect(prisma._tx.pointsTransaction.create).toHaveBeenCalled();
      expect(prisma._tx.salespersonProfile.update).toHaveBeenCalledWith({
        where: { id: 'sp-1' },
        data: { totalPoints: 350 },
      });
      expect(leaderboards.recordScore).toHaveBeenCalledWith('sp-1', 250, 'IT Sales');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'QUARANTINE_CLEAR',
        entity: 'challengeAttempt',
        entityId: 'a1',
      }));
    });
  });

  describe('confirm', () => {
    it('throws NotFoundException when the attempt does not exist', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce(null);
      const svc = new QuarantineService(prisma as any, mockAudit() as any, mockLeaderboards() as any);
      await expect(svc.confirm(adminUser, 'missing')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequest when the attempt is not quarantined', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce({ id: 'a1', quarantined: false });
      const svc = new QuarantineService(prisma as any, mockAudit() as any, mockLeaderboards() as any);
      await expect(svc.confirm(adminUser, 'a1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('writes an audit entry and returns confirmed', async () => {
      const prisma = mockPrisma();
      prisma.challengeAttempt.findUnique.mockResolvedValueOnce({ id: 'a1', quarantined: true });
      const audit = mockAudit();
      const svc = new QuarantineService(prisma as any, audit as any, mockLeaderboards() as any);
      const result = await svc.confirm(adminUser, 'a1', 'confirmed paste from GPT');
      expect(result.action).toBe('confirmed');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'QUARANTINE_CONFIRM',
        entityId: 'a1',
      }));
    });
  });
});
