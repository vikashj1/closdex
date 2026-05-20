import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { AuditService } from './audit.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Pending KYC queue — companies that haven't been actioned yet. */
  async listPending() {
    return this.prisma.company.findMany({
      where: { verification: VerificationStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, name: true, industry: true, website: true,
        gstin: true, pan: true, createdAt: true,
      },
    });
  }

  async approve(actor: AuthUser, companyId: string, notes?: string) {
    return this.setStatus(actor, companyId, VerificationStatus.VERIFIED, 'COMPANY_VERIFIED', notes);
  }

  async reject(actor: AuthUser, companyId: string, notes?: string) {
    return this.setStatus(actor, companyId, VerificationStatus.REJECTED, 'COMPANY_VERIFICATION_REJECTED', notes);
  }

  private async setStatus(
    actor: AuthUser,
    companyId: string,
    next: VerificationStatus,
    action: string,
    notes?: string,
  ) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Company not found.');
    if (company.verification === next) {
      throw new BadRequestException(`Company is already ${next}.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({
        where: { id: companyId },
        data: { verification: next },
      });
      await this.audit.log(
        {
          actorId: actor.id,
          action,
          entity: 'Company',
          entityId: companyId,
          metadata: { from: company.verification, to: next, notes },
        },
        tx,
      );
      return updated;
    });
  }
}
