import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRole } from '@closdex/db';
import { ShortlistsService } from './shortlists.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';

const READ_ROLES = [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER];
const WRITE_ROLES = [CompanyRole.ADMIN, CompanyRole.RECRUITER];

const mockPrisma = {
  shortlist: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  shortlistEntry: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  salespersonProfile: {
    findUnique: jest.fn(),
  },
};

const mockJobs = {
  assertCompanyMember: jest.fn().mockResolvedValue(undefined),
};

const viewer = { id: 'user-1', email: 'user@test.com', role: 'COMPANY' as any };

describe('ShortlistsService', () => {
  let service: ShortlistsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockJobs.assertCompanyMember.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortlistsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JobsService, useValue: mockJobs },
      ],
    }).compile();

    service = module.get<ShortlistsService>(ShortlistsService);
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('calls assertCompanyMember with WRITE_ROLES', async () => {
      mockPrisma.shortlist.create.mockResolvedValue({ id: 'sl1', companyId: 'co1', name: 'Top Picks' });

      await service.create(viewer, 'co1', 'Top Picks');

      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(viewer, 'co1', WRITE_ROLES);
    });

    it('creates shortlist with companyId and name', async () => {
      const created = { id: 'sl1', companyId: 'co1', name: 'Top Picks' };
      mockPrisma.shortlist.create.mockResolvedValue(created);

      const result = await service.create(viewer, 'co1', 'Top Picks');

      expect(mockPrisma.shortlist.create).toHaveBeenCalledWith({
        data: { companyId: 'co1', name: 'Top Picks' },
      });
      expect(result).toEqual(created);
    });
  });

  // ---------------------------------------------------------------------------
  // listForCompany
  // ---------------------------------------------------------------------------
  describe('listForCompany', () => {
    it('calls assertCompanyMember with READ_ROLES', async () => {
      mockPrisma.shortlist.findMany.mockResolvedValue([]);

      await service.listForCompany(viewer, 'co1');

      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(viewer, 'co1', READ_ROLES);
    });

    it('returns shortlists with entry _count', async () => {
      const lists = [{ id: 'sl1', _count: { entries: 3 } }];
      mockPrisma.shortlist.findMany.mockResolvedValue(lists);

      const result = await service.listForCompany(viewer, 'co1');

      expect(mockPrisma.shortlist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'co1' },
          include: { _count: { select: { entries: true } } },
        }),
      );
      expect(result).toEqual(lists);
    });
  });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------
  describe('get', () => {
    it('throws NotFoundException when shortlist is not found', async () => {
      mockPrisma.shortlist.findUnique.mockResolvedValue(null);

      await expect(service.get(viewer, 'missing-sl')).rejects.toThrow(NotFoundException);
    });

    it('calls assertCompanyMember after fetching shortlist, using shortlist.companyId', async () => {
      const sl = { id: 'sl1', companyId: 'co1', entries: [] };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);

      await service.get(viewer, 'sl1');

      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(viewer, 'co1', READ_ROLES);
    });

    it('returns shortlist with entries and salesperson details', async () => {
      const sl = {
        id: 'sl1',
        companyId: 'co1',
        entries: [{ id: 'e1', salesperson: { id: 'sp1', user: { name: 'Alice' } } }],
      };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);

      const result = await service.get(viewer, 'sl1');

      expect(result).toEqual(sl);
    });
  });

  // ---------------------------------------------------------------------------
  // delete
  // ---------------------------------------------------------------------------
  describe('delete', () => {
    it('throws NotFoundException when shortlist is not found', async () => {
      mockPrisma.shortlist.findUnique.mockResolvedValue(null);

      await expect(service.delete(viewer, 'missing-sl')).rejects.toThrow(NotFoundException);
    });

    it('calls assertCompanyMember with WRITE_ROLES before deleting', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.shortlist.delete.mockResolvedValue(sl);

      await service.delete(viewer, 'sl1');

      expect(mockJobs.assertCompanyMember).toHaveBeenCalledWith(viewer, 'co1', WRITE_ROLES);
    });

    it('calls prisma.shortlist.delete after auth check passes', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.shortlist.delete.mockResolvedValue(sl);

      await service.delete(viewer, 'sl1');

      expect(mockPrisma.shortlist.delete).toHaveBeenCalledWith({ where: { id: 'sl1' } });
    });

    it('does NOT call delete when auth check throws', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockJobs.assertCompanyMember.mockRejectedValue(new Error('Forbidden'));

      await expect(service.delete(viewer, 'sl1')).rejects.toThrow();
      expect(mockPrisma.shortlist.delete).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // addEntry
  // ---------------------------------------------------------------------------
  describe('addEntry', () => {
    it('throws NotFoundException when shortlist is not found', async () => {
      mockPrisma.shortlist.findUnique.mockResolvedValue(null);

      await expect(service.addEntry(viewer, 'missing-sl', 'sp1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when salesperson profile is not found', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);

      await expect(service.addEntry(viewer, 'sl1', 'bad-sp')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.shortlistEntry.upsert).not.toHaveBeenCalled();
    });

    it('upserts entry idempotently — same pair returns existing row without error', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp1' });
      const entry = { shortlistId: 'sl1', salespersonId: 'sp1' };
      mockPrisma.shortlistEntry.upsert.mockResolvedValue(entry);

      const result1 = await service.addEntry(viewer, 'sl1', 'sp1');
      const result2 = await service.addEntry(viewer, 'sl1', 'sp1');

      expect(mockPrisma.shortlistEntry.upsert).toHaveBeenCalledTimes(2);
      expect(result1).toEqual(entry);
      expect(result2).toEqual(entry);
    });

    it('calls upsert with correct where/create/update shape', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue({ id: 'sp1' });
      mockPrisma.shortlistEntry.upsert.mockResolvedValue({});

      await service.addEntry(viewer, 'sl1', 'sp1');

      expect(mockPrisma.shortlistEntry.upsert).toHaveBeenCalledWith({
        where: { shortlistId_salespersonId: { shortlistId: 'sl1', salespersonId: 'sp1' } },
        create: { shortlistId: 'sl1', salespersonId: 'sp1' },
        update: {},
      });
    });
  });

  // ---------------------------------------------------------------------------
  // removeEntry
  // ---------------------------------------------------------------------------
  describe('removeEntry', () => {
    it('calls deleteMany and does not error even when entry does not exist', async () => {
      const sl = { id: 'sl1', companyId: 'co1' };
      mockPrisma.shortlist.findUnique.mockResolvedValue(sl);
      mockPrisma.shortlistEntry.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.removeEntry(viewer, 'sl1', 'sp-nonexistent')).resolves.not.toThrow();

      expect(mockPrisma.shortlistEntry.deleteMany).toHaveBeenCalledWith({
        where: { shortlistId: 'sl1', salespersonId: 'sp-nonexistent' },
      });
    });

    it('throws NotFoundException when shortlist is not found before deleteMany', async () => {
      mockPrisma.shortlist.findUnique.mockResolvedValue(null);

      await expect(service.removeEntry(viewer, 'missing-sl', 'sp1')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrisma.shortlistEntry.deleteMany).not.toHaveBeenCalled();
    });
  });
});
