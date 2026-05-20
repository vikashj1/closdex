import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyRole, InvoiceStatus, Prisma, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { JobsService } from '../jobs/jobs.service';
import { PlacementsService } from './placements.service';
import { ListInvoicesDto } from './dto/list-invoices.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    private readonly placements: PlacementsService,
  ) {}

  async list(viewer: AuthUser, query: ListInvoicesDto) {
    await this.jobs.assertCompanyMember(viewer, query.companyId, [
      CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
    ]);
    const where: Prisma.InvoiceWhereInput = { companyId: query.companyId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { placement: { select: { id: true, salespersonId: true, annualCtc: true } } },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  async get(viewer: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, gstin: true } },
        placement: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    if (viewer.role !== UserRole.ADMIN) {
      await this.jobs.assertCompanyMember(viewer, invoice.companyId, [
        CompanyRole.ADMIN, CompanyRole.RECRUITER, CompanyRole.VIEWER,
      ]);
    }
    return invoice;
  }

  /** DRAFT → ISSUED. Sets issuedAt; flips paired Placement to INVOICED. */
  async issue(viewer: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    await this.jobs.assertCompanyMember(viewer, invoice.companyId, [CompanyRole.ADMIN]);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(`Cannot issue invoice in status ${invoice.status}.`);
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.ISSUED, issuedAt: new Date() },
    });
    if (invoice.placementId) await this.placements.markInvoiced(invoice.placementId);
    return updated;
  }

  /** ISSUED → PAID. Manual marking for slice 1; M7 slice 2 wires the Razorpay webhook. */
  async markPaid(viewer: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    await this.jobs.assertCompanyMember(viewer, invoice.companyId, [CompanyRole.ADMIN]);
    if (invoice.status !== InvoiceStatus.ISSUED) {
      throw new BadRequestException(`Cannot mark paid an invoice in status ${invoice.status}.`);
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });
    if (invoice.placementId) await this.placements.markPaid(invoice.placementId);
    return updated;
  }

  /** DRAFT → VOID. Issued/Paid invoices can't be voided through this path. */
  async void(viewer: AuthUser, id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    await this.jobs.assertCompanyMember(viewer, invoice.companyId, [CompanyRole.ADMIN]);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(`Cannot void an invoice in status ${invoice.status}.`);
    }
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.VOID },
    });
  }
}
