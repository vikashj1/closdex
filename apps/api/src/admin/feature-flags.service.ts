import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { AuthUser } from '../auth/jwt.strategy';

export interface UpsertFlagInput {
  key: string;
  label: string;
  description: string;
  enabled?: boolean;
  rollout?: number;
  publicRead?: boolean;
}

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  /** Public projection — only flags with publicRead=true, only key + enabled
   *  fields. Rollout stays admin-only so cheaters can't discover which
   *  anti-cheat features are partially rolled out. */
  async listPublic() {
    const flags = await this.prisma.featureFlag.findMany({
      where: { publicRead: true },
      select: { key: true, enabled: true, rollout: true },
    });
    return flags.map((f) => ({ key: f.key, enabled: f.enabled && f.rollout > 0 }));
  }

  async upsert(actor: AuthUser, input: UpsertFlagInput) {
    if (input.rollout != null && (input.rollout < 0 || input.rollout > 100)) {
      throw new BadRequestException('rollout must be between 0 and 100.');
    }
    const existing = await this.prisma.featureFlag.findUnique({ where: { key: input.key } });
    const result = await this.prisma.featureFlag.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        label: input.label,
        description: input.description,
        enabled: input.enabled ?? false,
        rollout: input.rollout ?? 100,
        publicRead: input.publicRead ?? false,
        updatedBy: actor.id,
      },
      update: {
        label: input.label,
        description: input.description,
        ...(input.enabled != null ? { enabled: input.enabled } : {}),
        ...(input.rollout != null ? { rollout: input.rollout } : {}),
        ...(input.publicRead != null ? { publicRead: input.publicRead } : {}),
        updatedBy: actor.id,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      action: existing ? 'FEATURE_FLAG_UPDATE' : 'FEATURE_FLAG_CREATE',
      entity: 'FeatureFlag',
      entityId: input.key,
      metadata: {
        enabled: result.enabled,
        rollout: result.rollout,
        publicRead: result.publicRead,
      },
    });
    return result;
  }

  /** Server-side check — for a given key + optional user id, is the flag on
   *  right now? Uses a stable hash bucket so a user stays in the same
   *  cohort across sessions. Returns false when the flag doesn't exist so
   *  a fresh feature key defaults to "off" without needing a migration. */
  async isEnabled(key: string, userId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag || !flag.enabled) return false;
    if (flag.rollout >= 100) return true;
    if (flag.rollout <= 0) return false;
    // Simple deterministic bucketing — sum char codes of (userId + key)
    // mod 100. Not crypto-strong; sufficient for a percentage rollout.
    const seed = `${userId ?? 'anon'}::${key}`;
    let acc = 0;
    for (let i = 0; i < seed.length; i++) acc = (acc + seed.charCodeAt(i)) % 1000;
    return acc % 100 < flag.rollout;
  }
}
