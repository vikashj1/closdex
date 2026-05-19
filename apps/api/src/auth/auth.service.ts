import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@closdex/db';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

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

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered.');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: dto.role,
          oauthAccounts: {
            create: { provider: 'EMAIL', providerAccountId: dto.email },
          },
        },
      });

      if (dto.role === UserRole.SALESPERSON) {
        await tx.salespersonProfile.create({
          data: { userId: created.id, publicSlug: await this.uniqueSlug(tx, dto.name) },
        });
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials.');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    return this.issueToken(user.id, user.email, user.role);
  }

  private issueToken(sub: string, email: string, role: UserRole) {
    return {
      accessToken: this.jwt.sign({ sub, email, role }),
      user: { id: sub, email, role },
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
