import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttemptStatus, ChallengeStatus, MessageSender, UserRole } from '@closdex/db';
import { AttemptsService } from './attempts.service';
import { AiLeadService } from '../ai/ai-lead.service';
import { ScoringQueueService } from '../scoring/scoring-queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';

/**
 * Unit tests for AttemptsService. The Prisma client and the LLM + queue
 * dependencies are mocked. The service's logic — start guards, the
 * cap-reached COMPLETED transition, the ABANDONED transition on end,
 * and the personalityPrompt stripping — runs untouched.
 */

const SP_USER: AuthUser = { id: 'user-sp', email: 'sp@x.com', role: UserRole.SALESPERSON };
const CO_USER: AuthUser = { id: 'user-co', email: 'co@x.com', role: UserRole.COMPANY };

function makeChallenge(overrides: any = {}) {
  return {
    id: 'ch-1',
    status: ChallengeStatus.PUBLISHED,
    maxMessages: 5,
    attemptsAllowed: 3,
    persona: {
      id: 'p-1',
      name: 'Meera',
      role: 'CTO',
      industry: 'Fintech',
      personalityPrompt: 'SECRET-PROMPT',
    },
    ...overrides,
  };
}

function makeAttempt(overrides: any = {}) {
  return {
    id: 'att-1',
    status: AttemptStatus.IN_PROGRESS,
    attemptNumber: 1,
    messagesUsed: 0,
    salespersonId: 'sp-prof-1',
    salesperson: { id: 'sp-prof-1', userId: SP_USER.id },
    challenge: makeChallenge(),
    conversation: { id: 'conv-1', messages: [] },
    ...overrides,
  };
}

