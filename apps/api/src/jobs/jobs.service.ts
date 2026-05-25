import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRole, JobStatus, Prisma, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ListJobsDto } from './dto/list-jobs.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(viewer: AuthUser, query: ListJobsDto) {
    const where: Prisma.JobWhereInput = {};
    if (query.location) where.location = query.location;
    if (query.specializationTag) where.specializationTag = query.specializationTag;
    if (query.companyId) where.companyId = query.companyId;

    // Visibility:
    // - Platform ADMIN: status honored (or unrestricted).
    // - Member of the queried company: status honored (or unrestricted).
    // - Everyone else: forced to LIVE.
    const isMemberOfQueriedCompany =
      !!query.companyId && (await this.isCompanyMember(viewer, query.companyId));
    if (viewer.role === UserRole.ADMIN || isMemberOfQueriedCompany) {
      if (query.status) where.status = query.status;
    } else {
      where.status = JobStatus.LIVE;
    }

    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          company: { select: { id: true, name: true, logoUrl: true, industry: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  async get(viewer: AuthUser, id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true, logoUrl: true, industry: true } } },
    });
    if (!job) throw new NotFoundException('Job not found.');
    // DRAFT or PAUSED jobs are visible only to platform admins and company members.
    if (job.status !== JobStatus.LIVE && job.status !== JobStatus.CLOSED) {
      if (!(await this.isCompanyMember(viewer, job.companyId))) {
        throw new ForbiddenException('Job is not available.');
      }
    }
    return job;
  }

  async create(viewer: AuthUser, dto: CreateJobDto) {
    await this.assertCompanyMember(viewer, dto.companyId, [CompanyRole.ADMIN, CompanyRole.RECRUITER]);
    const { companyId, applicationDeadline, ...rest } = dto;
    return this.prisma.job.create({
      data: {
        ...rest,
        companyId,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      },
    });
  }

  async update(viewer: AuthUser, id: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found.');
    await this.assertCompanyMember(viewer, job.companyId, [CompanyRole.ADMIN, CompanyRole.RECRUITER]);
    const { applicationDeadline, ...rest } = dto;
    const data: Prisma.JobUpdateInput = { ...rest };
    if (applicationDeadline !== undefined) {
      data.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
    }
    return this.prisma.job.update({ where: { id }, data });
  }

  publish(viewer: AuthUser, id: string) {
    return this.setStatus(viewer, id, JobStatus.LIVE, [JobStatus.DRAFT, JobStatus.PAUSED]);
  }
  pause(viewer: AuthUser, id: string) {
    return this.setStatus(viewer, id, JobStatus.PAUSED, [JobStatus.LIVE]);
  }
  close(viewer: AuthUser, id: string) {
    return this.setStatus(viewer, id, JobStatus.CLOSED, [
      JobStatus.DRAFT, JobStatus.LIVE, JobStatus.PAUSED,
    ]);
  }
  repost(viewer: AuthUser, id: string) {
    return this.setStatus(viewer, id, JobStatus.LIVE, [JobStatus.CLOSED]);
  }

  private async setStatus(
    viewer: AuthUser,
    id: string,
    next: JobStatus,
    allowedFrom: JobStatus[],
  ) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found.');
    await this.assertCompanyMember(viewer, job.companyId, [CompanyRole.ADMIN, CompanyRole.RECRUITER]);
    if (!allowedFrom.includes(job.status)) {
      throw new BadRequestException(`Cannot transition job from ${job.status} to ${next}.`);
    }
    return this.prisma.job.update({ where: { id }, data: { status: next } });
  }

  private async isCompanyMember(viewer: AuthUser, companyId: string): Promise<boolean> {
    if (viewer.role === UserRole.ADMIN) return true;
    const m = await this.prisma.companyMembership.findUnique({
      where: { companyId_userId: { companyId, userId: viewer.id } },
    });
    return !!m;
  }

  // ─── Saved jobs ──────────────────────────────────────────────────────────

  async saveJob(viewer: AuthUser, jobId: string) {
    const sp = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!sp) throw new ForbiddenException('Only salespersons can save jobs.');
    await this.prisma.savedJob.upsert({
      where: { jobId_salespersonId: { jobId, salespersonId: sp.id } },
      create: { jobId, salespersonId: sp.id },
      update: {},
    });
    return { saved: true };
  }

  async unsaveJob(viewer: AuthUser, jobId: string) {
    const sp = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!sp) throw new ForbiddenException('Only salespersons can unsave jobs.');
    await this.prisma.savedJob.deleteMany({
      where: { jobId, salespersonId: sp.id },
    });
    return { saved: false };
  }

  async listSaved(viewer: AuthUser) {
    const sp = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!sp) return [];
    const saved = await this.prisma.savedJob.findMany({
      where: { salespersonId: sp.id },
      include: {
        job: {
          include: { company: { select: { id: true, name: true, logoUrl: true, industry: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => ({ ...s.job, savedAt: s.createdAt }));
  }

  async savedJobIds(viewer: AuthUser): Promise<string[]> {
    const sp = await this.prisma.salespersonProfile.findUnique({ where: { userId: viewer.id } });
    if (!sp) return [];
    const saved = await this.prisma.savedJob.findMany({
      where: { salespersonId: sp.id },
      select: { jobId: true },
    });
    return saved.map((s) => s.jobId);
  }

  /** Throws ForbiddenException if not a company member with one of the allowed roles.
   *  Platform admins bypass. Exported for use by ApplicationsService. */
  async assertCompanyMember(
    viewer: AuthUser,
    companyId: string,
    allowedRoles: CompanyRole[],
  ): Promise<void> {
    if (viewer.role === UserRole.ADMIN) return;
    const m = await this.prisma.companyMembership.findUnique({
      where: { companyId_userId: { companyId, userId: viewer.id } },
    });
    if (!m || !allowedRoles.includes(m.companyRole)) {
      throw new ForbiddenException('Insufficient company role for this action.');
    }
  }
}
