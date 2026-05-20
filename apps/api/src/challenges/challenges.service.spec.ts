import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChallengeStatus, DifficultyTier, GoalType, UserRole } from '@closdex/db';
import { ChallengesService } from './challenges.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  challenge: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  leadPersona: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(async (arr) => Promise.all(arr)),
};

const adminViewer = { id: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN };
const salespersonViewer = { id: 'sp-1', email: 'sp@test.com', role: UserRole.SALESPERSON };

describe('ChallengesService', () => {
  let service: ChallengesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
  });

  // ---------------------------------------------------------------------------
  // list
  // ---------------------------------------------------------------------------
  describe('list', () => {
    beforeEach(() => {
      mockPrisma.$transaction.mockImplementation(async (arr) => Promise.all(arr));
      mockPrisma.challenge.findMany.mockResolvedValue([]);
      mockPrisma.challenge.count.mockResolvedValue(0);
    });

    it('non-admin query always adds status=PUBLISHED filter regardless of query.status', async () => {
      await service.list(salespersonViewer, { status: ChallengeStatus.DRAFT });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.where.status).toBe(ChallengeStatus.PUBLISHED);
    });

    it('admin can pass a custom status filter', async () => {
      await service.list(adminViewer, { status: ChallengeStatus.DRAFT });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.where.status).toBe(ChallengeStatus.DRAFT);
    });

    it('applies difficulty filter when provided', async () => {
      await service.list(adminViewer, { difficulty: DifficultyTier.HARD });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.where.difficulty).toBe(DifficultyTier.HARD);
    });

    it('applies goalType filter when provided', async () => {
      await service.list(adminViewer, { goalType: GoalType.CLOSE_DEAL });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.where.goalType).toBe(GoalType.CLOSE_DEAL);
    });

    it('applies category filter when provided', async () => {
      await service.list(adminViewer, { category: 'Enterprise' });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.where.category).toBe('Enterprise');
    });

    it('uses default page=1 and perPage=20 for pagination skip/take', async () => {
      await service.list(adminViewer, {});

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.skip).toBe(0);   // (1-1)*20
      expect(findManyCall.take).toBe(20);
    });

    it('calculates skip as (page-1)*perPage', async () => {
      await service.list(adminViewer, { page: 3, perPage: 10 });

      const [[findManyCall]] = mockPrisma.challenge.findMany.mock.calls;
      expect(findManyCall.skip).toBe(20);  // (3-1)*10
      expect(findManyCall.take).toBe(10);
    });

    it('returns { items, total, page, perPage }', async () => {
      const fakeItems = [{ id: 'c1' }];
      mockPrisma.challenge.findMany.mockResolvedValue(fakeItems);
      mockPrisma.challenge.count.mockResolvedValue(1);

      const result = await service.list(adminViewer, { page: 2, perPage: 5 });
      expect(result).toEqual({ items: fakeItems, total: 1, page: 2, perPage: 5 });
    });
  });

  // ---------------------------------------------------------------------------
  // get
  // ---------------------------------------------------------------------------
  describe('get', () => {
    it('throws NotFoundException when challenge is not found', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue(null);

      await expect(service.get(adminViewer, 'missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('non-admin gets ForbiddenException for a DRAFT challenge', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'c1',
        status: ChallengeStatus.DRAFT,
        persona: {},
      });

      await expect(service.get(salespersonViewer, 'c1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('non-admin gets ForbiddenException for an ARCHIVED challenge', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'c1',
        status: ChallengeStatus.ARCHIVED,
        persona: {},
      });

      await expect(service.get(salespersonViewer, 'c1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('admin can retrieve a DRAFT challenge without error', async () => {
      const draftChallenge = { id: 'c1', status: ChallengeStatus.DRAFT, persona: {} };
      mockPrisma.challenge.findUnique.mockResolvedValue(draftChallenge);

      await expect(service.get(adminViewer, 'c1')).resolves.toEqual(draftChallenge);
    });

    it('non-admin can retrieve a PUBLISHED challenge', async () => {
      const published = { id: 'c1', status: ChallengeStatus.PUBLISHED, persona: {} };
      mockPrisma.challenge.findUnique.mockResolvedValue(published);

      await expect(service.get(salespersonViewer, 'c1')).resolves.toEqual(published);
    });

    it('persona select shape does NOT include personalityPrompt', async () => {
      mockPrisma.challenge.findUnique.mockResolvedValue({
        id: 'c1',
        status: ChallengeStatus.PUBLISHED,
        persona: {},
      });

      await service.get(adminViewer, 'c1');

      const callArg = mockPrisma.challenge.findUnique.mock.calls[0][0];
      const selectFields = callArg.include.persona.select;

      expect(selectFields).toBeDefined();
      expect(selectFields).not.toHaveProperty('personalityPrompt');
      // Confirm safe fields are present
      expect(selectFields).toHaveProperty('id', true);
      expect(selectFields).toHaveProperty('name', true);
      expect(selectFields).toHaveProperty('role', true);
    });
  });

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('throws NotFoundException when personaId is not found', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ personaId: 'bad-persona', title: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.challenge.create).not.toHaveBeenCalled();
    });

    it('calls prisma.challenge.create with dto when persona exists', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue({ id: 'p1' });
      const created = { id: 'c1', personaId: 'p1' };
      mockPrisma.challenge.create.mockResolvedValue(created);

      const dto = { personaId: 'p1', title: 'Test Challenge' } as any;
      const result = await service.create(dto);

      expect(mockPrisma.challenge.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(created);
    });
  });

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    it('throws NotFoundException when personaId is provided but not found', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue(null);

      await expect(
        service.update('c1', { personaId: 'bad-persona' } as any),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.challenge.update).not.toHaveBeenCalled();
    });

    it('skips personaId validation when personaId is not in dto', async () => {
      mockPrisma.challenge.update.mockResolvedValue({ id: 'c1' });

      await service.update('c1', { title: 'New Title' } as any);

      expect(mockPrisma.leadPersona.findUnique).not.toHaveBeenCalled();
      expect(mockPrisma.challenge.update).toHaveBeenCalled();
    });

    it('wraps Prisma not-found error into NotFoundException', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.challenge.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        service.update('bad-id', { personaId: 'p1' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns updated challenge on success', async () => {
      mockPrisma.leadPersona.findUnique.mockResolvedValue({ id: 'p1' });
      const updated = { id: 'c1', title: 'Updated' };
      mockPrisma.challenge.update.mockResolvedValue(updated);

      const result = await service.update('c1', { personaId: 'p1', title: 'Updated' } as any);
      expect(result).toEqual(updated);
    });
  });

  // ---------------------------------------------------------------------------
  // setStatus
  // ---------------------------------------------------------------------------
  describe('setStatus', () => {
    it('updates challenge status via prisma', async () => {
      const updated = { id: 'c1', status: ChallengeStatus.ARCHIVED };
      mockPrisma.challenge.update.mockResolvedValue(updated);

      const result = await service.setStatus('c1', ChallengeStatus.ARCHIVED);

      expect(mockPrisma.challenge.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { status: ChallengeStatus.ARCHIVED },
      });
      expect(result).toEqual(updated);
    });

    it('wraps Prisma error into NotFoundException', async () => {
      mockPrisma.challenge.update.mockRejectedValue(new Error('Record not found'));

      await expect(
        service.setStatus('bad-id', ChallengeStatus.PUBLISHED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
