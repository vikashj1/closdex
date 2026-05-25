import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CompanyRole, JobStatus, UserRole } from '@closdex/db';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';

/**
 * Unit tests for JobsService. PrismaService is mocked. Covers visibility
 * rules (only LIVE jobs leak to outsiders), the job state machine
 * (DRAFT → LIVE → PAUSED ↔ LIVE → CLOSED, plus repost), and the company
 * membership guards used by both jobs.service and applications.service.
 */

const SP_USER: AuthUser = { id: 'u-sp', email: 'sp@x.com', role: UserRole.SALESPERSON };
const CO_USER: AuthUser = { id: 'u-co', email: 'co@x.com', role: UserRole.COMPANY };
const ADMIN: AuthUser = { id: 'u-ad', email: 'ad@x.com', role: UserRole.ADMIN };

function makeJob(overrides: any = {}) {
  return {
    id: 'job-1',
    companyId: 'co-1',
    status: JobStatus.LIVE,
    location: 'Bangalore',
    ...overrides,
  };
}

function makePrismaMock(opts: {
  job?: any;
  jobs?: any[];
  count?: number;
  membership?: any;
} = {}) {
  return {
    job: {
      findUnique: jest.fn().mockResolvedValue(opts.job ?? null),
      findMany: jest.fn().mockResolvedValue(opts.jobs ?? []),
      count: jest.fn().mockResolvedValue(opts.count ?? 0),
      create: jest.fn().mockResolvedValue({ id: 'job-new' }),
      update: jest.fn().mockImplementation(async ({ data }: any) => ({ ...(opts.job ?? makeJob()), ...data })),
    },
    companyMembership: {
      findUnique: jest.fn().mockResolvedValue(opts.membership ?? null),
    },
    $transaction: jest.fn(async (queries: any[]) => Promise.all(queries.map((q) => q))),
  } as unknown as PrismaService;
}

