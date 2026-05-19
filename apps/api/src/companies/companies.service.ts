import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  /** Edit company profile. Only the company's ADMIN members can do this. */
  async update(id: string, actorUserId: string, dto: UpdateCompanyDto) {
    await this.assertAdmin(id, actorUserId);
    return this.prisma.company.update({ where: { id }, data: dto });
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
