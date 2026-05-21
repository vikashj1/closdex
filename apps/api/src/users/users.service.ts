import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalespersonDto } from './dto/update-salesperson.dto';

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

  async updateUser(userId: string, dto: UpdateUserDto) {
    await this.prisma.user.update({ where: { id: userId }, data: dto });
    return this.getProfile(userId);
  }

  async updateSalespersonProfile(userId: string, dto: UpdateSalespersonDto) {
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Salesperson profile not found.');

    await this.prisma.salespersonProfile.update({ where: { userId }, data: dto });
    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const valid = user.passwordHash
      ? await bcrypt.compare(dto.currentPassword, user.passwordHash)
      : false;
    if (!valid) throw new UnauthorizedException('Current password is incorrect.');

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { success: true };
  }
}
