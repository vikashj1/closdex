import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRole, UserRole, VerificationStatus } from '@closdex/db';
import { VerificationService } from './verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockTx = {
  company: { update: jest.fn() },
};

const mockPrisma = {
  company: { findUnique: jest.fn(), findMany: jest.fn() },
  companyMembership: { findMany: jest.fn() },
  $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<any>) => cb(mockTx)),
};

const mockAudit = { log: jest.fn() };
const mockNotifications = { notifyMany: jest.fn() };

const actor: AuthUser = { id: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN };

const baseCompany = {
  id: 'co-1',
  name: 'Acme Corp',
  verification: VerificationStatus.PENDING,
};

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Re-wire $transaction each time so clearAllMocks doesn't break the impl
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof mockTx) => Promise<any>) => cb(mockTx),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  // ─── listPending ──────────────────────────────────────────────────────────

  describe('listPending()', () => {
    it('1. returns companies from prisma query', async () => {
      const companies = [{ id: 'co-1', name: 'Acme' }, { id: 'co-2', name: 'Beta' }];
      mockPrisma.company.findMany.mockResolvedValue(companies);

      const result = await service.listPending();

      expect(result).toEqual(companies);
      expect(mockPrisma.company.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { verification: VerificationStatus.PENDING } }),
      );
    });
  });

  // ─── approve ──────────────────────────────────────────────────────────────

  describe('approve()', () => {
    it('2. updates company status to VERIFIED', async () => {
      const updated = { ...baseCompany, verification: VerificationStatus.VERIFIED };
      mockPrisma.company.findUnique.mockResolvedValue(baseCompany);
      mockTx.company.update.mockResolvedValue(updated);
      mockPrisma.companyMembership.findMany.mockResolvedValue([]);

      await service.approve(actor, 'co-1');

      expect(mockTx.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'co-1' },
          data: { verification: VerificationStatus.VERIFIED },
        }),
      );
    });

    it('3. throws NotFoundException when company not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.approve(actor, 'co-missing')).rejects.toThrow(NotFoundException);
    });

    it('4. throws BadRequestException when company already VERIFIED', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        ...baseCompany,
        verification: VerificationStatus.VERIFIED,
      });

      await expect(service.approve(actor, 'co-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── reject ───────────────────────────────────────────────────────────────

  describe('reject()', () => {
    it('5. updates company status to REJECTED', async () => {
      const updated = { ...baseCompany, verification: VerificationStatus.REJECTED };
      mockPrisma.company.findUnique.mockResolvedValue(baseCompany);
      mockTx.company.update.mockResolvedValue(updated);
      mockPrisma.companyMembership.findMany.mockResolvedValue([]);

      await service.reject(actor, 'co-1');

      expect(mockTx.company.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'co-1' },
          data: { verification: VerificationStatus.REJECTED },
        }),
      );
    });

    it('6. throws BadRequestException when company already REJECTED', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        ...baseCompany,
        verification: VerificationStatus.REJECTED,
      });

      await expect(service.reject(actor, 'co-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ─── approve — notifications ───────────────────────────────────────────────

  describe('approve() — notifications', () => {
    it('7. calls notificationsService.notifyMany for company admin members', async () => {
      const updated = { ...baseCompany, verification: VerificationStatus.VERIFIED };
      mockPrisma.company.findUnique.mockResolvedValue(baseCompany);
      mockTx.company.update.mockResolvedValue(updated);
      mockPrisma.companyMembership.findMany.mockResolvedValue([
        { userId: 'user-a' },
        { userId: 'user-b' },
      ]);

      await service.approve(actor, 'co-1');

      expect(mockPrisma.companyMembership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'co-1', companyRole: CompanyRole.ADMIN },
        }),
      );
      expect(mockNotifications.notifyMany).toHaveBeenCalledWith(
        ['user-a', 'user-b'],
        expect.objectContaining({ type: 'COMPANY_VERIFIED' }),
      );
    });
  });
});
