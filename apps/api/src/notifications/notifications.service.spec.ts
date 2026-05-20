import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService, NotifyInput } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_PROVIDER } from './email-provider.interface';
import { AuthUser } from '../auth/jwt.strategy';

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  user: { findUnique: jest.fn() },
  $transaction: jest.fn(async (arr) => Promise.all(arr)),
};

const mockEmail = { send: jest.fn().mockResolvedValue(undefined) };

const mockViewer: AuthUser = { id: 'user-1', email: 'viewer@example.com', role: 'SALESPERSON' as any };

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EMAIL_PROVIDER, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  // ─── notify ───────────────────────────────────────────────────────────────

  describe('notify', () => {
    const input: NotifyInput = {
      userId: 'user-1',
      type: 'DEAL_CLOSED',
      title: 'Deal closed',
      body: 'Your deal has been closed.',
    };

    const createdNotif = { id: 'notif-1', ...input, readAt: null, createdAt: new Date() };

    beforeEach(() => {
      mockPrisma.notification.create.mockResolvedValue(createdNotif);
      mockPrisma.user.findUnique.mockResolvedValue({ email: 'user@example.com' });
    });

    it('1. creates a notification row in DB with correct data', async () => {
      await service.notify(input);

      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          payload: undefined,
        },
      });
    });

    it('2. fetches user email after creating notification', async () => {
      await service.notify(input);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: input.userId },
        select: { email: true },
      });
    });

    it('3. calls email.send with correct to/subject/body', async () => {
      await service.notify(input);

      // Allow the fire-and-forget microtask to settle
      await Promise.resolve();

      expect(mockEmail.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: input.title,
        body: input.body,
      });
    });

    it('4. email failure is swallowed — notify() still resolves', async () => {
      mockEmail.send.mockRejectedValueOnce(new Error('SMTP down'));

      await expect(service.notify(input)).resolves.toEqual(createdNotif);
    });

    it('5. payload undefined by default — no crash when omitted', async () => {
      const inputNoPayload: NotifyInput = { userId: 'user-1', type: 'T', title: 'T', body: 'B' };
      mockPrisma.notification.create.mockResolvedValueOnce({ id: 'n', ...inputNoPayload, readAt: null, createdAt: new Date() });

      await expect(service.notify(inputNoPayload)).resolves.toBeDefined();

      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ payload: undefined }) }),
      );
    });

    it('6. returns the created notification', async () => {
      const result = await service.notify(input);

      expect(result).toEqual(createdNotif);
    });
  });

  // ─── notifyMany ───────────────────────────────────────────────────────────

  describe('notifyMany', () => {
    const make: Omit<NotifyInput, 'userId'> = {
      type: 'ANNOUNCEMENT',
      title: 'Hello',
      body: 'World',
    };

    beforeEach(() => {
      mockPrisma.notification.create.mockResolvedValue({ id: 'n', readAt: null, createdAt: new Date() });
      mockPrisma.user.findUnique.mockResolvedValue({ email: 'a@b.com' });
    });

    it('7. calls notify() for each userId in the array', async () => {
      const spy = jest.spyOn(service, 'notify').mockResolvedValue({} as any);

      await service.notifyMany(['u1', 'u2', 'u3'], make);

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenCalledWith({ userId: 'u1', ...make });
      expect(spy).toHaveBeenCalledWith({ userId: 'u2', ...make });
      expect(spy).toHaveBeenCalledWith({ userId: 'u3', ...make });
    });

    it('8. all notify() calls happen in parallel (Promise.all — check call count)', async () => {
      const callOrder: string[] = [];
      const spy = jest.spyOn(service, 'notify').mockImplementation(async (inp) => {
        callOrder.push(inp.userId);
        return {} as any;
      });

      await service.notifyMany(['u1', 'u2', 'u3'], make);

      // All three were initiated (Promise.all, not sequential awaiting each before starting next)
      expect(spy).toHaveBeenCalledTimes(3);
      expect(callOrder).toHaveLength(3);
    });

    it('9. empty array → resolves immediately with no calls', async () => {
      const spy = jest.spyOn(service, 'notify');

      await expect(service.notifyMany([], make)).resolves.toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ─── listMine ─────────────────────────────────────────────────────────────

  describe('listMine', () => {
    const items = [{ id: 'n1' }, { id: 'n2' }];
    const total = 20;
    const unreadCount = 5;

    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(async (queries: any[]) =>
        Promise.all(queries),
      );
      mockPrisma.notification.findMany.mockResolvedValue(items);
      mockPrisma.notification.count
        .mockResolvedValueOnce(total)       // total
        .mockResolvedValueOnce(unreadCount); // unreadCount
    });

    it('10. returns items/total/unreadCount/page/perPage', async () => {
      const result = await service.listMine(mockViewer, undefined, 1, 10);

      expect(result).toEqual({ items, total, unreadCount, page: 1, perPage: 10 });
    });

    it('11. unread=true adds readAt:null filter to the main query', async () => {
      await service.listMine(mockViewer, true, 1, 10);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ readAt: null }),
        }),
      );
    });

    it('12. unread=undefined → no readAt filter on main query', async () => {
      await service.listMine(mockViewer, undefined, 1, 10);

      const callArgs = mockPrisma.notification.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('readAt');
    });

    it('12b. unread=false → no readAt filter on main query', async () => {
      mockPrisma.notification.count
        .mockResolvedValueOnce(total)
        .mockResolvedValueOnce(unreadCount);

      await service.listMine(mockViewer, false, 1, 10);

      const callArgs = mockPrisma.notification.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('readAt');
    });

    it('13. pagination: skip=(page-1)*perPage, take=perPage', async () => {
      await service.listMine(mockViewer, undefined, 3, 15);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 30, take: 15 }),
      );
    });
  });

  // ─── markRead ─────────────────────────────────────────────────────────────

  describe('markRead', () => {
    it('14. throws NotFoundException when notification not found (findUnique returns null)', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markRead(mockViewer, 'missing-id')).rejects.toThrow(NotFoundException);
    });

    it('15. throws NotFoundException when notification.userId !== viewer.id', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'n1',
        userId: 'other-user',
        readAt: null,
      });

      await expect(service.markRead(mockViewer, 'n1')).rejects.toThrow(NotFoundException);
    });

    it('16. returns notification as-is when already read (readAt set, no update call)', async () => {
      const readNotif = { id: 'n1', userId: 'user-1', readAt: new Date() };
      mockPrisma.notification.findUnique.mockResolvedValue(readNotif);

      const result = await service.markRead(mockViewer, 'n1');

      expect(result).toEqual(readNotif);
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it('17. updates readAt when unread and owned by viewer', async () => {
      const unreadNotif = { id: 'n1', userId: 'user-1', readAt: null };
      const updatedNotif = { ...unreadNotif, readAt: new Date() };
      mockPrisma.notification.findUnique.mockResolvedValue(unreadNotif);
      mockPrisma.notification.update.mockResolvedValue(updatedNotif);

      const result = await service.markRead(mockViewer, 'n1');

      expect(mockPrisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1' },
          data: expect.objectContaining({ readAt: expect.any(Date) }),
        }),
      );
      expect(result).toEqual(updatedNotif);
    });
  });

  // ─── markAllRead ──────────────────────────────────────────────────────────

  describe('markAllRead', () => {
    it('18. calls updateMany with userId filter + readAt=null', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      await service.markAllRead(mockViewer);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: mockViewer.id, readAt: null },
        data: expect.objectContaining({ readAt: expect.any(Date) }),
      });
    });

    it('19. returns { updated: count }', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 7 });

      const result = await service.markAllRead(mockViewer);

      expect(result).toEqual({ updated: 7 });
    });
  });
});
