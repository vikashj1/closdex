import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSalespersonDto } from './dto/update-salesperson.dto';

/** Streak decays on read: it's only WRITTEN inside scoring.updateStreak,
 *  so between attempts the stored value goes stale. If lastChallengeDate
 *  is null OR more than 1 day ago, the live streak is 0. The DB field
 *  still holds the old value (scoring increments from it the next time
 *  the user plays within 24h — but the user-visible "current" streak
 *  must reflect actual reality). */
function effectiveStreakDays(stored: number, lastChallengeDate: Date | null): number {
  if (!lastChallengeDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = new Date(lastChallengeDate);
  last.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (24 * 3600 * 1000));
  if (diffDays <= 0) return stored;        // same calendar day
  if (diffDays === 1) return stored;        // yesterday — still alive, at risk
  return 0;                                  // 2+ days gap — broken
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full profile for the authenticated user, password hash stripped.
   *  Salesperson currentStreakDays is decayed on read to match reality. */
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
    if (safe.salesperson) {
      safe.salesperson = {
        ...safe.salesperson,
        currentStreakDays: effectiveStreakDays(
          safe.salesperson.currentStreakDays,
          safe.salesperson.lastChallengeDate,
        ),
      };
    }
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