describe('JobsService', () => {
  describe('list — visibility', () => {
    it('forces status=LIVE for outsiders (non-admin, non-member)', async () => {
      const prisma = makePrismaMock({ jobs: [], count: 0 });
      const svc = new JobsService(prisma);
      await svc.list(SP_USER, { companyId: 'co-1', status: JobStatus.DRAFT } as any);
      const findManyArgs = (prisma.job.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyArgs.where.status).toBe(JobStatus.LIVE);
    });

    it('honors query.status for platform admin', async () => {
      const prisma = makePrismaMock({ jobs: [], count: 0 });
      const svc = new JobsService(prisma);
      await svc.list(ADMIN, { status: JobStatus.DRAFT } as any);
      const findManyArgs = (prisma.job.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyArgs.where.status).toBe(JobStatus.DRAFT);
    });

    it('honors query.status for a member of the queried company', async () => {
      const prisma = makePrismaMock({
        jobs: [],
        count: 0,
        membership: { companyRole: CompanyRole.RECRUITER },
      });
      const svc = new JobsService(prisma);
      await svc.list(CO_USER, { companyId: 'co-1', status: JobStatus.PAUSED } as any);
      const findManyArgs = (prisma.job.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyArgs.where.status).toBe(JobStatus.PAUSED);
    });
  });

  describe('get', () => {
    it('throws NotFound when job missing', async () => {
      const prisma = makePrismaMock({ job: null });
      const svc = new JobsService(prisma);
      await expect(svc.get(SP_USER, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns LIVE jobs to anyone', async () => {
      const prisma = makePrismaMock({ job: makeJob({ status: JobStatus.LIVE }) });
      const svc = new JobsService(prisma);
      const result = await svc.get(SP_USER, 'job-1');
      expect(result.id).toBe('job-1');
    });

    it('hides DRAFT jobs from non-members', async () => {
      const prisma = makePrismaMock({ job: makeJob({ status: JobStatus.DRAFT }), membership: null });
      const svc = new JobsService(prisma);
      await expect(svc.get(SP_USER, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('shows DRAFT jobs to company members', async () => {
      const prisma = makePrismaMock({
        job: makeJob({ status: JobStatus.DRAFT }),
        membership: { companyRole: CompanyRole.RECRUITER },
      });
      const svc = new JobsService(prisma);
      const result = await svc.get(CO_USER, 'job-1');
      expect(result.id).toBe('job-1');
    });
  });

  describe('state machine — publish/pause/close/repost', () => {
    it('publish: DRAFT → LIVE allowed', async () => {
      const job = makeJob({ status: JobStatus.DRAFT });
      const prisma = makePrismaMock({ job, membership: { companyRole: CompanyRole.ADMIN } });
      const svc = new JobsService(prisma);
      const result = await svc.publish(CO_USER, 'job-1');
      expect((prisma.job.update as jest.Mock).mock.calls[0][0].data).toEqual({ status: JobStatus.LIVE });
      expect(result.status).toBe(JobStatus.LIVE);
    });

    it('publish: PAUSED → LIVE allowed', async () => {
      const job = makeJob({ status: JobStatus.PAUSED });
      const prisma = makePrismaMock({ job, membership: { companyRole: CompanyRole.RECRUITER } });
      const svc = new JobsService(prisma);
      await svc.publish(CO_USER, 'job-1');
      expect(prisma.job.update).toHaveBeenCalled();
    });

    it('publish: LIVE → LIVE rejected', async () => {
      const job = makeJob({ status: JobStatus.LIVE });
      const prisma = makePrismaMock({ job, membership: { companyRole: CompanyRole.ADMIN } });
      const svc = new JobsService(prisma);
      await expect(svc.publish(CO_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('pause: only LIVE → PAUSED allowed', async () => {
      const drafted = makeJob({ status: JobStatus.DRAFT });
      const prisma = makePrismaMock({ job: drafted, membership: { companyRole: CompanyRole.ADMIN } });
      const svc = new JobsService(prisma);
      await expect(svc.pause(CO_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('close: allowed from DRAFT, LIVE, PAUSED', async () => {
      for (const from of [JobStatus.DRAFT, JobStatus.LIVE, JobStatus.PAUSED]) {
        const job = makeJob({ status: from });
        const prisma = makePrismaMock({ job, membership: { companyRole: CompanyRole.ADMIN } });
        const svc = new JobsService(prisma);
        const result = await svc.close(CO_USER, 'job-1');
        expect(result.status).toBe(JobStatus.CLOSED);
      }
    });

    it('repost: only CLOSED → LIVE allowed', async () => {
      const closed = makeJob({ status: JobStatus.CLOSED });
      const prismaOk = makePrismaMock({ job: closed, membership: { companyRole: CompanyRole.ADMIN } });
      const svcOk = new JobsService(prismaOk);
      const result = await svcOk.repost(CO_USER, 'job-1');
      expect(result.status).toBe(JobStatus.LIVE);

      const live = makeJob({ status: JobStatus.LIVE });
      const prismaBad = makePrismaMock({ job: live, membership: { companyRole: CompanyRole.ADMIN } });
      const svcBad = new JobsService(prismaBad);
      await expect(svcBad.repost(CO_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('transition guards run before membership errors do not mask state machine', async () => {
      const job = makeJob({ status: JobStatus.LIVE });
      const prisma = makePrismaMock({ job, membership: null });
      const svc = new JobsService(prisma);
      // Membership check fires first inside setStatus(), so this is Forbidden, not BadRequest.
      await expect(svc.publish(CO_USER, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('assertCompanyMember', () => {
    it('admins bypass the membership check', async () => {
      const prisma = makePrismaMock({ membership: null });
      const svc = new JobsService(prisma);
      await expect(
        svc.assertCompanyMember(ADMIN, 'co-1', [CompanyRole.ADMIN]),
      ).resolves.toBeUndefined();
      expect(prisma.companyMembership.findUnique).not.toHaveBeenCalled();
    });

    it('throws Forbidden when not a member', async () => {
      const prisma = makePrismaMock({ membership: null });
      const svc = new JobsService(prisma);
      await expect(
        svc.assertCompanyMember(CO_USER, 'co-1', [CompanyRole.ADMIN]),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws Forbidden when member but role not allowed', async () => {
      const prisma = makePrismaMock({ membership: { companyRole: CompanyRole.VIEWER } });
      const svc = new JobsService(prisma);
      await expect(
        svc.assertCompanyMember(CO_USER, 'co-1', [CompanyRole.ADMIN, CompanyRole.RECRUITER]),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('resolves when role is in the allowed set', async () => {
      const prisma = makePrismaMock({ membership: { companyRole: CompanyRole.RECRUITER } });
      const svc = new JobsService(prisma);
      await expect(
        svc.assertCompanyMember(CO_USER, 'co-1', [CompanyRole.ADMIN, CompanyRole.RECRUITER]),
      ).resolves.toBeUndefined();
    });
  });

  describe('create + update', () => {
    it('create requires ADMIN or RECRUITER company role', async () => {
      const prisma = makePrismaMock({ membership: { companyRole: CompanyRole.VIEWER } });
      const svc = new JobsService(prisma);
      await expect(
        svc.create(CO_USER, { companyId: 'co-1', title: 'AE', persona: 'IT' } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('update throws NotFound for missing job', async () => {
      const prisma = makePrismaMock({ job: null });
      const svc = new JobsService(prisma);
      await expect(svc.update(CO_USER, 'missing', { title: 'X' } as any))
        .rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('saved jobs', () => {
    const SP: AuthUser = { id: 'u-sp', email: 'sp@x.com', role: UserRole.SALESPERSON };

    function makeSavedPrisma(sp: any, savedRows: any[] = []) {
      return {
        salespersonProfile: { findUnique: jest.fn().mockResolvedValue(sp) },
        savedJob: {
          upsert: jest.fn().mockResolvedValue({}),
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          findMany: jest.fn().mockResolvedValue(savedRows),
        },
        job: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          count: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        companyMembership: { findUnique: jest.fn() },
        $transaction: jest.fn(),
      } as unknown as PrismaService;
    }

    describe('saveJob()', () => {
      it('throws ForbiddenException when no salesperson profile', async () => {
        const prisma = makeSavedPrisma(null);
        const svc = new JobsService(prisma);
        await expect(svc.saveJob(SP, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
      });

      it('calls savedJob.upsert with correct unique key when profile exists', async () => {
        const sp = { id: 'sp-1' };
        const prisma = makeSavedPrisma(sp);
        const svc = new JobsService(prisma);
        const result = await svc.saveJob(SP, 'job-1');
        expect(prisma.savedJob.upsert).toHaveBeenCalledWith({
          where: { jobId_salespersonId: { jobId: 'job-1', salespersonId: 'sp-1' } },
          create: { jobId: 'job-1', salespersonId: 'sp-1' },
          update: {},
        });
        expect(result).toEqual({ saved: true });
      });
    });

    describe('unsaveJob()', () => {
      it('throws ForbiddenException when no salesperson profile', async () => {
        const prisma = makeSavedPrisma(null);
        const svc = new JobsService(prisma);
        await expect(svc.unsaveJob(SP, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
      });

      it('calls savedJob.deleteMany when profile exists', async () => {
        const sp = { id: 'sp-1' };
        const prisma = makeSavedPrisma(sp);
        const svc = new JobsService(prisma);
        const result = await svc.unsaveJob(SP, 'job-1');
        expect(prisma.savedJob.deleteMany).toHaveBeenCalledWith({
          where: { jobId: 'job-1', salespersonId: 'sp-1' },
        });
        expect(result).toEqual({ saved: false });
      });
    });

    describe('savedJobIds()', () => {
      it('returns [] when no profile', async () => {
        const prisma = makeSavedPrisma(null);
        const svc = new JobsService(prisma);
        const result = await svc.savedJobIds(SP);
        expect(result).toEqual([]);
      });

      it('returns array of jobId strings when profile exists', async () => {
        const sp = { id: 'sp-1' };
        const savedRows = [{ jobId: 'job-1' }, { jobId: 'job-2' }];
        const prisma = makeSavedPrisma(sp, savedRows);
        const svc = new JobsService(prisma);
        const result = await svc.savedJobIds(SP);
        expect(result).toEqual(['job-1', 'job-2']);
      });
    });

    describe('listSaved()', () => {
      it('returns [] when no profile', async () => {
        const prisma = makeSavedPrisma(null);
        const svc = new JobsService(prisma);
        const result = await svc.listSaved(SP);
        expect(result).toEqual([]);
      });

      it('maps saved.job into flat objects with savedAt', async () => {
        const sp = { id: 'sp-1' };
        const now = new Date();
        const savedRows = [
          {
            createdAt: now,
            job: { id: 'job-1', title: 'AE', company: { id: 'co-1', name: 'Acme' } },
          },
        ];
        const prisma = makeSavedPrisma(sp, savedRows);
        const svc = new JobsService(prisma);
        const result = await svc.listSaved(SP);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ id: 'job-1', title: 'AE', savedAt: now });
      });
    });
  });
});
