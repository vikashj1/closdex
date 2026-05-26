import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found.');
    return company;
  }

  async getStats(id: string, actorUserId: string) {
    await this.assertMember(id, actorUserId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    const [activeJobs, newApplicationsThisWeek, shortlistedCount, hiresThisQuarter, commissionAgg] =
      await Promise.all([
        this.prisma.job.count({ where: { companyId: id, status: 'LIVE' } }),
        this.prisma.application.count({
          where: { job: { companyId: id }, createdAt: { gte: weekAgo } },
        }),
        this.prisma.application.count({
          where: { job: { companyId: id }, status: 'SHORTLISTED' },
        }),
        this.prisma.placement.count({
          where: { companyId: id, createdAt: { gte: quarterStart } },
        }),
        this.prisma.placement.aggregate({
          _sum: { commissionAmount: true },
          where: { companyId: id, createdAt: { gte: quarterStart } },
        }),
      ]);

    return {
      activeJobs,
      newApplicationsThisWeek,
      shortlistedCount,
      hiresThisQuarter,
      commissionThisQuarter: commissionAgg._sum.commissionAmount ?? 0,
    };
  }

  /** Edit company profile. Only the company's ADMIN members can do this. */
  async update(id: string, actorUserId: string, dto: UpdateCompanyDto) {
    await this.assertAdmin(id, actorUserId);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  /** Re-submit for KYC review after a REJECTED decision. Resets status to PENDING. */
  async reapply(id: string, actorUserId: string) {
    await this.assertAdmin(id, actorUserId);
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found.');
    if (company.verification !== VerificationStatus.REJECTED) {
      throw new BadRequestException('Only rejected companies can re-apply for verification.');
    }
    return this.prisma.company.update({
      where: { id },
      data: { verification: VerificationStatus.PENDING },
    });
  }

  private async assertMember(companyId: string, userId: string) {
    const membership = await this.prisma.companyMembership.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });
    if (!membership) throw new ForbiddenException('Not a member of this company.');
  }

  private async assertAdmin(companyId: string, userId: string) {
    const membership = await this.prisma.companyMembership.findUnique({
      where: { companyId_userId: { companyId, userId } },
    });
    if (!membership || membership.companyRole !== 'ADMIN') {
      throw new ForbiddenException('Only company admins can perform this action.');
    }
  }
}
