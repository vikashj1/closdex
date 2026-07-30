import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@closdex/db';
import { UsersAdminService } from './users-admin.service';
import { AuthUser } from '../auth/jwt.strategy';

const ADMIN: AuthUser = { id: 'admin-1', email: 'a@x', role: UserRole.ADMIN };

function makeSvc(overrides: Partial<{ user: any; salesperson: any; jwtSign: jest.Mock; audit: jest.Mock }> = {}) {
  const findUnique = jest.fn().mockResolvedValue(overrides.user ?? null);
  const update = jest.fn().mockResolvedValue({ id: 'target-1', bannedAt: new Date() });
  const spFindUnique = jest.fn().mockResolvedValue(overrides.salesperson ?? null);
  const spUpdate = jest.fn().mockResolvedValue({});
  const ptCreate = jest.fn().mockResolvedValue({});
  const prisma = {
    user: { findUnique, update },
    salespersonProfile: { findUnique: spFindUnique, update: spUpdate },
    pointsTransaction: { create: ptCreate },
    challengeAttempt: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn((ops: any) => Promise.all(ops)),
  } as any;
  const jwt = { sign: overrides.jwtSign ?? jest.fn().mockReturnValue('impersonation-token') } as any;
  const audit = { log: overrides.audit ?? jest.fn().mockResolvedValue({}) } as any;
  return { svc: new UsersAdminService(prisma, jwt, audit), prisma, jwt, audit };
}

describe('UsersAdminService', () => {
  describe('ban', () => {
    it('throws NotFound when the user does not exist', async () => {
      const { svc } = makeSvc({ user: null });
      await expect(svc.ban(ADMIN, 'nope', 'reason')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects self-ban', async () => {
      const { svc } = makeSvc({ user: { id: ADMIN.id, role: UserRole.ADMIN } });
      await expect(svc.ban(ADMIN, ADMIN.id)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects banning another admin (must demote first)', async () => {
      const { svc } = makeSvc({ user: { id: 'other-admin', role: UserRole.ADMIN } });
      await expect(svc.ban(ADMIN, 'other-admin', 'reason')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('sets bannedAt + reason and writes an audit entry on success', async () => {
      const { svc, prisma, audit } = makeSvc({ user: { id: 'sp-1', role: UserRole.SALESPERSON } });
      await svc.ban(ADMIN, 'sp-1', 'spam');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sp-1' },
          data: expect.objectContaining({ bannedReason: 'spam' }),
        }),
      );
      const auditCall = audit.log.mock.calls[0][0];
      expect(auditCall.action).toBe('USER_BAN');
      expect(auditCall.metadata).toEqual({ reason: 'spam' });
    });
  });

  describe('softDelete', () => {
    it('rejects self-delete', async () => {
      const { svc } = makeSvc({ user: { id: ADMIN.id, role: UserRole.ADMIN } });
      await expect(svc.softDelete(ADMIN, ADMIN.id)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('anonymizes email to deleted-<id>@closdex.local + audits with the original email', async () => {
      const target = { id: 'sp-1', role: UserRole.SALESPERSON, email: 'real@user.com' };
      const { svc, prisma, audit } = makeSvc({ user: target });
      await svc.softDelete(ADMIN, 'sp-1');
      const updateArgs = prisma.user.update.mock.calls[0][0];
      expect(updateArgs.data.email).toBe('deleted-sp-1@closdex.local');
      expect(updateArgs.data.name).toBe('Deleted user');
      expect(updateArgs.data.deletedAt).toBeInstanceOf(Date);
      expect(audit.log.mock.calls[0][0].metadata).toEqual({ originalEmail: 'real@user.com' });
    });
  });

  describe('adjustPoints', () => {
    it('rejects zero delta', async () => {
      const { svc } = makeSvc({ user: { id: 'sp-1', salesperson: { id: 'sp-prof-1', totalPoints: 100 } } });
      await expect(svc.adjustPoints(ADMIN, 'sp-1', 0, 'r')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects users without a salesperson profile', async () => {
      const { svc } = makeSvc({ user: { id: 'co-1', role: UserRole.COMPANY, salesperson: null } });
      await expect(svc.adjustPoints(ADMIN, 'co-1', 50)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('adds a positive delta to totalPoints + writes a transaction', async () => {
      const target = { id: 'sp-1', salesperson: { id: 'sp-prof-1', totalPoints: 100 } };
      const { svc, prisma } = makeSvc({ user: target });
      const result = await svc.adjustPoints(ADMIN, 'sp-1', 50, 'contest bonus');
      expect(result.newTotal).toBe(150);
      expect(prisma.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ points: 50 }) }),
      );
    });

    it('clamps totalPoints to zero when a negative delta would go below', async () => {
      const target = { id: 'sp-1', salesperson: { id: 'sp-prof-1', totalPoints: 30 } };
      const { svc } = makeSvc({ user: target });
      const result = await svc.adjustPoints(ADMIN, 'sp-1', -100, 'fraud clawback');
      expect(result.newTotal).toBe(0);
    });
  });

  describe('impersonate', () => {
    it('rejects impersonating self', async () => {
      const { svc } = makeSvc({ user: { id: ADMIN.id, role: UserRole.ADMIN } });
      await expect(svc.impersonate(ADMIN, ADMIN.id)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects impersonating another admin', async () => {
      const { svc } = makeSvc({ user: { id: 'admin-2', role: UserRole.ADMIN } });
      await expect(svc.impersonate(ADMIN, 'admin-2')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects impersonating banned users', async () => {
      const { svc } = makeSvc({
        user: { id: 'sp-1', role: UserRole.SALESPERSON, bannedAt: new Date(), deletedAt: null },
      });
      await expect(svc.impersonate(ADMIN, 'sp-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('returns a JWT with the impersonatedBy claim on success', async () => {
      const target = { id: 'sp-1', email: 'sp@x.com', role: UserRole.SALESPERSON, bannedAt: null, deletedAt: null };
      const { svc, jwt } = makeSvc({ user: target });
      const result = await svc.impersonate(ADMIN, 'sp-1');
      expect(result.accessToken).toBe('impersonation-token');
      expect(result.impersonatedBy).toBe(ADMIN.id);
      const signPayload = jwt.sign.mock.calls[0][0];
      expect(signPayload.impersonatedBy).toBe(ADMIN.id);
      expect(signPayload.sub).toBe('sp-1');
    });
  });
});
