import { Injectable } from '@nestjs/common';
import { Prisma } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';

interface AuditEntry {
  actorId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/** Append-only admin action log. Callers MUST be inside an existing transaction
 *  client (`tx`) when the audit needs to atomically pair with another write. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(entry: AuditEntry, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.adminAuditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue,
      },
    });
  }
}
