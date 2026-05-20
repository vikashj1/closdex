import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, CompanyRole, JobStatus, Rank, UserRole } from '@closdex/db';
import { ApplicationsService } from './applications.service';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../auth/jwt.strategy';

/**
 * Unit tests for ApplicationsService. Validates the apply guardrails
 * (role, profile, job status, deadline, rank gate, duplicate), the ATS
 * state machine, and notification side-effects.
 */

const SP_USER: AuthUser = { id: 'u-sp', email: 'sp@x.com', role: UserRole.SALESPERSON };
const CO_USER: AuthUser = { id: 'u-co', email: 'co@x.com', role: UserRole.COMPANY };
const ADMIN: AuthUser = { id: 'u-ad', email: 'ad@x.com', role: UserRole.ADMIN };

function makeJob(overrides: any = {}) {
  return {
    id: 'job-1',
    companyId: 'co-1',
    status: JobStatus.LIVE,
    applicationDeadline: null,
    minRank: null,
    title: 'AE',
    ...overrides,
  };
}

function makeProfile(overrides: any = {}) {
  return {
    id: 'sp-1',
    userId: SP_USER.id,
    rank: Rank.GOLD,
    resumeUrl: 'https://cdn/r.pdf',
    ...overrides,
  };
}

function makePrismaMock(opts: {
  profile?: any;
  job?: any;
  existingApplication?: any;
  application?: any;
} = {}) {
  return {
    salespersonProfile: {
      findUnique: jest.fn().mockResolvedValue(opts.profile ?? null),
    },
    job: {
      findUnique: jest.fn().mockResolvedValue(opts.job ?? null),
    },
    application: {
      findUnique: jest.fn().mockImplementation(async (args: any) => {
        // Existing-application check uses jobId_salespersonId; direct id uses { id }.
        if (args.where?.jobId_salespersonId) return opts.existingApplication ?? null;
        return opts.application ?? null;
      }),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'app-new', status: ApplicationStatus.APPLIED }),
      update: jest.fn().mockImplementation(async ({ data }: any) => ({
        id: 'app-1',
        ...data,
        jobId: 'job-1',
        salesperson: { userId: SP_USER.id },
        job: { id: 'job-1', title: 'AE', companyId: 'co-1', company: { name: 'Razorpay' } },
      })),
    },
  } as unknown as PrismaService;
}

function makeJobsService(): JobsService & { assertCompanyMember: jest.Mock } {
  return { assertCompanyMember: jest.fn().mockResolvedValue(undefined) } as any;
}

function makeNotifications(): NotificationsService & { notify: jest.Mock } {
  return { notify: jest.fn().mockResolvedValue(undefined) } as any;
}

