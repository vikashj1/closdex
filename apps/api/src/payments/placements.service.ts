import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus, CompanyRole, InvoiceStatus, InvoiceType,
  PlacementStatus, Prisma, UserRole,
} from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { JobsService } from '../jobs/jobs.service';
import { ListPlacementsDto } from './dto/list-placements.dto';

/** Flat 18% GST on services for now (real GST classification depends on
 *  intra/inter state and the customer's GSTIN — polish slice). */
const GST_RATE = 0.18;

function shortToken(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function invoiceNumber(d: Date): string {
  const yyyymm =
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return `CLX-INV-${yyyymm}-${shortToken()}`;
}

@Injectable()
export class PlacementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
  ) {}

  /** Confirm a hire. Application must be in OFFERED. Creates Placement + DRAFT Invoice
   *  atomically, then transitions the Application to HIRED. */
  async hire(
    viewer: AuthUser,
    applicationId: string,
    annualCtc: number,
    commissionRate: number,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) throw new NotFoundException('Application not found.');
    await this.jobs.assertCompanyMember(viewer, application.job.companyId, [
      CompanyRole.ADMIN, CompanyRole.RECRUITER,
    ]);

    if (application.status !== ApplicationStatus.OFFERED) {
      throw new BadRequestException(
        `Application must be in OFFERED before hire; current=${application.status}.`,
      );
    }
    const existing = await this.prisma.placement.findUnique({
      where: { applicationId },
    });
    if (existing) {
      throw new BadRequestException('Placement already recorded for this application.');
    }

    const commissionAmount = Math.round(annualCtc * commissionRate);
    // Invoice.amount is stored in paise (per schema comment). commissionAmount is rupees.
    const invoiceAmountPaise = commissionAmount * 100;
    const gstAmountPaise = Math.round(invoiceAmountPaise * GST_RATE);

    const result = await this.prisma.$transaction(async (tx) => {
      const placement = await tx.placement.create({
        data: {
          jobId: application.jobId,
          applicationId,
          companyId: application.job.companyId,
          salespersonId: application.salespersonId,
          annualCtc,
          commissionRate,
          commissionAmount,
          status: PlacementStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          companyId: application.job.companyId,
          type: InvoiceType.PLACEMENT_COMMISSION,
          placementId: placement.id,
          number: invoiceNumber(new Date()),
          amount: invoiceAmountPaise,
          gstAmount: gstAmountPaise,
          status: InvoiceStatus.DRAFT,
        },
      });

      await tx.application.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.HIRED },
      });

      return { placement, invoice };
    });

    return { ...result, applicationStatus: ApplicationStatus.HIRED };
  }

  async list(viewer: AuthUser, query: ListPlacementsDto) {
    await this.jobs.assertCompanyMember(viewer, query.companyId, [
      CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
    ]);
    const where: Prisma.PlacementWhereInput = { companyId: query.companyId };
    if (query.status) where.status = query.status;
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.placement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          job: { select: { id: true, title: true } },
          salesperson: {
            select: {
              id: true, publicSlug: true, rank: true,
              user: { select: { name: true } },
            },
          },
          invoice: { select: { id: true, number: true, status: true, amount: true } },
        },
      }),
      this.prisma.placement.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  async get(viewer: AuthUser, id: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
      include: {
        job: true,
        salesperson: { include: { user: { select: { name: true, email: true } } } },
        invoice: true,
      },
    });
    if (!placement) throw new NotFoundException('Placement not found.');
    if (viewer.role !== UserRole.ADMIN) {
      await this.jobs.assertCompanyMember(viewer, placement.companyId, [
        CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
      ]);
    }
    return placement;
  }

  /** Called from InvoicesService when an invoice is marked paid — keep Placement in sync. */
  async markPaid(placementId: string) {
    await this.prisma.placement.update({
      where: { id: placementId },
      data: { status: PlacementStatus.PAID },
    });
  }

  /** Called from InvoicesService when an invoice is issued — keep Placement in sync. */
  async markInvoiced(placementId: string) {
    await this.prisma.placement.update({
      where: { id: placementId },
      data: { status: PlacementStatus.INVOICED },
    });
  }
}
