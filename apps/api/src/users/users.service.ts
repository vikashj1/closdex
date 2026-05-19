import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full profile for the authenticated user, password hash stripped. */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        salesperson: true,
        companyMemberships: { include: { company: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    const { passwordHash, ...safe } = user;
    return safe;
  }
}
