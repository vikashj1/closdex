import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@closdex/db';
import { LearningService } from './learning.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { AuthUser } from '../auth/jwt.strategy';

const mockTx = {
  quizAttempt: { create: jest.fn() },
  pointsTransaction: { create: jest.fn() },
  salespersonProfile: { update: jest.fn() },
};

const mockPrisma = {
  learningTrack: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tutorial: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  quiz: {
    upsert: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  trackProgress: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  salespersonProfile: {
    findUnique: jest.fn(),
  },
  quizAttempt: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockLeaderboards = {
  recordScore: jest.fn(),
};

const adminUser: AuthUser = { id: 'a-1', role: 'ADMIN' as any, email: 'admin@test.com' };
const spUser: AuthUser = { id: 's-1', role: 'SALESPERSON' as any, email: 'sp@test.com' };
const companyUser: AuthUser = { id: 'c-1', role: 'COMPANY' as any, email: 'co@test.com' };

const mockProfile = { id: 'prof-1', userId: 's-1' };

describe('LearningService', () => {
  let service: LearningService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));
    mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-1', passed: true });
    mockTx.pointsTransaction.create.mockResolvedValue({});
    mockTx.salespersonProfile.update.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: LeaderboardsService, useValue: mockLeaderboards },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
  });

  describe('listTracks', () => {
    it('1. delegates to prisma.learningTrack.findMany', async () => {
      const tracks = [{ id: 't-1', title: 'Track 1' }];
      mockPrisma.learningTrack.findMany.mockResolvedValue(tracks);
      const result = await service.listTracks();
      expect(mockPrisma.learningTrack.findMany).toHaveBeenCalledTimes(1);
      expect(result).toBe(tracks);
    });
  });

  describe('getTrack', () => {
    it('2. throws NotFoundException when track not found', async () => {
      mockPrisma.learningTrack.findUnique.mockResolvedValue(null);
      await expect(service.getTrack(adminUser, 'missing')).rejects.toThrow(NotFoundException);
    });

    it('3. admin sees full quiz with answerIndex', async () => {
      const quiz = { id: 'q-1', questions: [{ q: 'Q1', options: ['a', 'b'], answerIndex: 1 }] };
      mockPrisma.learningTrack.findUnique.mockResolvedValue({
        id: 'tr-1',
        tutorials: [{ id: 'tu-1', quiz }],
      });
      const result = await service.getTrack(adminUser, 'tr-1');
      expect(result.tutorials[0].quiz.questions[0].answerIndex).toBe(1);
    });

    it('4. SALESPERSON viewer gets quiz with answerIndex stripped', async () => {
      const quiz = { id: 'q-1', questions: [{ q: 'Q1', options: ['a', 'b'], answerIndex: 1 }] };
      mockPrisma.learningTrack.findUnique.mockResolvedValue({
        id: 'tr-1',
        tutorials: [{ id: 'tu-1', quiz }],
      });
      const result = await service.getTrack(spUser, 'tr-1');
      expect(result.tutorials[0].quiz.questions[0]).not.toHaveProperty('answerIndex');
    });

    it('5. tutorial without quiz passes through unchanged', async () => {
      mockPrisma.learningTrack.findUnique.mockResolvedValue({
        id: 'tr-1',
        tutorials: [{ id: 'tu-1', quiz: null, title: 'No quiz' }],
      });
      const result = await service.getTrack(spUser, 'tr-1');
      expect(result.tutorials[0].quiz).toBeNull();
    });
  });

  describe('createTrack', () => {
    it('6. delegates to prisma.learningTrack.create', async () => {
      const dto = { title: 'New Track' } as any;
      const created = { id: 'tr-new', ...dto };
      mockPrisma.learningTrack.create.mockResolvedValue(created);
      const result = await service.createTrack(dto);
      expect(mockPrisma.learningTrack.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toBe(created);
    });
  });

  describe('updateTrack', () => {
    it('7. happy path returns updated track', async () => {
      const updated = { id: 'tr-1', title: 'Updated' };
      mockPrisma.learningTrack.update.mockResolvedValue(updated);
      const result = await service.updateTrack('tr-1', { title: 'Updated' });
      expect(result).toBe(updated);
    });

    it('8. throws NotFoundException when prisma update throws', async () => {
      mockPrisma.learningTrack.update.mockRejectedValue(new Error('P2025'));
      await expect(service.updateTrack('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTrack', () => {
    it('9. happy path calls prisma delete', async () => {
      mockPrisma.learningTrack.delete.mockResolvedValue({});
      await service.deleteTrack('tr-1');
      expect(mockPrisma.learningTrack.delete).toHaveBeenCalledWith({ where: { id: 'tr-1' } });
    });

    it('10. throws NotFoundException when prisma delete throws', async () => {
      mockPrisma.learningTrack.delete.mockRejectedValue(new Error('P2025'));
      await expect(service.deleteTrack('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTutorial', () => {
    it('11. VIDEO without contentUrl throws BadRequestException', async () => {
      await expect(
        service.createTutorial('tr-1', { type: 'VIDEO', body: 'some body' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('12. ARTICLE without body throws BadRequestException', async () => {
      await expect(
        service.createTutorial('tr-1', { type: 'ARTICLE', contentUrl: 'http://x.com' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('13. track not found throws NotFoundException', async () => {
      mockPrisma.learningTrack.findUnique.mockResolvedValue(null);
      await expect(
        service.createTutorial('missing', { type: 'VIDEO', contentUrl: 'http://x.com' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('14. happy path creates tutorial with trackId', async () => {
      const track = { id: 'tr-1' };
      mockPrisma.learningTrack.findUnique.mockResolvedValue(track);
      const created = { id: 'tu-new', trackId: 'tr-1' };
      mockPrisma.tutorial.create.mockResolvedValue(created);
      const dto = { type: 'VIDEO', contentUrl: 'http://x.com', title: 'My Vid' } as any;
      const result = await service.createTutorial('tr-1', dto);
      expect(mockPrisma.tutorial.create).toHaveBeenCalledWith({
        data: { ...dto, trackId: 'tr-1' },
      });
      expect(result).toBe(created);
    });
  });

  describe('getTutorial', () => {
    it('15. throws NotFoundException when tutorial not found', async () => {
      mockPrisma.tutorial.findUnique.mockResolvedValue(null);
      await expect(service.getTutorial(adminUser, 'missing')).rejects.toThrow(NotFoundException);
    });

    it('16. admin viewer receives full quiz with answerIndex', async () => {
      const quiz = { id: 'q-1', questions: [{ q: 'Q?', options: ['y', 'n'], answerIndex: 0 }] };
      mockPrisma.tutorial.findUnique.mockResolvedValue({ id: 'tu-1', quiz, track: {} });
      const result = await service.getTutorial(adminUser, 'tu-1');
      expect(result.quiz.questions[0].answerIndex).toBe(0);
    });

    it('17. SALESPERSON viewer gets quiz with answerIndex stripped', async () => {
      const quiz = { id: 'q-1', questions: [{ q: 'Q?', options: ['y', 'n'], answerIndex: 0 }] };
      mockPrisma.tutorial.findUnique.mockResolvedValue({ id: 'tu-1', quiz, track: {} });
      const result = await service.getTutorial(spUser, 'tu-1');
      expect(result.quiz.questions[0]).not.toHaveProperty('answerIndex');
    });
  });

  describe('updateTutorial', () => {
    it('18. throws NotFoundException when tutorial not found', async () => {
      mockPrisma.tutorial.findUnique.mockResolvedValue(null);
      await expect(service.updateTutorial('missing', {})).rejects.toThrow(NotFoundException);
    });

    it('19. type validation runs on merged type (VIDEO without contentUrl throws)', async () => {
      mockPrisma.tutorial.findUnique.mockResolvedValue({
        id: 'tu-1',
        type: 'ARTICLE',
        body: 'Some body',
        contentUrl: null,
      });
      await expect(
        service.updateTutorial('tu-1', { type: 'VIDEO' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('20. happy path updates when validation passes', async () => {
      mockPrisma.tutorial.findUnique.mockResolvedValue({
        id: 'tu-1',
        type: 'ARTICLE',
        body: 'existing body',
        contentUrl: null,
      });
      const updated = { id: 'tu-1', title: 'New title' };
      mockPrisma.tutorial.update.mockResolvedValue(updated);
      const result = await service.updateTutorial('tu-1', { title: 'New title' });
      expect(result).toBe(updated);
    });
  });

  describe('upsertQuiz', () => {
    it('21. answerIndex out of range throws BadRequestException', async () => {
      const dto = {
        questions: [{ q: 'Q?', options: ['a', 'b'], answerIndex: 5 }],
        rewardPoints: 10,
      };
      await expect(service.upsertQuiz('tu-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('22. tutorial not found throws NotFoundException', async () => {
      const dto = {
        questions: [{ q: 'Q?', options: ['a', 'b'], answerIndex: 1 }],
        rewardPoints: 10,
      };
      mockPrisma.tutorial.findUnique.mockResolvedValue(null);
      await expect(service.upsertQuiz('missing', dto)).rejects.toThrow(NotFoundException);
    });

    it('23. happy path calls prisma.quiz.upsert with correct data', async () => {
      const dto = {
        questions: [{ q: 'Q?', options: ['a', 'b'], answerIndex: 1 }],
        rewardPoints: 20,
      };
      mockPrisma.tutorial.findUnique.mockResolvedValue({ id: 'tu-1' });
      const upserted = { id: 'qz-1' };
      mockPrisma.quiz.upsert.mockResolvedValue(upserted);
      const result = await service.upsertQuiz('tu-1', dto);
      expect(mockPrisma.quiz.upsert).toHaveBeenCalledWith({
        where: { tutorialId: 'tu-1' },
        create: { tutorialId: 'tu-1', questions: dto.questions, rewardPoints: 20 },
        update: { questions: dto.questions, rewardPoints: 20 },
      });
      expect(result).toBe(upserted);
    });
  });

  describe('completeTutorial', () => {
    it('24. non-SALESPERSON throws ForbiddenException', async () => {
      await expect(service.completeTutorial(companyUser, 'tu-1')).rejects.toThrow(ForbiddenException);
    });

    it('25. no salesperson profile throws NotFoundException', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      await expect(service.completeTutorial(spUser, 'tu-1')).rejects.toThrow(NotFoundException);
    });

    it('26. existing progress is updated not doubled (idempotent)', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.tutorial.findUnique.mockResolvedValue({ id: 'tu-1', trackId: 'tr-1' });
      mockPrisma.trackProgress.findUnique.mockResolvedValue({
        completedTutorialIds: ['tu-1'],
      });
      mockPrisma.trackProgress.upsert.mockResolvedValue({});
      await service.completeTutorial(spUser, 'tu-1');
      const upsertCall = mockPrisma.trackProgress.upsert.mock.calls[0][0];
      const ids: string[] = upsertCall.update.completedTutorialIds;
      expect(ids.filter((id) => id === 'tu-1')).toHaveLength(1);
    });
  });

  describe('attemptQuiz', () => {
    const questions = [
      { q: 'Q1', options: ['a', 'b', 'c'], answerIndex: 0 },
      { q: 'Q2', options: ['x', 'y', 'z'], answerIndex: 2 },
      { q: 'Q3', options: ['p', 'q'], answerIndex: 1 },
    ];
    const baseQuiz = {
      id: 'qz-1',
      questions,
      rewardPoints: 50,
      tutorial: { trackId: 'tr-1', track: { category: 'SaaS' } },
    };

    beforeEach(() => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.quizAttempt.findFirst.mockResolvedValue(null);
    });

    it('27. quiz not found throws NotFoundException', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(null);
      await expect(service.attemptQuiz(spUser, 'missing', [0, 2, 1])).rejects.toThrow(NotFoundException);
    });

    it('28. wrong answer count throws BadRequestException', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      await expect(service.attemptQuiz(spUser, 'qz-1', [0])).rejects.toThrow(BadRequestException);
    });

    it('29. passes at >= 70% correct (all correct)', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-1', passed: true, score: 3 });
      const result = await service.attemptQuiz(spUser, 'qz-1', [0, 2, 1]);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(3);
    });

    it('30. fails below 70% (1 of 3 correct)', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-2', passed: false, score: 1 });
      const result = await service.attemptQuiz(spUser, 'qz-1', [0, 0, 0]);
      expect(result.passed).toBe(false);
      expect(result.rewardPointsAwarded).toBe(0);
    });

    it('31. reward only on first pass — alreadyPassed=true skips reward tx', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      mockPrisma.quizAttempt.findFirst.mockResolvedValue({ id: 'prev', passed: true });
      mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-3', passed: true, score: 3 });
      const result = await service.attemptQuiz(spUser, 'qz-1', [0, 2, 1]);
      expect(mockTx.pointsTransaction.create).not.toHaveBeenCalled();
      expect(result.rewardPointsAwarded).toBe(0);
    });

    it('32. calls leaderboards.recordScore only when reward eligible', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      mockPrisma.quizAttempt.findFirst.mockResolvedValue(null);
      mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-4', passed: true, score: 3 });
      await service.attemptQuiz(spUser, 'qz-1', [0, 2, 1]);
      expect(mockLeaderboards.recordScore).toHaveBeenCalledWith('prof-1', 50, 'SaaS');
    });

    it('33. leaderboards.recordScore NOT called when attempt fails', async () => {
      mockPrisma.quiz.findUnique.mockResolvedValue(baseQuiz);
      mockTx.quizAttempt.create.mockResolvedValue({ id: 'att-5', passed: false, score: 1 });
      await service.attemptQuiz(spUser, 'qz-1', [0, 0, 0]);
      expect(mockLeaderboards.recordScore).not.toHaveBeenCalled();
    });

    it('34. non-SALESPERSON throws ForbiddenException', async () => {
      await expect(service.attemptQuiz(companyUser, 'qz-1', [0, 2, 1])).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMyProgress', () => {
    it('35. non-SALESPERSON returns empty array', async () => {
      const result = await service.getMyProgress(companyUser);
      expect(result).toEqual([]);
    });

    it('36. SALESPERSON with no profile returns empty array', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(null);
      const result = await service.getMyProgress(spUser);
      expect(result).toEqual([]);
    });

    it('37. SALESPERSON with profile delegates to trackProgress.findMany', async () => {
      mockPrisma.salespersonProfile.findUnique.mockResolvedValue(mockProfile);
      const progress = [{ trackId: 'tr-1', completedTutorialIds: ['tu-1'] }];
      mockPrisma.trackProgress.findMany.mockResolvedValue(progress);
      const result = await service.getMyProgress(spUser);
      expect(mockPrisma.trackProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { salespersonId: 'prof-1' } }),
      );
      expect(result).toBe(progress);
    });
  });
});
