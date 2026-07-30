import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@closdex/db';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getGoogleClient(): OAuth2Client {
    if (!this.googleClient) {
      const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
      if (!clientId) {
        throw new BadRequestException('Google sign-in is not configured.');
      }
      this.googleClient = new OAuth2Client(clientId);
    }
    return this.googleClient;
  }

  /**
   * Registers a salesperson or a company owner. Salespeople get a
   * SalespersonProfile; companies get a Company + an ADMIN membership.
   */
  async register(dto: RegisterDto) {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin accounts are provisioned internally.');
    }
    if (dto.role === UserRole.COMPANY && !dto.companyName) {
      throw new BadRequestException('companyName is required for company sign-ups.');
    }

    // Normalize email before uniqueness check + write. Postgres findUnique is
    // case-sensitive, so without this a "Vikash@X.com" register would sail
    // past an existing "vikash@x.com" row and create a duplicate account
    // that could then never be reached via Google auth (which lowercases).
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered.');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name,
          role: dto.role,
          oauthAccounts: {
            create: { provider: 'EMAIL', providerAccountId: email },
          },
        },
      });

      if (dto.role === UserRole.SALESPERSON) {
        const profile = await tx.salespersonProfile.create({
          data: { userId: created.id, publicSlug: await this.uniqueSlug(tx, dto.name) },
        });
        await this.grantEarlyBird(tx, profile.id);
      } else {
        const company = await tx.company.create({ data: { name: dto.companyName! } });
        await tx.companyMembership.create({
          data: { companyId: company.id, userId: created.id, companyRole: 'ADMIN' },
        });
      }

      return created;
    });

    return this.issueToken(user.id, user.email, user.role);
  }

  /** Awards the EARLY_BIRD badge to every new salesperson. Upserts the badge
   *  definition first so production doesn't depend on the seed having run. */
  private async grantEarlyBird(tx: Prisma.TransactionClient, salespersonId: string) {
    const badge = await tx.badge.upsert({
      where: { code: 'EARLY_BIRD' },
      update: {},
      create: {
        code: 'EARLY_BIRD',
        name: 'Early Bird',
        description: 'Joined Closdex in the early days — every new signup gets this.',
        iconUrl: '/badges/early-bird.png',
      },
    });
    await tx.userBadge.create({ data: { salespersonId, badgeId: badge.id } });
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials.');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    // Admin-controlled lockouts. We use the same UnauthorizedException as
    // "invalid credentials" for deleted accounts so an outsider can't
    // enumerate which emails were once real. Banned users get a distinct
    // message so support can tell them why they're locked out.
    if (user.deletedAt) throw new UnauthorizedException('Invalid credentials.');
    if (user.bannedAt) throw new UnauthorizedException('This account has been suspended. Contact support.');

    return this.issueToken(user.id, user.email, user.role);
  }

  /** Verifies a Google ID token, then either:
   *   - logs the existing user in (matched by GOOGLE provider account, or by
   *     email if they originally signed up via password and this is their
   *     first Google link)
   *   - or creates a fresh user using the role provided by the caller
   *
   *  All token verification happens server-side via google-auth-library —
   *  the client never sees the Google client secret because ID-token
   *  verification doesn't need one. */
  async googleAuth(dto: GoogleAuthDto) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')!;
    const ticket = await this.getGoogleClient().verifyIdToken({
      idToken: dto.idToken,
      audience: clientId,
    }).catch((err) => {
      this.logger.warn(`Google ID token verification failed: ${err.message}`);
      throw new UnauthorizedException('Google sign-in token is invalid.');
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Google sign-in returned no email.');
    }
    if (payload.email_verified === false) {
      throw new UnauthorizedException('Google email is not verified.');
    }

    const googleSub = payload.sub;
    const email = payload.email.toLowerCase();
    const fullName = payload.name?.trim() || email.split('@')[0];

    // 1. Existing OAuth account match → straight login (not a new signup).
    const oauthMatch = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: 'GOOGLE', providerAccountId: googleSub } },
      include: { user: true },
    });
    if (oauthMatch) {
      this.rejectIfLocked(oauthMatch.user);
      return this.issueToken(oauthMatch.user.id, oauthMatch.user.email, oauthMatch.user.role, false);
    }

    // 2. Same email registered via password → link Google, log in (not new).
    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      this.rejectIfLocked(byEmail);
      await this.prisma.oAuthAccount.create({
        data: { userId: byEmail.id, provider: 'GOOGLE', providerAccountId: googleSub },
      });
      return this.issueToken(byEmail.id, byEmail.email, byEmail.role, false);
    }

    // 3. Fresh signup — caller must pass a role.
    const role = dto.role;
    if (!role) {
      throw new BadRequestException('role is required for first-time Google sign-in.');
    }
    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Admin accounts are provisioned internally.');
    }
    if (role === UserRole.COMPANY && !dto.companyName) {
      throw new BadRequestException('companyName is required for company Google sign-ups.');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          role,
          // passwordHash stays null — Google-only accounts can't password-login
          // until they set one through a future "set password" flow.
          oauthAccounts: { create: { provider: 'GOOGLE', providerAccountId: googleSub } },
        },
      });

      if (role === UserRole.SALESPERSON) {
        const profile = await tx.salespersonProfile.create({
          data: { userId: user.id, publicSlug: await this.uniqueSlug(tx, fullName) },
        });
        await this.grantEarlyBird(tx, profile.id);
      } else {
        const company = await tx.company.create({ data: { name: dto.companyName! } });
        await tx.companyMembership.create({
          data: { companyId: company.id, userId: user.id, companyRole: 'ADMIN' },
        });
      }

      return user;
    });

    return this.issueToken(created.id, created.email, created.role, true);
  }

  /** Shared lockout gate for both password + Google flows. Same-shape
   *  UnauthorizedException so error paths stay identical. */
  private rejectIfLocked(user: { bannedAt: Date | null; deletedAt: Date | null }) {
    if (user.deletedAt) throw new UnauthorizedException('Invalid credentials.');
    if (user.bannedAt) throw new UnauthorizedException('This account has been suspended. Contact support.');
  }

  /** Signs a JWT + returns the auth envelope. `isNewUser` is undefined for
   *  password register/login (frontend routes purely by role there) and set
   *  explicitly by googleAuth so /signup can distinguish "linked existing"
   *  from "actually just created", and stop sending returning users into
   *  the onboarding flow. */
  private issueToken(sub: string, email: string, role: UserRole, isNewUser?: boolean) {
    return {
      accessToken: this.jwt.sign({ sub, email, role }),
      user: { id: sub, email, role },
      ...(isNewUser !== undefined ? { isNewUser } : {}),
    };
  }

  /** Slugifies the name, appending a short suffix until the slug is unused. */
  private async uniqueSlug(tx: Prisma.TransactionClient, name: string): Promise<string> {
    const base =
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'user';
    let slug = base;
    while (await tx.salespersonProfile.findUnique({ where: { publicSlug: slug } })) {
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return slug;
  }
}
