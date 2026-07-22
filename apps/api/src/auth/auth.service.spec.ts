import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@closdex/db';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Unit tests for AuthService — mocks PrismaService + JwtService so the
 * password hashing, role validation, and token-issuance logic can be
 * verified without a live database. Real bcrypt is used so we exercise
 * the actual hash/compare round-trip rather than stubbing it out.
 */

interface TxStubs {
  user?: { create: jest.Mock };
  salespersonProfile?: { create: jest.Mock; findUnique: jest.Mock };
  company?: { create: jest.Mock };
  companyMembership?: { create: jest.Mock };
  badge?: { upsert: jest.Mock };
  userBadge?: { create: jest.Mock };
}

function makePrismaMock(opts: {
  findUniqueResult?: any;
  txStubs?: TxStubs;
  txReturn?: any;
} = {}) {
  const userFindUnique = jest.fn().mockResolvedValue(opts.findUniqueResult ?? null);
  const txFn = jest.fn(async (cb: (tx: any) => Promise<any>) => {
    const stubs: Required<TxStubs> = {
      user: opts.txStubs?.user ?? {
        create: jest.fn().mockResolvedValue(opts.txReturn ?? null),
      },
      salespersonProfile: opts.txStubs?.salespersonProfile ?? {
        create: jest.fn().mockResolvedValue({ id: 'sp-1' }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      company: opts.txStubs?.company ?? {
        create: jest.fn().mockResolvedValue({ id: 'co-1' }),
      },
      companyMembership: opts.txStubs?.companyMembership ?? {
        create: jest.fn().mockResolvedValue({}),
      },
      // EARLY_BIRD auto-award lookups on every salesperson signup.
      badge: opts.txStubs?.badge ?? {
        upsert: jest.fn().mockResolvedValue({ id: 'badge-early-bird' }),
      },
      userBadge: opts.txStubs?.userBadge ?? {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    return cb(stubs);
  });
  return {
    user: { findUnique: userFindUnique },
    $transaction: txFn,
    _txFn: txFn,
  } as unknown as PrismaService & { _txFn: jest.Mock };
}

function makeJwtMock() {
  return { sign: jest.fn().mockReturnValue('signed-token') } as unknown as JwtService;
}

function makeConfigMock() {
  return { get: jest.fn().mockReturnValue(undefined) } as any;
}

describe('AuthService', () => {
  describe('register', () => {
    it('rejects ADMIN role with BadRequestException', async () => {
      const svc = new AuthService(makePrismaMock(), makeJwtMock(), makeConfigMock());
      await expect(
        svc.register({
          email: 'admin@x.com',
          password: 'longenoughpw',
          name: 'A',
          role: UserRole.ADMIN,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects COMPANY without companyName', async () => {
      const svc = new AuthService(makePrismaMock(), makeJwtMock(), makeConfigMock());
      await expect(
        svc.register({
          email: 'c@x.com',
          password: 'longenoughpw',
          name: 'C',
          role: UserRole.COMPANY,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate email with ConflictException', async () => {
      const prisma = makePrismaMock({ findUniqueResult: { id: 'existing' } });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());
      await expect(
        svc.register({
          email: 'dup@x.com',
          password: 'longenoughpw',
          name: 'D',
          role: UserRole.SALESPERSON,
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('successful salesperson register: hashes password, creates user + profile, returns token', async () => {
      const userCreate = jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'sp@x.com',
        role: UserRole.SALESPERSON,
      });
      const profileCreate = jest.fn().mockResolvedValue({ id: 'sp-x' });
      const profileFind = jest.fn().mockResolvedValue(null);
      const prisma = makePrismaMock({
        txStubs: {
          user: { create: userCreate },
          salespersonProfile: { create: profileCreate, findUnique: profileFind },
        },
      });
      const jwt = makeJwtMock();
      const svc = new AuthService(prisma, jwt, makeConfigMock());

      const result = await svc.register({
        email: 'sp@x.com',
        password: 'longenoughpw',
        name: 'Sam Salesperson',
        role: UserRole.SALESPERSON,
      } as any);

      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 'user-1', email: 'sp@x.com', role: UserRole.SALESPERSON },
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'sp@x.com',
        role: UserRole.SALESPERSON,
      });

      // user.create was called with a hashed (not plain) password
      expect(userCreate).toHaveBeenCalledTimes(1);
      const userArgs = userCreate.mock.calls[0][0];
      expect(userArgs.data.passwordHash).not.toBe('longenoughpw');
      expect(await bcrypt.compare('longenoughpw', userArgs.data.passwordHash)).toBe(true);
      expect(userArgs.data.role).toBe(UserRole.SALESPERSON);

      // salesperson profile created with the new user's id
      expect(profileCreate).toHaveBeenCalledTimes(1);
      expect(profileCreate.mock.calls[0][0].data.userId).toBe('user-1');
      expect(typeof profileCreate.mock.calls[0][0].data.publicSlug).toBe('string');
    });

    it('successful company register: creates user + company + ADMIN membership', async () => {
      const userCreate = jest.fn().mockResolvedValue({
        id: 'user-2',
        email: 'biz@x.com',
        role: UserRole.COMPANY,
      });
      const companyCreate = jest.fn().mockResolvedValue({ id: 'co-9', name: 'Razorpay' });
      const membershipCreate = jest.fn().mockResolvedValue({});
      const prisma = makePrismaMock({
        txStubs: {
          user: { create: userCreate },
          salespersonProfile: { create: jest.fn(), findUnique: jest.fn() },
          company: { create: companyCreate },
          companyMembership: { create: membershipCreate },
        },
      });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());

      await svc.register({
        email: 'biz@x.com',
        password: 'longenoughpw',
        name: 'Biz Owner',
        role: UserRole.COMPANY,
        companyName: 'Razorpay',
      } as any);

      expect(companyCreate).toHaveBeenCalledWith({ data: { name: 'Razorpay' } });
      expect(membershipCreate).toHaveBeenCalledTimes(1);
      const memArgs = membershipCreate.mock.calls[0][0];
      expect(memArgs.data.companyId).toBe('co-9');
      expect(memArgs.data.userId).toBe('user-2');
      expect(memArgs.data.companyRole).toBe('ADMIN');
    });

    it('generates a slug derived from name', async () => {
      const profileFind = jest.fn().mockResolvedValue(null);
      const profileCreate = jest.fn().mockResolvedValue({ id: 'sp-x' });
      const userCreate = jest.fn().mockResolvedValue({
        id: 'user-3',
        email: 'slug@x.com',
        role: UserRole.SALESPERSON,
      });
      const prisma = makePrismaMock({
        txStubs: {
          user: { create: userCreate },
          salespersonProfile: { create: profileCreate, findUnique: profileFind },
        },
      });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());

      await svc.register({
        email: 'slug@x.com',
        password: 'longenoughpw',
        name: 'Karan Mehta!!!',
        role: UserRole.SALESPERSON,
      } as any);

      const slug = profileCreate.mock.calls[0][0].data.publicSlug;
      // Slug is the kebab-cased name (special chars stripped) when unique
      expect(slug).toBe('karan-mehta');
    });

    it('lowercases the email so mixed-case duplicates are caught + stored consistently', async () => {
      // Prior bug: findUnique is case-sensitive, so "Vikash@X.com" would slip
      // past an existing "vikash@x.com" row and create a phantom duplicate.
      const prisma = makePrismaMock({ findUniqueResult: { id: 'existing' } });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());
      await expect(
        svc.register({
          email: 'Vikash@X.COM',
          password: 'longenoughpw',
          name: 'V',
          role: UserRole.SALESPERSON,
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
      expect((prisma.user.findUnique as jest.Mock)).toHaveBeenCalledWith({
        where: { email: 'vikash@x.com' },
      });
    });

    it('uniqifies slug when the base one is taken', async () => {
      // First lookup: slug exists. Second: free.
      const profileFind = jest
        .fn()
        .mockResolvedValueOnce({ publicSlug: 'taken' })
        .mockResolvedValueOnce(null);
      const profileCreate = jest.fn().mockResolvedValue({ id: 'sp-x' });
      const userCreate = jest.fn().mockResolvedValue({
        id: 'user-4',
        email: 'u@x.com',
        role: UserRole.SALESPERSON,
      });
      const prisma = makePrismaMock({
        txStubs: {
          user: { create: userCreate },
          salespersonProfile: { create: profileCreate, findUnique: profileFind },
        },
      });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());

      await svc.register({
        email: 'u@x.com',
        password: 'longenoughpw',
        name: 'Taken',
        role: UserRole.SALESPERSON,
      } as any);

      const slug = profileCreate.mock.calls[0][0].data.publicSlug;
      expect(slug).not.toBe('taken');
      expect(slug).toMatch(/^taken-[a-z0-9]{4}$/);
    });
  });

  describe('login', () => {
    it('rejects unknown email with UnauthorizedException', async () => {
      const svc = new AuthService(makePrismaMock(), makeJwtMock(), makeConfigMock());
      await expect(svc.login({ email: 'ghost@x.com', password: 'whatever' } as any))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects user without passwordHash (OAuth-only account)', async () => {
      const prisma = makePrismaMock({
        findUniqueResult: { id: 'u1', email: 'o@x.com', role: UserRole.SALESPERSON, passwordHash: null },
      });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());
      await expect(svc.login({ email: 'o@x.com', password: 'whatever' } as any))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects wrong password with UnauthorizedException', async () => {
      const hash = await bcrypt.hash('correct-pw', 12);
      const prisma = makePrismaMock({
        findUniqueResult: { id: 'u1', email: 'p@x.com', role: UserRole.SALESPERSON, passwordHash: hash },
      });
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());
      await expect(svc.login({ email: 'p@x.com', password: 'wrong-pw' } as any))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('successful login returns a signed token', async () => {
      const hash = await bcrypt.hash('right-pw', 12);
      const prisma = makePrismaMock({
        findUniqueResult: { id: 'u9', email: 'ok@x.com', role: UserRole.SALESPERSON, passwordHash: hash },
      });
      const jwt = makeJwtMock();
      const svc = new AuthService(prisma, jwt, makeConfigMock());
      const result = await svc.login({ email: 'ok@x.com', password: 'right-pw' } as any);
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: 'u9', email: 'ok@x.com', role: UserRole.SALESPERSON },
      });
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'u9',
        email: 'ok@x.com',
        role: UserRole.SALESPERSON,
      });
    });
  });

  describe('googleAuth', () => {
    it('throws BadRequest when GOOGLE_CLIENT_ID is not configured', async () => {
      const prisma = makePrismaMock();
      const svc = new AuthService(prisma, makeJwtMock(), makeConfigMock());
      await expect(
        svc.googleAuth({ idToken: 'x'.repeat(40) } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
