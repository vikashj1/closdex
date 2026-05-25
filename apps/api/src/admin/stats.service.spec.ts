import { UserRole } from '@closdex/db';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

function makePrismaMock() {
  return {
    user: { count: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    challenge: { count: jest.fn() },
    challengeAttempt: { count: jest.fn() },
    $transaction: jest.fn(async (queries: any[]) => Promise.all(queries)),
  } as unknown as PrismaService;
}

describe('StatsService', () => {
  describe('platformStats()', () => {
    it('returns correct shape with mocked counts', async () => {
      const prisma = makePrismaMock();
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(10) // salespersons
        .mockResolvedValueOnce(5)  // companies
        .mockResolvedValueOnce(2); // admins
      (prisma.challenge.count as jest.Mock)
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(15); // published
      (prisma.challengeAttempt.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(12)  // thisWeek
        .mockResolvedValueOnce(8);  // completedThisWeek

      const svc = new StatsService(prisma);
      const result = await svc.platformStats();

      expect(result).toEqual({
        users: { salespersons: 10, companies: 5, admins: 2 },
        challenges: { total: 20, published: 15 },
        attempts: { total: 100, thisWeek: 12, completedThisWeek: 8 },
      });
    });
  });

  describe('listUsers()', () => {
    it('no filter — passes empty where', async () => {
      const prisma = makePrismaMock();
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const svc = new StatsService(prisma);
      const result = await svc.listUsers({});

      const whereArg = (prisma.$transaction as jest.Mock).mock.calls[0][0];
      expect(whereArg).toHaveLength(2);
      expect(result).toEqual({ items: [], total: 0, page: 1, perPage: 25 });
    });

    it('role filter — where.role is set', async () => {
      const prisma = makePrismaMock();
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const svc = new StatsService(prisma);
      await svc.listUsers({ role: UserRole.SALESPERSON });

      // findMany should have been called with where.role set
      const findManyCall = (prisma.user.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.where.role).toBe(UserRole.SALESPERSON);
    });

    it('search filter — where.OR is set', async () => {
      const prisma = makePrismaMock();
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const svc = new StatsService(prisma);
      await svc.listUsers({ search: 'alice' });

      const findManyCall = (prisma.user.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.where.OR).toBeDefined();
      expect(findManyCall.where.OR[0].name.contains).toBe('alice');
    });

    it('page 2 — skip equals perPage', async () => {
      const prisma = makePrismaMock();
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);
      (prisma.$transaction as jest.Mock).mockResolvedValue([[], 0]);

      const svc = new StatsService(prisma);
      const result = await svc.listUsers({ page: 2, perPage: 10 });

      const findManyCall = (prisma.user.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.skip).toBe(10);
      expect(findManyCall.take).toBe(10);
      expect(result.page).toBe(2);
      expect(result.perPage).toBe(10);
    });
  });

  describe('updateUserRole()', () => {
    it('calls prisma.user.update with correct args', async () => {
      const updated = { id: 'u-1', role: UserRole.ADMIN };
      const prisma = makePrismaMock();
      (prisma.user.update as jest.Mock).mockResolvedValue(updated);

      const svc = new StatsService(prisma);
      const result = await svc.updateUserRole('u-1', UserRole.ADMIN);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u-1' },
        data: { role: UserRole.ADMIN },
      });
      expect(result).toEqual(updated);
    });
  });
});
