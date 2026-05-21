import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRole, InvoiceStatus, UserRole } from '@closdex/db';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { PlacementsService } from './placements.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockPrisma = {
  invoice: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJobs = { assertCompanyMember: jest.fn() };
const mockPlacements = { markInvoiced: jest.fn(), markPaid: jest.fn() };

const adminViewer: AuthUser = { id: 'user-1', role: UserRole.ADMIN, email: 'admin@test.com' };

const draftInvoice = {
  id: 'inv-1',
  companyId: 'company-1',
  status: InvoiceStatus.DRAFT,
  placementId: 'pl-1',
};

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JobsService, useValue: mockJobs },
        { provide: PlacementsService, useValue: mockPlacements },
      ],
    }).compile();
    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('list', () => {
    it('1. returns paginated invoices', async () => {
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
      mockPrisma.invoice.count.mockResolvedValue(1);
      mockPrisma.$transaction.mockImplementation((arr: any[]) => Promise.all(arr));

      const result = await service.list(adminViewer, { companyId: 'company-1', page: 1, perPage: 20 });
      expect(result).toEqual({ items: [{ id: 'inv-1' }], total: 1, page: 1, perPage: 20 });
    });

    it('2. calls jobs.assertCompanyMember with ADMIN, RECRUITER, VIEWER roles', async () => {
      mockJobs.assertCompanyMember.mockRejectedValue(new Error('stop'));
      await expect(service.list(adminViewer, { companyId: 'company-1' })).rejects.toThrow('stop');
      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(
        adminViewer,
        'company-1',
        [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER],
      );
    });
  });

  describe('get', () => {
    it('3. returns invoice by id', async () => {
      const invoice = { id: 'inv-1', companyId: 'company-1' };
      mockPrisma.invoice.findUnique.mockResolvedValue(invoice);
      const result = await service.get(adminViewer, 'inv-1');
      expect(result).toEqual(invoice);
      expect(mockJobs.assertCompanyMember).not.toHaveBeenCalled();
    });

    it('4. throws NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.get(adminViewer, 'inv-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('issue', () => {
    it('5. updates status to ISSUED and sets issuedAt', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(draftInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      const updated = { ...draftInvoice, status: InvoiceStatus.ISSUED, issuedAt: new Date() };
      mockPrisma.invoice.update.mockResolvedValue(updated);
      mockPlacements.markInvoiced.mockResolvedValue(undefined);

      const result = await service.issue(adminViewer, 'inv-1');
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: InvoiceStatus.ISSUED, issuedAt: expect.any(Date) }),
        }),
      );
      expect(result.status).toBe(InvoiceStatus.ISSUED);
    });

    it('6. throws BadRequestException when status is not DRAFT', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ ...draftInvoice, status: InvoiceStatus.ISSUED });
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      await expect(service.issue(adminViewer, 'inv-1')).rejects.toThrow(BadRequestException);
    });

    it('7. throws NotFoundException when invoice not found', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(null);
      await expect(service.issue(adminViewer, 'inv-999')).rejects.toThrow(NotFoundException);
    });

    it('8. calls placements.markInvoiced when placementId exists', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(draftInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.invoice.update.mockResolvedValue({ ...draftInvoice, status: InvoiceStatus.ISSUED });
      mockPlacements.markInvoiced.mockResolvedValue(undefined);

      await service.issue(adminViewer, 'inv-1');
      expect(mockPlacements.markInvoiced).toHaveBeenCalledWith('pl-1');
    });

    it('9. does NOT call placements.markInvoiced when no placementId', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ ...draftInvoice, placementId: null });
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.invoice.update.mockResolvedValue({ ...draftInvoice, status: InvoiceStatus.ISSUED, placementId: null });

      await service.issue(adminViewer, 'inv-1');
      expect(mockPlacements.markInvoiced).not.toHaveBeenCalled();
    });
  });

  describe('markPaid', () => {
    const issuedInvoice = { ...draftInvoice, status: InvoiceStatus.ISSUED };

    it('10. updates status to PAID', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(issuedInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      const paid = { ...issuedInvoice, status: InvoiceStatus.PAID, paidAt: new Date() };
      mockPrisma.invoice.update.mockResolvedValue(paid);
      mockPlacements.markPaid.mockResolvedValue(undefined);

      const result = await service.markPaid(adminViewer, 'inv-1');
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ status: InvoiceStatus.PAID, paidAt: expect.any(Date) }),
        }),
      );
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('11. throws BadRequestException when status is not ISSUED', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(draftInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      await expect(service.markPaid(adminViewer, 'inv-1')).rejects.toThrow(BadRequestException);
    });

    it('12. calls placements.markPaid', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(issuedInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      mockPrisma.invoice.update.mockResolvedValue({ ...issuedInvoice, status: InvoiceStatus.PAID });
      mockPlacements.markPaid.mockResolvedValue(undefined);

      await service.markPaid(adminViewer, 'inv-1');
      expect(mockPlacements.markPaid).toHaveBeenCalledWith('pl-1');
    });
  });

  describe('void', () => {
    it('13. updates status to VOID', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue(draftInvoice);
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      const voided = { ...draftInvoice, status: InvoiceStatus.VOID };
      mockPrisma.invoice.update.mockResolvedValue(voided);

      const result = await service.void(adminViewer, 'inv-1');
      expect(mockPrisma.invoice.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { status: InvoiceStatus.VOID },
      });
      expect(result.status).toBe(InvoiceStatus.VOID);
    });

    it('14. throws BadRequestException when status is not DRAFT', async () => {
      mockPrisma.invoice.findUnique.mockResolvedValue({ ...draftInvoice, status: InvoiceStatus.ISSUED });
      mockJobs.assertCompanyMember.mockResolvedValue(undefined);
      await expect(service.void(adminViewer, 'inv-1')).rejects.toThrow(BadRequestException);
    });
  });
});
