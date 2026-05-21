import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DisputeStatus, PointsReason, UserRole } from '@closdex/db';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockTx = {
  scoreDispute: { update: jest.fn() },
  challengeAttempt: { update: jest.fn() },
  pointsTransaction: { create: jest.fn() },
  salespersonProfile: { findUnique: jest.fn(), update: jest.fn() },
};

const mockPrisma = {
  salespersonProfile: { findUnique: jest.fn() },
  challengeAttempt: { findUnique: jest.fn() },
  scoreDispute: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  challenge: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

const mockAudit = { log: jest.fn() };
const mockLeaderboards = { recordScore: jest.fn() };
const mockNotifications = { notify: jest.fn() };

const salespersonViewer: AuthUser = { id: 'user-sp', role: UserRole.SALESPERSON, email: 'sp@test.com' };
const adminViewer: AuthUser = { id: 'user-admin', role: UserRole.ADMIN, email: 'admin@test.com' };

const baseProfile = { id: 'sp-1', userId: 'user-sp', totalPoints: 100 };
const baseAttempt = { id: 'attempt-1', salespersonId: 'sp-1', finalScore: 80, challengeId: 'ch-1' };
const baseDispute = {
  id: 'dispute-1',
  salespersonId: 'sp-1',
  attemptId: 'attempt-1',
  status: DisputeStatus.OPEN,
  attempt: { ...baseAttempt },
};

describe('DisputesService', () => {
  let service: DisputesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: LeaderboardsService, useValue: mockLeaderboards },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<DisputesService>(DisputesService);
  });

  describe('create', () => {
    it('1. throws ForbiddenException when viewer is not SALESPERSON', async () => {
      await expect(service.create(adminViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(ForbiddenException);
    });

    it('2. throws NotFoundException when salesperson profile not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      await expect(service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(NotFoundException);
    });

    it('3. throws NotFoundException when attempt not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(null);
      await expect(service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(NotFoundException);
    });

    it('4. throws ForbiddenException when attempt belongs to different salesperson', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue({ ...baseAttempt, salespersonId: 'other-sp' });
      await expect(service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(ForbiddenException);
    });

    it('5. throws BadRequestException when attempt finalScore is null', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue({ ...baseAttempt, finalScore: null });
      await expect(service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(BadRequestException);
    });

    it('6. throws BadRequestException when dispute already exists for attempt', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(baseAttempt);
      mockPrisma.scoreDispute.findUnique.mockResolvedValue({ id: 'existing-dispute' });
      await expect(service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'r' })).rejects.toThrow(BadRequestException);
    });

    it('7. happy path creates and returns dispute', async () => {
      const created = { id: 'dispute-new', attemptId: 'attempt-1' };
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.challengeAttempt.findUnique.mockResolvedValue(baseAttempt);
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(null);
      mockPrisma.scoreDispute.create.mockResolvedValue(created);

      const result = await service.create(salespersonViewer, { attemptId: 'attempt-1', reason: 'score too low' });
      expect(result).toEqual(created);
      expect(mockPrisma.scoreDispute.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ attemptId: 'attempt-1', salespersonId: 'sp-1', reason: 'score too low' }) }),
      );
    });
  });

  describe('listMine', () => {
    it('8. returns empty array when viewer is not SALESPERSON', async () => {
      const result = await service.listMine(adminViewer);
      expect(result).toEqual([]);
    });

    it('9. returns empty array when salesperson profile not found', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      const result = await service.listMine(salespersonViewer);
      expect(result).toEqual([]);
    });

    it('10. returns disputes for the salesperson profile', async () => {
      const disputes = [{ id: 'dispute-1' }, { id: 'dispute-2' }];
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(baseProfile);
      mockPrisma.scoreDispute.findMany.mockResolvedValue(disputes);

      const result = await service.listMine(salespersonViewer);
      expect(result).toEqual(disputes);
      expect(mockPrisma.scoreDispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { salespersonId: 'sp-1' } }),
      );
    });
  });

  describe('adminList', () => {
    it('11. fetches all disputes when no status filter provided', async () => {
      mockPrisma.scoreDispute.findMany.mockResolvedValue([]);
      mockPrisma.scoreDispute.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.adminList({});
      expect(mockPrisma.scoreDispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('12. applies status filter when provided', async () => {
      mockPrisma.scoreDispute.findMany.mockResolvedValue([]);
      mockPrisma.scoreDispute.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.adminList({ status: DisputeStatus.OPEN });
      expect(mockPrisma.scoreDispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: DisputeStatus.OPEN } }),
      );
    });

    it('13. uses pagination defaults page=1 perPage=20 and returns items, total, page, perPage', async () => {
      mockPrisma.scoreDispute.findMany.mockResolvedValue([{ id: 'd-1' }]);
      mockPrisma.scoreDispute.count.mockResolvedValue(5);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.adminList({});
      expect(mockPrisma.scoreDispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result).toEqual({ items: [{ id: 'd-1' }], total: 5, page: 1, perPage: 20 });
    });
  });

  describe('adminGet', () => {
    it('14. throws NotFoundException when dispute not found', async () => {
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(null);
      await expect(service.adminGet('dispute-1')).rejects.toThrow(NotFoundException);
    });

    it('15. happy path returns dispute with includes', async () => {
      const dispute = { id: 'dispute-1', salesperson: {}, attempt: {} };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(dispute);
      const result = await service.adminGet('dispute-1');
      expect(result).toEqual(dispute);
    });
  });

  describe('adminResolve', () => {
    it('16. throws NotFoundException when dispute not found', async () => {
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(null);
      await expect(service.adminResolve(adminViewer, 'dispute-1', { action: 'REJECT', resolution: 'invalid' })).rejects.toThrow(NotFoundException);
    });

    it('17. throws BadRequestException when dispute is already RESOLVED', async () => {
      mockPrisma.scoreDispute.findUnique.mockResolvedValue({ ...baseDispute, status: DisputeStatus.RESOLVED });
      await expect(service.adminResolve(adminViewer, 'dispute-1', { action: 'REJECT', resolution: 'done' })).rejects.toThrow(BadRequestException);
    });

    it('18. throws BadRequestException when dispute is already REJECTED', async () => {
      mockPrisma.scoreDispute.findUnique.mockResolvedValue({ ...baseDispute, status: DisputeStatus.REJECTED });
      await expect(service.adminResolve(adminViewer, 'dispute-1', { action: 'REJECT', resolution: 'done' })).rejects.toThrow(BadRequestException);
    });

    it('19. throws BadRequestException when action=ADJUST and newScore is undefined', async () => {
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      await expect(service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', resolution: 'ok' })).rejects.toThrow(BadRequestException);
    });

    it('20. REJECT path: sets status=REJECTED, calls audit with DISPUTE_REJECTED, no pointsTransaction, calls notify', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.REJECTED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      const result = await service.adminResolve(adminViewer, 'dispute-1', { action: 'REJECT', resolution: 'not valid' });

      expect(mockTx.scoreDispute.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: DisputeStatus.REJECTED }) }),
      );
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DISPUTE_REJECTED' }),
        mockTx,
      );
      expect(mockTx.pointsTransaction.create).not.toHaveBeenCalled();
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'DISPUTE_REJECTED', userId: 'user-sp' }),
      );
      expect(result).toEqual(resolved);
    });

    it('21. ADJUST path: computes delta, creates pointsTransaction, updates totalPoints with Math.max(0,...)', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.RESOLVED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockTx.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1', totalPoints: 100 });
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.challenge.findUnique.mockResolvedValue({ category: 'COLD_CALL' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      await service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', newScore: 90, resolution: 'fair' });

      const delta = 90 - 80;
      expect(mockTx.pointsTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ reason: PointsReason.ADMIN_ADJUSTMENT, points: delta }),
        }),
      );
      expect(mockTx.salespersonProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalPoints: Math.max(0, 100 + delta) }),
        }),
      );
    });

    it('22. ADJUST path: calls leaderboards.recordScore with delta and challenge category', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.RESOLVED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockTx.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1', totalPoints: 100 });
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.challenge.findUnique.mockResolvedValue({ category: 'COLD_CALL' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      await service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', newScore: 90, resolution: 'ok' });

      expect(mockLeaderboards.recordScore).toHaveBeenCalledWith('sp-1', 10, 'COLD_CALL');
    });

    it('23. ADJUST path: calls audit with DISPUTE_ADJUSTED and notifies with adjusted score', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.RESOLVED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockTx.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp-1', totalPoints: 100 });
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.challenge.findUnique.mockResolvedValue({ category: 'COLD_CALL' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      await service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', newScore: 90, resolution: 'looks right' });

      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DISPUTE_ADJUSTED' }),
        mockTx,
      );
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DISPUTE_RESOLVED',
          body: expect.stringContaining('90'),
        }),
      );
    });

    it('24. delta=0 skips pointsTransaction creation', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.RESOLVED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.challenge.findUnique.mockResolvedValue({ category: 'COLD_CALL' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      await service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', newScore: 80, resolution: 'same' });

      expect(mockTx.pointsTransaction.create).not.toHaveBeenCalled();
    });

    it('25. delta=0 skips leaderboards.recordScore', async () => {
      const resolved = { id: 'dispute-1', status: DisputeStatus.RESOLVED };
      mockPrisma.scoreDispute.findUnique.mockResolvedValue(baseDispute);
      mockTx.scoreDispute.update.mockResolvedValue(resolved);
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.challenge.findUnique.mockResolvedValue({ category: 'COLD_CALL' });
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'user-sp' });

      await service.adminResolve(adminViewer, 'dispute-1', { action: 'ADJUST', newScore: 80, resolution: 'same' });

      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });
  });
});