describe('ApplicationsService', () => {
  describe('apply', () => {
    it('rejects non-salesperson with ForbiddenException', async () => {
      const svc = new ApplicationsService(makePrismaMock(), makeJobsService(), makeNotifications());
      await expect(svc.apply(CO_USER, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws NotFound when salesperson profile missing', async () => {
      const prisma = makePrismaMock({ profile: null });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when job missing', async () => {
      const prisma = makePrismaMock({ profile: makeProfile(), job: null });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when job is not LIVE', async () => {
      const prisma = makePrismaMock({
        profile: makeProfile(),
        job: makeJob({ status: JobStatus.PAUSED }),
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when application deadline has passed', async () => {
      const yesterday = new Date(Date.now() - 86_400_000);
      const prisma = makePrismaMock({
        profile: makeProfile(),
        job: makeJob({ applicationDeadline: yesterday }),
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when salesperson rank is below job.minRank', async () => {
      const prisma = makePrismaMock({
        profile: makeProfile({ rank: Rank.SILVER }),
        job: makeJob({ minRank: Rank.PLATINUM }),
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('accepts when salesperson rank equals job.minRank', async () => {
      const prisma = makePrismaMock({
        profile: makeProfile({ rank: Rank.GOLD }),
        job: makeJob({ minRank: Rank.GOLD }),
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      const result = await svc.apply(SP_USER, 'job-1');
      expect(result.id).toBe('app-new');
    });

    it('rejects duplicate applications', async () => {
      const prisma = makePrismaMock({
        profile: makeProfile(),
        job: makeJob(),
        existingApplication: { id: 'already' },
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.apply(SP_USER, 'job-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('successful apply snapshots resumeUrl into the application row', async () => {
      const prisma = makePrismaMock({
        profile: makeProfile({ resumeUrl: 'https://cdn/me-v2.pdf' }),
        job: makeJob(),
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await svc.apply(SP_USER, 'job-1');
      const args = (prisma.application.create as jest.Mock).mock.calls[0][0];
      expect(args.data).toMatchObject({
        jobId: 'job-1',
        salespersonId: 'sp-1',
        resumeUrlSnapshot: 'https://cdn/me-v2.pdf',
      });
    });
  });

  describe('listForJob', () => {
    it('throws NotFound when job missing', async () => {
      const prisma = makePrismaMock({ job: null });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.listForJob(CO_USER, 'job-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('runs the assertCompanyMember gate before reading applicants', async () => {
      const jobs = makeJobsService();
      const prisma = makePrismaMock({ job: makeJob() });
      const svc = new ApplicationsService(prisma, jobs, makeNotifications());
      await svc.listForJob(CO_USER, 'job-1');
      expect(jobs.assertCompanyMember).toHaveBeenCalledWith(
        CO_USER,
        'co-1',
        [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER],
      );
    });
  });

  describe('listMine', () => {
    it('returns [] for non-salesperson without hitting Prisma', async () => {
      const prisma = makePrismaMock();
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      const result = await svc.listMine(CO_USER);
      expect(result).toEqual([]);
      expect(prisma.salespersonProfile.findUnique).not.toHaveBeenCalled();
    });

    it('returns [] when salesperson has no profile', async () => {
      const prisma = makePrismaMock({ profile: null });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      const result = await svc.listMine(SP_USER);
      expect(result).toEqual([]);
    });

    it('filters by salespersonId when profile exists', async () => {
      const prisma = makePrismaMock({ profile: makeProfile() });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await svc.listMine(SP_USER);
      const args = (prisma.application.findMany as jest.Mock).mock.calls[0][0];
      expect(args.where).toEqual({ salespersonId: 'sp-1' });
    });
  });

  describe('get', () => {
    it('throws NotFound for missing application', async () => {
      const prisma = makePrismaMock({ application: null });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(svc.get(SP_USER, 'app-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('salesperson owner reads without going through company gate', async () => {
      const jobs = makeJobsService();
      const prisma = makePrismaMock({
        application: {
          id: 'app-1',
          job: { companyId: 'co-1' },
          salesperson: { userId: SP_USER.id },
        },
      });
      const svc = new ApplicationsService(prisma, jobs, makeNotifications());
      const result = await svc.get(SP_USER, 'app-1');
      expect(result.id).toBe('app-1');
      expect(jobs.assertCompanyMember).not.toHaveBeenCalled();
    });

    it('non-owner salesperson must satisfy company gate (and fails when not a member)', async () => {
      const jobs = makeJobsService();
      (jobs.assertCompanyMember as jest.Mock).mockRejectedValue(new ForbiddenException());
      const prisma = makePrismaMock({
        application: {
          id: 'app-1',
          job: { companyId: 'co-1' },
          salesperson: { userId: 'other-user' },
        },
      });
      const svc = new ApplicationsService(prisma, jobs, makeNotifications());
      await expect(svc.get(SP_USER, 'app-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('admin reads any application without going through company gate', async () => {
      const jobs = makeJobsService();
      const prisma = makePrismaMock({
        application: {
          id: 'app-1',
          job: { companyId: 'co-1' },
          salesperson: { userId: 'someone-else' },
        },
      });
      const svc = new ApplicationsService(prisma, jobs, makeNotifications());
      await svc.get(ADMIN, 'app-1');
      expect(jobs.assertCompanyMember).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('rejects invalid transition with BadRequest', async () => {
      const prisma = makePrismaMock({
        application: { id: 'app-1', status: ApplicationStatus.APPLIED, job: { companyId: 'co-1' } },
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(
        svc.updateStatus(CO_USER, 'app-1', ApplicationStatus.HIRED),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects transitions out of HIRED (terminal)', async () => {
      const prisma = makePrismaMock({
        application: { id: 'app-1', status: ApplicationStatus.HIRED, job: { companyId: 'co-1' } },
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), makeNotifications());
      await expect(
        svc.updateStatus(CO_USER, 'app-1', ApplicationStatus.OFFERED),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('valid APPLIED → SHORTLISTED transitions and notifies the applicant', async () => {
      const notifications = makeNotifications();
      const prisma = makePrismaMock({
        application: { id: 'app-1', status: ApplicationStatus.APPLIED, job: { companyId: 'co-1' } },
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), notifications);
      await svc.updateStatus(CO_USER, 'app-1', ApplicationStatus.SHORTLISTED);
      expect(prisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-1' },
          data: { status: ApplicationStatus.SHORTLISTED },
        }),
      );
      expect(notifications.notify).toHaveBeenCalledTimes(1);
      const payload = notifications.notify.mock.calls[0][0];
      expect(payload.type).toBe('APPLICATION_STATUS');
      expect(payload.payload.status).toBe(ApplicationStatus.SHORTLISTED);
    });

    it('OFFERED → HIRED transitions but skips the notification (hire flow handles it)', async () => {
      const notifications = makeNotifications();
      const prisma = makePrismaMock({
        application: { id: 'app-1', status: ApplicationStatus.OFFERED, job: { companyId: 'co-1' } },
      });
      const svc = new ApplicationsService(prisma, makeJobsService(), notifications);
      await svc.updateStatus(CO_USER, 'app-1', ApplicationStatus.HIRED);
      expect(prisma.application.update).toHaveBeenCalled();
      expect(notifications.notify).not.toHaveBeenCalled();
    });
  });
});
