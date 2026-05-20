import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { EMAIL_PROVIDER, EmailProvider } from './email-provider.interface';

export interface NotifyInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_PROVIDER) private readonly email: EmailProvider,
  ) {}

  /** Best-effort: row write must succeed; email is fire-and-forget. */
  async notify(input: NotifyInput) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        payload: (input.payload ?? undefined) as Prisma.InputJsonValue,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true },
    });
    if (user) {
      this.email.send({ to: user.email, subject: input.title, body: input.body })
        .catch((err) => this.logger.warn(`Email send failed for ${input.userId}: ${err}`));
    }

    return notif;
  }

  /** Notify several users with the same payload. Used for company-wide events. */
  async notifyMany(userIds: string[], make: Omit<NotifyInput, 'userId'>) {
    await Promise.all(userIds.map((userId) => this.notify({ userId, ...make })));
  }

  async listMine(viewer: AuthUser, unread: boolean | undefined, page: number, perPage: number) {
    const where: Prisma.NotificationWhereInput = { userId: viewer.id };
    if (unread) where.readAt = null;

    const [items, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId: viewer.id, readAt: null } }),
    ]);
    return { items, total, unreadCount, page, perPage };
  }

  async markRead(viewer: AuthUser, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== viewer.id) {
      throw new NotFoundException('Notification not found.');
    }
    if (notif.readAt) return notif;
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(viewer: AuthUser) {
    const res = await this.prisma.notification.updateMany({
      where: { userId: viewer.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: res.count };
  }
}
