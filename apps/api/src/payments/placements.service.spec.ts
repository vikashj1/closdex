import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationStatus, CompanyRole, InvoiceStatus, InvoiceType, PlacementStatus, UserRole } from '@closdex/db';
import { PlacementsService } from './placements.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockTx = {
  placement: { create: jest.fn(), update: jest.fn() },
  invoice: { create: jest.fn() },
  application: { update: jest.fn() },
};

const mockPrisma = {
  application: { findUnique: jest.fn() },
  placement: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  salespersonProfile: { findUnique: jest.fn() },
  company: { findUnique: jest.fn() },
  $transaction: jest.fn(),
};

const mockJobs = { assertCompanyMember: jest.fn() };
const mockNotifications = { notify: jest.fn() };

const adminViewer: AuthUser = { id: 'user-1', role: UserRole.ADMIN, email: 'admin@test.com' };
const recruiterViewer: AuthUser = { id: 'user-2', role: UserRole.COMPANY, email: 'recruiter@test.com' };

const baseApplication = {
  id: 'app-1',
  jobId: 'job-1',
  salespersonId: 'sp-1',
  status: ApplicationStatus.OFFERED,
  job: { id: 'job-1', companyId: 'company-1', title: 'AE Role' },
};

describe('PlacementsService', () => {
  let service: PlacementsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacementsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JobsService, useValue: mockJobs },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<PlacementsService>(PlacementsService);
  });

  describe('hire', () => {
    it('1. throws NotFoundException when application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);
      await expect(service.hire(recruiterViewer, 'app-1', 1000000, 0.1)).rejects.toThrow(NotFoundException);
    });

    it('2. calls assertCompanyMember with ADMIN and RECRUITER roles', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockRejectedValue(new Error('stop'));
      await expect(service.hire(recruiterViewer, 'app-1', 1000000, 0.1)).rejects.toThrow('stop');
      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(
        recruiterViewer,
        'company-1',
        [CompanyRole.ADMIN, CompanyRole.RECRUITER],
      );
    });

    it('3. throws BadRequestException when application status is not OFFERED', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({ ...baseApplication, status: ApplicationStatus.APPLIED });
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      await expect(service.hire(recruiterViewer, 'app-1', 1000000, 0.1)).rejects.toThrow(BadRequestException);
    });

    it('4. throws BadRequestException when placement already exists', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findUnique.mockResolvedValue({ id: 'existing-placement' });
      await expect(service.hire(recruiterViewer, 'app-1', 1000000, 0.1)).rejects.toThrow(BadRequestException);
    });

    it('5. happy path returns placement, invoice, and applicationStatus HIRED', async () => {
      const placement = { id: 'pl-1', applicationId: 'app-1' };
      const invoice = { id: 'inv-1' };
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findUnique.mockResolvedValue(null);
      mockTx.placement.create.mockResolvedValue(placement);
      mockTx.invoice.create.mockResolvedValue(invoice);
      mockTx.application.update.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue(null);

      const result = await service.hire(recruiterViewer, 'app-1', 1000000, 0.1);
      expect(result.placement).toEqual(placement);
      expect(result.invoice).toEqual(invoice);
      expect(result.applicationStatus).toBe(ApplicationStatus.HIRED);
    });

    it('6. calls notify with correct body when profile and company found', async () => {
      const placement = { id: 'pl-1', applicationId: 'app-1' };
      const invoice = { id: 'inv-1' };
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findUnique.mockResolvedValue(null);
      mockTx.placement.create.mockResolvedValue(placement);
      mockTx.invoice.create.mockResolvedValue(invoice);
      mockTx.application.update.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ userId: 'sp-user-1' });
      mockPrisma.company.findUnique.mockResolvedValue({ name: 'Acme Corp' });

      await service.hire(recruiterViewer, 'app-1', 1000000, 0.1);
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'sp-user-1',
          type: 'HIRED',
          body: expect.stringContaining('Acme Corp'),
        }),
      );
    });

    it('7a. zero CTC produces zero commission and zero invoice amount', async () => {
      const placement = { id: 'pl-1' };
      const invoice = { id: 'inv-1' };
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findUnique.mockResolvedValue(null);
      mockTx.placement.create.mockResolvedValue(placement);
      mockTx.invoice.create.mockResolvedValue(invoice);
      mockTx.application.update.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await service.hire(recruiterViewer, 'app-1', 0, 0.1);
      expect(mockTx.placement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ commissionAmount: 0 }) }),
      );
      expect(mockTx.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 0, gstAmount: 0 }),
        }),
      );
    });

    it('7. commission math: annualCtc=100 rate=0.1 → commissionAmount=10, invoiceAmountPaise=1000, gstAmountPaise=180', async () => {
      const placement = { id: 'pl-1' };
      const invoice = { id: 'inv-1' };
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findUnique.mockResolvedValue(null);
      mockTx.placement.create.mockResolvedValue(placement);
      mockTx.invoice.create.mockResolvedValue(invoice);
      mockTx.application.update.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await service.hire(recruiterViewer, 'app-1', 100, 0.1);
      expect(mockTx.placement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ commissionAmount: 10 }) }),
      );
      expect(mockTx.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 1000, gstAmount: 180 }),
        }),
      );
    });
  });

  describe('list', () => {
    it('8. calls assertCompanyMember with ADMIN, RECRUITER, VIEWER roles', async () => {
      mockJobs.assertCompanyMember.mockRejectedValue(new Error('stop'));
      await expect(service.list(recruiterViewer, { companyId: 'company-1' })).rejects.toThrow('stop');
      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(
        recruiterViewer,
        'company-1',
        [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER],
      );
    });

    it('9. applies status filter when present in query', async () => {
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findMany.mockResolvedValue([]);
      mockPrisma.placement.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.list(recruiterViewer, { companyId: 'company-1', status: PlacementStatus.CONFIRMED });
      expect(mockPrisma.placement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { companyId: 'company-1', status: PlacementStatus.CONFIRMED } }),
      );
    });

    it('10. uses pagination defaults page=1 perPage=20', async () => {
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findMany.mockResolvedValue([]);
      mockPrisma.placement.count.mockResolvedValue(0);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      await service.list(recruiterViewer, { companyId: 'company-1' });
      expect(mockPrisma.placement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('11. returns items, total, page, perPage', async () => {
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.placement.findMany.mockResolvedValue([{ id: 'pl-1' }]);
      mockPrisma.placement.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.list(recruiterViewer, { companyId: 'company-1', page: 2, perPage: 5 });
      expect(result).toEqual({ items: [{ id: 'pl-1' }], total: 1, page: 2, perPage: 5 });
    });
  });

  describe('get', () => {
    it('12. throws NotFoundException when placement not found', async () => {
      mockPrisma.placement.findUnique.mockResolvedValue(null);
      await expect(service.get(recruiterViewer, 'pl-1')).rejects.toThrow(NotFoundException);
    });

    it('13. admin viewer skips assertCompanyMember', async () => {
      mockPrisma.placement.findUnique.mockResolvedValue({ id: 'pl-1', companyId: 'company-1' });
      await service.get(adminViewer, 'pl-1');
      expect(mockJobs.assertCompanyMember).not.toHaveBeenCalled();
    });

    it('14. non-admin calls assertCompanyMember with VIEWER roles', async () => {
      mockPrisma.placement.findUnique.mockResolvedValue({ id: 'pl-1', companyId: 'company-1' });
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      await service.get(recruiterViewer, 'pl-1');
      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(
        recruiterViewer,
        'company-1',
        [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER],
      );
    });
  });

  describe('markPaid', () => {
    it('15. calls prisma.placement.update with status PAID', async () => {
      mockPrisma.placement.update.mockResolvedValue({});
      await service.markPaid('pl-1');
      expect(mockPrisma.placement.update).toHaveBeenCalledWith({
        where: { id: 'pl-1' },
        data: { status: PlacementStatus.PAID },
      });
    });
  });

  describe('markInvoiced', () => {
    it('16. calls prisma.placement.update with status INVOICED', async () => {
      mockPrisma.placement.update.mockResolvedValue({});
      await service.markInvoiced('pl-1');
      expect(mockPrisma.placement.update).toHaveBeenCalledWith({
        where: { id: 'pl-1' },
        data: { status: PlacementStatus.INVOICED },
      });
    });
  });
});
