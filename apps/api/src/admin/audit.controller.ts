import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Prisma, UserRole } from '@closdex/db';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ListAuditDto } from './dto/list-audit.dto';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: ListAuditDto) {
    const where: Prisma.AdminAuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = query.action;
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 50;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { actor: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
    return { items, total, page, perPage };
  }
}
