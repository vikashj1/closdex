import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  company: { findUnique: jest.fn(), update: jest.fn() },
  companyMembership: { findUnique: jest.fn() },
  job: { count: jest.fn() },
  application: { count: jest.fn() },
  placement: { count: jest.fn(), aggregate: jest.fn() },
};

const baseCompany = { id: 'co-1', name: 'Acme Corp', industry: 'Tech' };
const adminMembership = { id: 'mem-1', companyId: 'co-1', userId: 'user-admin', companyRole: 'ADMIN' };

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  // ─── get ──────────────────────────────────────────────────────────────────

  describe('get', () => {
    it('throws NotFoundException when company is not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null);

      await expect(service.get('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the company when found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(baseCompany);

      const result = await service.get('co-1');

      expect(result).toEqual(baseCompany);
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto = { name: 'New Name' };

    it('throws ForbiddenException when membership is not found (null)', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(null);

      await expect(service.update('co-1', 'user-1', dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when membership.companyRole is RECRUITER', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue({
        ...adminMembership,
        userId: 'user-1',
        companyRole: 'RECRUITER',
      });

      await expect(service.update('co-1', 'user-1', dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when membership.companyRole is VIEWER', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue({
        ...adminMembership,
        userId: 'user-1',
        companyRole: 'VIEWER',
      });

      await expect(service.update('co-1', 'user-1', dto)).rejects.toThrow(ForbiddenException);
    });

    it('succeeds and returns the updated company when actor is ADMIN', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.company.update.mockResolvedValue({ ...baseCompany, ...dto });

      const result = await service.update('co-1', 'user-admin', dto);

      expect(result).toMatchObject({ id: 'co-1', name: 'New Name' });
    });

    it('calls prisma.company.update with the correct id and dto', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.company.update.mockResolvedValue({ ...baseCompany, ...dto });

      await service.update('co-1', 'user-admin', dto);

      expect(mockPrisma.company.update).toHaveBeenCalledWith({
        where: { id: 'co-1' },
        data: dto,
      });
    });

    it('calls assertAdmin (companyMembership.findUnique) before updating', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.company.update.mockResolvedValue({ ...baseCompany });

      await service.update('co-1', 'user-admin', dto);

      const membershipCallOrder = mockPrisma.companyMembership.findUnique.mock.invocationCallOrder[0];
      const updateCallOrder = mockPrisma.company.update.mock.invocationCallOrder[0];
      expect(membershipCallOrder).toBeLessThan(updateCallOrder);
    });

    it('does NOT call company.update when authorization fails', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(null);

      await expect(service.update('co-1', 'user-1', dto)).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.company.update).not.toHaveBeenCalled();
    });

    it('passes through without error when companyRole is ADMIN (assertAdmin check)', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.company.update.mockResolvedValue(baseCompany);

      await expect(service.update('co-1', 'user-admin', dto)).resolves.not.toThrow();

      expect(mockPrisma.companyMembership.findUnique).toHaveBeenCalledWith({
        where: {
          companyId_userId: { companyId: 'co-1', userId: 'user-admin' },
        },
      });
    });
  });

  // ─── getStats ─────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('throws ForbiddenException when actor is not a member', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(null);
      await expect(service.getStats('co-1', 'user-outsider')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns correct stats shape with mocked counts', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.job.count.mockResolvedValue(4);
      mockPrisma.application.count
        .mockResolvedValueOnce(7)   // newApplicationsThisWeek
        .mockResolvedValueOnce(3);  // shortlistedCount
      mockPrisma.placement.count.mockResolvedValue(2);
      mockPrisma.placement.aggregate.mockResolvedValue({ _sum: { commissionAmount: 50000 } });

      const result = await service.getStats('co-1', 'user-admin');

      expect(result).toMatchObject({
        activeJobs: 4,
        newApplicationsThisWeek: 7,
        shortlistedCount: 3,
        hiresThisQuarter: 2,
        commissionThisQuarter: 50000,
      });
    });

    it('defaults commissionThisQuarter to 0 when aggregate returns null sum', async () => {
      mockPrisma.companyMembership.findUnique.mockResolvedValue(adminMembership);
      mockPrisma.job.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.placement.count.mockResolvedValue(0);
      mockPrisma.placement.aggregate.mockResolvedValue({ _sum: { commissionAmount: null } });

      const result = await service.getStats('co-1', 'user-admin');
      expect(result.commissionThisQuarter).toBe(0);
    });
  });
});
