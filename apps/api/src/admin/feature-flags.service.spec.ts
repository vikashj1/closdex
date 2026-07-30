import { UserRole } from '@closdex/db';
import { FeatureFlagsService } from './feature-flags.service';
import { AuthUser } from '../auth/jwt.strategy';

const ADMIN: AuthUser = { id: 'admin-1', email: 'a@x', role: UserRole.ADMIN };

function makeSvc(flag: any = null, listResult: any[] = []) {
  const findUnique = jest.fn().mockResolvedValue(flag);
  const findMany = jest.fn().mockResolvedValue(listResult);
  const upsert = jest.fn().mockImplementation(({ create, update }) =>
    Promise.resolve({ ...(flag ? { ...flag, ...update } : create) }),
  );
  const prisma = { featureFlag: { findUnique, findMany, upsert } } as any;
  const audit = { log: jest.fn().mockResolvedValue({}) } as any;
  return { svc: new FeatureFlagsService(prisma, audit), prisma, audit };
}

describe('FeatureFlagsService', () => {
  describe('upsert', () => {
    it('creates a new flag when the key does not exist and logs FEATURE_FLAG_CREATE', async () => {
      const { svc, prisma, audit } = makeSvc(null);
      await svc.upsert(ADMIN, {
        key: 'show_company_tab',
        label: 'Show company tab',
        description: 'signup page toggle',
        enabled: false,
      });
      expect(prisma.featureFlag.upsert).toHaveBeenCalled();
      const auditArgs = audit.log.mock.calls[0][0];
      expect(auditArgs.action).toBe('FEATURE_FLAG_CREATE');
      expect(auditArgs.entityId).toBe('show_company_tab');
    });

    it('logs FEATURE_FLAG_UPDATE when the flag already exists', async () => {
      const existing = { key: 'x', label: 'X', description: 'd', enabled: false, rollout: 100, publicRead: false };
      const { svc, audit } = makeSvc(existing);
      await svc.upsert(ADMIN, { key: 'x', label: 'X', description: 'd', enabled: true });
      expect(audit.log.mock.calls[0][0].action).toBe('FEATURE_FLAG_UPDATE');
    });
  });

  describe('isEnabled', () => {
    it('returns false when the flag is missing (unknown keys default off)', async () => {
      const { svc } = makeSvc(null);
      await expect(svc.isEnabled('ghost')).resolves.toBe(false);
    });

    it('returns false when enabled=false regardless of rollout', async () => {
      const { svc } = makeSvc({ key: 'x', enabled: false, rollout: 100 });
      await expect(svc.isEnabled('x', 'user-1')).resolves.toBe(false);
    });

    it('returns true when enabled + rollout=100', async () => {
      const { svc } = makeSvc({ key: 'x', enabled: true, rollout: 100 });
      await expect(svc.isEnabled('x', 'user-1')).resolves.toBe(true);
    });

    it('returns false when enabled + rollout=0', async () => {
      const { svc } = makeSvc({ key: 'x', enabled: true, rollout: 0 });
      await expect(svc.isEnabled('x', 'user-1')).resolves.toBe(false);
    });

    it('bucketing is stable across calls for the same user + key', async () => {
      const { svc } = makeSvc({ key: 'x', enabled: true, rollout: 50 });
      const a = await svc.isEnabled('x', 'user-abc');
      const b = await svc.isEnabled('x', 'user-abc');
      expect(a).toBe(b);
    });
  });

  describe('listPublic', () => {
    it('filters to publicRead=true and strips rollout from the response', async () => {
      const { svc } = makeSvc(null, [
        { key: 'a', enabled: true, rollout: 100 },
        { key: 'b', enabled: true, rollout: 0 },
        { key: 'c', enabled: false, rollout: 100 },
      ]);
      const result = await svc.listPublic();
      expect(result).toEqual([
        { key: 'a', enabled: true },
        { key: 'b', enabled: false },
        { key: 'c', enabled: false },
      ]);
    });
  });
});