function makePrismaMock(opts: {
  profile?: any;
  challenge?: any;
  inProgress?: any;
  attemptCount?: number;
  createAttempt?: any;
  loadAttempt?: any;
  txReturn?: any;
} = {}) {
  const txStubs = {
    message: { create: jest.fn().mockResolvedValue({}) },
    challengeAttempt: { update: jest.fn().mockResolvedValue(opts.txReturn) },
  };
  const prisma = {
    salespersonProfile: {
      findUnique: jest.fn().mockResolvedValue(opts.profile ?? null),
    },
    challenge: {
      findUnique: jest.fn().mockResolvedValue(opts.challenge ?? null),
    },
    challengeAttempt: {
      findFirst: jest.fn().mockResolvedValue(opts.inProgress ?? null),
      count: jest.fn().mockResolvedValue(opts.attemptCount ?? 0),
      create: jest.fn().mockResolvedValue(opts.createAttempt ?? null),
      findUnique: jest.fn().mockResolvedValue(opts.loadAttempt ?? null),
      update: jest.fn().mockResolvedValue(opts.txReturn ?? null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn(async (cb: any) => cb(txStubs)),
  } as unknown as PrismaService;
  return { prisma, txStubs };
}

function makeAi(reply = 'LEAD_REPLY', goalAchieved = false): AiLeadService {
  return {
    respond: jest.fn().mockResolvedValue(reply),
    evaluateGoal: jest.fn().mockResolvedValue(goalAchieved),
  } as unknown as AiLeadService;
}

function makeQueue(): ScoringQueueService & { enqueue: jest.Mock } {
  return { enqueue: jest.fn().mockResolvedValue(undefined) } as any;
}

describe('AttemptsService', () => {
  describe('start', () => {
    it('rejects non-salesperson with ForbiddenException', async () => {
      const { prisma } = makePrismaMock();
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(CO_USER, 'ch-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects when salesperson profile is missing', async () => {
      const { prisma } = makePrismaMock({ profile: null });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(SP_USER, 'ch-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when challenge does not exist', async () => {
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: null,
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(SP_USER, 'ch-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when challenge is not PUBLISHED', async () => {
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: makeChallenge({ status: ChallengeStatus.DRAFT }),
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(SP_USER, 'ch-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects when an attempt is already in progress', async () => {
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: makeChallenge(),
        inProgress: { id: 'att-existing' },
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(SP_USER, 'ch-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when attemptsAllowed cap is reached', async () => {
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: makeChallenge({ attemptsAllowed: 3 }),
        attemptCount: 3,
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.start(SP_USER, 'ch-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('honors an unlimited (null) attemptsAllowed', async () => {
      const created = makeAttempt({ attemptNumber: 99 });
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: makeChallenge({ attemptsAllowed: null }),
        attemptCount: 98,
        createAttempt: created,
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      const result = await svc.start(SP_USER, 'ch-1');
      expect(result.attemptNumber).toBe(99);
    });

    it('creates the attempt with attemptNumber = previousCount + 1 and strips persona prompt', async () => {
      const created = makeAttempt({ attemptNumber: 2 });
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
        challenge: makeChallenge(),
        attemptCount: 1,
        createAttempt: created,
      });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      const result = await svc.start(SP_USER, 'ch-1');

      expect(prisma.challengeAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          salespersonId: 'sp-prof-1',
          challengeId: 'ch-1',
          attemptNumber: 2,
          conversation: { create: {} },
        }),
        include: expect.any(Object),
      });
      // personalityPrompt must never reach the client
      expect(result.challenge.persona).not.toHaveProperty('personalityPrompt');
      expect(result.challenge.persona.name).toBe('Meera');
    });
  });

  describe('sendMessage', () => {
    it('rejects when attempt is not in progress', async () => {
      const completed = makeAttempt({ status: AttemptStatus.COMPLETED });
      const { prisma } = makePrismaMock({ loadAttempt: completed });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.sendMessage(SP_USER, 'att-1', 'hi')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when caller does not own the attempt', async () => {
      const otherUsers = makeAttempt({ salesperson: { id: 'sp-prof-1', userId: 'other-user' } });
      const { prisma } = makePrismaMock({ loadAttempt: otherUsers });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.sendMessage(SP_USER, 'att-1', 'hi')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('persists both messages, increments counter, returns leadReply (cap not yet reached)', async () => {
      const loaded = makeAttempt({ messagesUsed: 1 }); // cap is 5, so 2/5 after this turn
      const updated = makeAttempt({ messagesUsed: 2 });
      const { prisma, txStubs } = makePrismaMock({ loadAttempt: loaded, txReturn: updated });
      const ai = makeAi('What about pricing?');
      const queue = makeQueue();
      const svc = new AttemptsService(prisma, ai, queue);

      const result = await svc.sendMessage(SP_USER, 'att-1', 'Tell me more.');

      expect(result.leadReply).toBe('What about pricing?');
      expect(ai.respond).toHaveBeenCalledWith(
        expect.objectContaining({
          personaName: 'Meera',
          personaPrompt: 'SECRET-PROMPT',
          history: expect.any(Array),
        }),
      );
      // Two messages created in the transaction (salesperson + lead)
      expect(txStubs.message.create).toHaveBeenCalledTimes(2);
      const senders = (txStubs.message.create as jest.Mock).mock.calls.map((c: any) => c[0].data.sender);
      expect(senders).toEqual([MessageSender.SALESPERSON, MessageSender.LEAD]);
      // No status change while under the cap
      expect(txStubs.challengeAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ messagesUsed: 2 }),
        }),
      );
      const updateArgs = (txStubs.challengeAttempt.update as jest.Mock).mock.calls[0][0];
      expect(updateArgs.data).not.toHaveProperty('status');
      // No scoring enqueue yet
      expect(queue.enqueue).not.toHaveBeenCalled();
    });

    it('transitions to COMPLETED and enqueues scoring when message cap is reached', async () => {
      const loaded = makeAttempt({ messagesUsed: 4 }); // cap is 5; this turn pushes to 5
      const updated = makeAttempt({ messagesUsed: 5, status: AttemptStatus.COMPLETED });
      const { prisma, txStubs } = makePrismaMock({ loadAttempt: loaded, txReturn: updated });
      const queue = makeQueue();
      const svc = new AttemptsService(prisma, makeAi(), queue);

      const result = await svc.sendMessage(SP_USER, 'att-1', 'Final word.');

      const updateArgs = (txStubs.challengeAttempt.update as jest.Mock).mock.calls[0][0];
      expect(updateArgs.data.status).toBe(AttemptStatus.COMPLETED);
      expect(updateArgs.data.completedAt).toBeInstanceOf(Date);
      expect(updateArgs.data.messagesUsed).toBe(5);
      expect(queue.enqueue).toHaveBeenCalledWith('att-1');
      expect(result.attempt.challenge.persona).not.toHaveProperty('personalityPrompt');
    });
  });

  describe('end', () => {
    it('no-ops if attempt is not in progress (returns shaped attempt, no enqueue)', async () => {
      const completed = makeAttempt({ status: AttemptStatus.COMPLETED });
      const { prisma } = makePrismaMock({ loadAttempt: completed });
      const queue = makeQueue();
      const svc = new AttemptsService(prisma, makeAi(), queue);
      const result = await svc.end(SP_USER, 'att-1');
      expect(result.status).toBe(AttemptStatus.COMPLETED);
      expect(queue.enqueue).not.toHaveBeenCalled();
      expect(prisma.challengeAttempt.update).not.toHaveBeenCalled();
    });

    it('transitions IN_PROGRESS → ABANDONED and enqueues scoring', async () => {
      const loaded = makeAttempt();
      const updated = makeAttempt({ status: AttemptStatus.ABANDONED });
      const prismaUpdate = jest.fn().mockResolvedValue(updated);
      const { prisma } = makePrismaMock({ loadAttempt: loaded });
      (prisma.challengeAttempt.update as any) = prismaUpdate;
      const queue = makeQueue();
      const svc = new AttemptsService(prisma, makeAi(), queue);

      const result = await svc.end(SP_USER, 'att-1');

      expect(prismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AttemptStatus.ABANDONED }),
        }),
      );
      expect(queue.enqueue).toHaveBeenCalledWith('att-1');
      expect(result.status).toBe(AttemptStatus.ABANDONED);
      expect(result.challenge.persona).not.toHaveProperty('personalityPrompt');
    });
  });

  describe('get + listMine', () => {
    it('get rejects when caller does not own the attempt', async () => {
      const stolen = makeAttempt({ salesperson: { id: 'sp-prof-1', userId: 'other-user' } });
      const { prisma } = makePrismaMock({ loadAttempt: stolen });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.get(SP_USER, 'att-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('get throws NotFoundException when attempt does not exist', async () => {
      const { prisma } = makePrismaMock({ loadAttempt: null });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await expect(svc.get(SP_USER, 'att-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('get returns the attempt with personality prompt stripped', async () => {
      const loaded = makeAttempt();
      const { prisma } = makePrismaMock({ loadAttempt: loaded });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      const result = await svc.get(SP_USER, 'att-1');
      expect(result.id).toBe('att-1');
      expect(result.challenge.persona).not.toHaveProperty('personalityPrompt');
      expect(result.challenge.persona.name).toBe('Meera');
    });

    it('listMine returns [] when the user has no salesperson profile', async () => {
      const { prisma } = makePrismaMock({ profile: null });
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      const result = await svc.listMine(SP_USER);
      expect(result).toEqual([]);
      expect(prisma.challengeAttempt.findMany).not.toHaveBeenCalled();
    });

    it('listMine queries only attempts for the caller\'s profile', async () => {
      const { prisma } = makePrismaMock({
        profile: { id: 'sp-prof-1', userId: SP_USER.id },
      });
      (prisma.challengeAttempt.findMany as jest.Mock).mockResolvedValue([{ id: 'a', challenge: {} }]);
      const svc = new AttemptsService(prisma, makeAi(), makeQueue());
      await svc.listMine(SP_USER);
      expect(prisma.challengeAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { salespersonId: 'sp-prof-1' },
          orderBy: { startedAt: 'desc' },
        }),
      );
    });
  });
});
