import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, CompanyRole, JobStatus, Rank, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { JobsService } from './jobs.service';
import { NotificationsService } from '../notifications/notifications.service';

const RANK_ORDER: Rank[] = [
  Rank.ROOKIE, Rank.BRONZE, Rank.SILVER, Rank.GOLD,
  Rank.PLATINUM, Rank.DIAMOND, Rank.MASTER, Rank.GRANDMASTER,
];

const APPLICATION_TRANSITIONS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.VIEWED, ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.VIEWED]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.INTERVIEW]: [ApplicationStatus.OFFERED, ApplicationStatus.REJECTED],
  [ApplicationStatus.OFFERED]: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED],
  // HIRED and REJECTED are terminal.
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Salesperson one-click apply: profile + resume snapshot auto-attached. */
  async apply(viewer: AuthUser, jobId: string) {
    if (viewer.role !== UserRole.SALESPERSON) {
      throw new ForbiddenException('Only salespeople can apply.');
    }
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!profile) throw new NotFoundException('Salesperson profile missing.');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found.');
    if (job.status !== JobStatus.LIVE) {
      throw new BadRequestException('This job is not accepting applications.');
    }
    if (job.applicationDeadline && job.applicationDeadline.getTime() < Date.now()) {
      throw new BadRequestException('Application deadline has passed.');
    }
    if (job.minRank && !this.rankAtLeast(profile.rank, job.minRank)) {
      throw new ForbiddenException(`This job requires rank ${job.minRank} or higher.`);
    }
    const existing = await this.prisma.application.findUnique({
      where: { jobId_salespersonId: { jobId, salespersonId: profile.id } },
    });
    if (existing) throw new BadRequestException('You have already applied to this job.');

    return this.prisma.application.create({
      data: {
        jobId,
        salespersonId: profile.id,
        resumeUrlSnapshot: profile.resumeUrl,
      },
    });
  }

  /** Company-side ATS view of applicants for one of their jobs. */
  async listForJob(viewer: AuthUser, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found.');
    await this.jobs.assertCompanyMember(viewer, job.companyId, [
      CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
    ]);
    return this.prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        salesperson: {
          select: {
            id: true, publicSlug: true, rank: true, totalPoints: true,
            specializationTags: true, experienceYears: true, resumeUrl: true,
            user: { select: { name: true, photoUrl: true, email: true, location: true } },
          },
        },
      },
    });
  }

  /** Salesperson's own application list. */
  async listMine(viewer: AuthUser) {
    if (viewer.role !== UserRole.SALESPERSON) return [];
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!profile) return [];
    return this.prisma.application.findMany({
      where: { salespersonId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true, title: true, location: true, status: true,
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    });
  }

  async get(viewer: AuthUser, id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: { select: { id: true, name: true, logoUrl: true } } } },
        salesperson: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found.');

    // Salesperson sees their own; company members of the job's company see it; admins see all.
    const isOwner =
      viewer.role === UserRole.SALESPERSON && app.salesperson.userId === viewer.id;
    if (!isOwner && viewer.role !== UserRole.ADMIN) {
      await this.jobs.assertCompanyMember(viewer, app.job.companyId, [
        CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
      ]);
    }
    return app;
  }

  async updateStatus(viewer: AuthUser, id: string, next: ApplicationStatus) {
    const app = await this.prisma.application.findUnique({
      where: { id }, include: { job: true },
    });
    if (!app) throw new NotFoundException('Application not found.');
    await this.jobs.assertCompanyMember(viewer, app.job.companyId, [
      CompanyRole.ADMIN, CompanyRole.RECRUITER,
    ]);
    if (!(APPLICATION_TRANSITIONS[app.status] ?? []).includes(next)) {
      throw new BadRequestException(`Cannot transition application from ${app.status} to ${next}.`);
    }
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: next },
      include: {
        job: { include: { company: { select: { name: true } } } },
        salesperson: { select: { userId: true } },
      },
    });
    // Notify the applicant — HIRED is handled by the hire flow in PaymentsModule.
    if (next !== ApplicationStatus.HIRED) {
      await this.notifications.notify({
        userId: updated.salesperson.userId,
        type: 'APPLICATION_STATUS',
        title: `Application update: ${next.toLowerCase()}`,
        body: `Your application for "${updated.job.title}" at ${updated.job.company.name} is now ${next}.`,
        payload: { applicationId: id, jobId: updated.jobId, status: next },
      });
    }
    return updated;
  }

  private rankAtLeast(actual: Rank, required: Rank): boolean {
    return RANK_ORDER.indexOf(actual) >= RANK_ORDER.indexOf(required);
  }
}
