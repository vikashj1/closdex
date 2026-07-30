import { ModerationService } from './moderation.service';

function makeRow(overrides: any = {}) {
  return {
    id: 'm-1',
    content: 'Hi there.',
    createdAt: new Date('2026-07-30T20:00:00Z'),
    clientMeta: null,
    conversation: {
      attempt: {
        id: 'att-1',
        status: 'IN_PROGRESS',
        quarantined: false,
        suspicionScore: null,
        challenge: { id: 'ch-1', title: 'Warm Reply', difficulty: 'EASY' },
        salesperson: { user: { id: 'u-1', name: 'Alice', email: 'a@x.com' } },
      },
    },
    ...overrides,
  };
}

function makeSvc(rows: any[]) {
  const findMany = jest.fn().mockResolvedValue(rows);
  const prisma = { message: { findMany } } as any;
  return { svc: new ModerationService(prisma), prisma, findMany };
}

describe('ModerationService', () => {
  it('filters to SALESPERSON messages, newest first, with the requested limit', async () => {
    const { svc, findMany } = makeSvc([makeRow()]);
    await svc.recentMessages({ limit: 25 });
    const args = findMany.mock.calls[0][0];
    expect(args.where.sender).toBe('SALESPERSON');
    expect(args.orderBy).toEqual({ createdAt: 'desc' });
    expect(args.take).toBe(25);
  });

  it('clamps limit at 500', async () => {
    const { svc, findMany } = makeSvc([]);
    await svc.recentMessages({ limit: 999 });
    expect(findMany.mock.calls[0][0].take).toBe(500);
  });

  it('applies since-cursor when provided', async () => {
    const { svc, findMany } = makeSvc([]);
    const since = new Date('2026-07-30T19:00:00Z');
    await svc.recentMessages({ since });
    expect(findMany.mock.calls[0][0].where.createdAt).toEqual({ gt: since });
  });

  it('shapes rows into the admin projection with user + challenge + attempt', async () => {
    const { svc } = makeSvc([makeRow()]);
    const { items } = await svc.recentMessages({});
    expect(items[0]).toMatchObject({
      id: 'm-1',
      content: 'Hi there.',
      user: { id: 'u-1', name: 'Alice', email: 'a@x.com' },
      challenge: { id: 'ch-1', title: 'Warm Reply', difficulty: 'EASY' },
      attempt: { id: 'att-1', quarantined: false, suspicionScore: null },
    });
  });

  it('extracts pasteCount from clientMeta when present', async () => {
    const { svc } = makeSvc([makeRow({ clientMeta: { pasteCount: 3, pastedChars: 240 } })]);
    const { items } = await svc.recentMessages({});
    expect(items[0].pasteCount).toBe(3);
    expect(items[0].pastedChars).toBe(240);
    expect(items[0].hasClientMeta).toBe(true);
  });

  it('suspiciousOnly filters to rows with paste events or quarantined attempts', async () => {
    const { svc } = makeSvc([
      makeRow({ id: 'clean' }),
      makeRow({ id: 'pasted', clientMeta: { pasteCount: 2 } }),
      makeRow({
        id: 'quarantined',
        conversation: {
          attempt: {
            id: 'att-2',
            status: 'COMPLETED',
            quarantined: true,
            suspicionScore: 82,
            challenge: { id: 'ch-1', title: 'X', difficulty: 'HARD' },
            salesperson: { user: { id: 'u-2', name: 'Bob', email: 'b@x' } },
          },
        },
      }),
    ]);
    const { items } = await svc.recentMessages({ suspiciousOnly: true });
    expect(items.map((i) => i.id).sort()).toEqual(['pasted', 'quarantined']);
  });
});
