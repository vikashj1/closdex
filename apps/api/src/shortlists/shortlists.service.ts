import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { JobsService } from '../jobs/jobs.service';

const READ_ROLES = [CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER];
const WRITE_ROLES = [CompanyRole.ADMIN, CompanyRole.RECRUITER];

@Injectable()
export class ShortlistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  async create(viewer: AuthUser, companyId: string, name: string) {
    await this.jobs.assertCompanyMember(viewer, companyId, WRITE_ROLES);
    return this.prisma.shortlist.create({ data: { companyId, name } });
  }

  async listForCompany(viewer: AuthUser, companyId: string) {
    await this.jobs.assertCompanyMember(viewer, companyId, READ_ROLES);
    return this.prisma.shortlist.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { entries: true } } },
    });
  }

  async get(viewer: AuthUser, id: string) {
    const sl = await this.prisma.shortlist.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { createdAt: 'desc' },
          include: {
            salesperson: {
              select: {
                id: true, publicSlug: true, rank: true, totalPoints: true,
                experienceYears: true, specializationTags: true, openToWork: true,
                user: { select: { name: true, photoUrl: true, location: true } },
              },
            },
          },
        },
      },
    });
    if (!sl) throw new NotFoundException('Shortlist not found.');
    await this.jobs.assertCompanyMember(viewer, sl.companyId, READ_ROLES);
    return sl;
  }

  async delete(viewer: AuthUser, id: string) {
    const sl = await this.prisma.shortlist.findUnique({ where: { id } });
    if (!sl) throw new NotFoundException('Shortlist not found.');
    await this.jobs.assertCompanyMember(viewer, sl.companyId, WRITE_ROLES);
    await this.prisma.shortlist.delete({ where: { id } });
  }

  async addEntry(viewer: AuthUser, shortlistId: string, salespersonId: string) {
    const sl = await this.prisma.shortlist.findUnique({ where: { id: shortlistId } });
    if (!sl) throw new NotFoundException('Shortlist not found.');
    await this.jobs.assertCompanyMember(viewer, sl.companyId, WRITE_ROLES);

    const profile = await this.prisma.salespersonProfile.findUnique({
      where: { id: salespersonId },
    });
    if (!profile) throw new NotFoundException('Salesperson not found.');

    // Idempotent: same (shortlist, salesperson) pair returns the existing row.
    return this.prisma.shortlistEntry.upsert({
      where: { shortlistId_salespersonId: { shortlistId, salespersonId } },
      create: { shortlistId, salespersonId },
      update: {},
    });
  }

  async removeEntry(viewer: AuthUser, shortlistId: string, salespersonId: string) {
    const sl = await this.prisma.shortlist.findUnique({ where: { id: shortlistId } });
    if (!sl) throw new NotFoundException('Shortlist not found.');
    await this.jobs.assertCompanyMember(viewer, sl.companyId, WRITE_ROLES);
    await this.prisma.shortlistEntry.deleteMany({ where: { shortlistId, salespersonId } });
  }
}
