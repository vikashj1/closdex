import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRole, VerificationStatus } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { AuditService } from './audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
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

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.company.update({
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
      return u;
    });

    // Notify the company's ADMIN members of the outcome.
    const admins = await this.prisma.companyMembership.findMany({
      where: { companyId, companyRole: CompanyRole.ADMIN },
      select: { userId: true },
    });
    if (admins.length > 0) {
      await this.notifications.notifyMany(admins.map((a) => a.userId), {
        type: next === VerificationStatus.VERIFIED ? 'COMPANY_VERIFIED' : 'COMPANY_VERIFICATION_REJECTED',
        title:
          next === VerificationStatus.VERIFIED
            ? `${company.name} verification approved`
            : `${company.name} verification rejected`,
        body:
          next === VerificationStatus.VERIFIED
            ? `Your company profile has been verified. You can now post jobs and access full marketplace features.${notes ? `\n\nAdmin note: ${notes}` : ''}`
            : `Your verification was declined.${notes ? `\n\nReason: ${notes}` : ''} You can update your KYC details and resubmit.`,
        payload: { companyId, status: next },
      });
    }

    return updated;
  }
}
