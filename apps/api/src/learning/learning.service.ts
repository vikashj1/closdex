import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PointsReason, Prisma, TutorialType, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { UpsertQuizDto, QuizQuestionDto } from './dto/upsert-quiz.dto';

/** 70% correct to pass. SOW doesn't pin a threshold — picking a sane default rather
 *  than burning a config slot. Make it configurable via ScoringRuleConfig if needed. */
const QUIZ_PASS_THRESHOLD = 0.7;

interface QuizQuestion {
  q: string;
  options: string[];
  answerIndex: number;
}

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboards: LeaderboardsService,
  ) {}

  // ─── Tracks ───────────────────────────────────────────────────────────

  listTracks() {
    return this.prisma.learningTrack.findMany({
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
      include: {
        tutorials: { orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, order: true } },
      },
    });
  }

  async getTrack(viewer: AuthUser, id: string) {
    const track = await this.prisma.learningTrack.findUnique({
      where: { id },
      include: {
        tutorials: {
          orderBy: { order: 'asc' },
          include: { quiz: true },
        },
      },
    });
    if (!track) throw new NotFoundException('Track not found.');
    return {
      ...track,
      tutorials: track.tutorials.map((t) => this.shapeTutorial(viewer, t)),
    };
  }

  createTrack(dto: CreateTrackDto) {
    return this.prisma.learningTrack.create({ data: dto });
  }

  async updateTrack(id: string, dto: UpdateTrackDto) {
    try {
      return await this.prisma.learningTrack.update({ where: { id }, data: dto });
    } catch {
      throw new NotFoundException('Track not found.');
    }
  }

  async deleteTrack(id: string) {
    try {
      await this.prisma.learningTrack.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Track not found.');
    }
  }

  // ─── Tutorials ────────────────────────────────────────────────────────

  async createTutorial(trackId: string, dto: CreateTutorialDto) {
    this.assertTutorialContent(dto.type, dto.contentUrl, dto.body);
    const track = await this.prisma.learningTrack.findUnique({ where: { id: trackId } });
    if (!track) throw new NotFoundException('Track not found.');
    return this.prisma.tutorial.create({
      data: { ...dto, trackId },
    });
  }

  async getTutorial(viewer: AuthUser, id: string) {
    const tutorial = await this.prisma.tutorial.findUnique({
      where: { id },
      include: { quiz: true, track: { select: { id: true, title: true, category: true } } },
    });
    if (!tutorial) throw new NotFoundException('Tutorial not found.');
    return this.shapeTutorial(viewer, tutorial);
  }

  async updateTutorial(id: string, dto: UpdateTutorialDto) {
    const current = await this.prisma.tutorial.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Tutorial not found.');
    const type = dto.type ?? current.type;
    const contentUrl = dto.contentUrl ?? current.contentUrl ?? undefined;
    const body = dto.body ?? current.body ?? undefined;
    this.assertTutorialContent(type, contentUrl, body);
    return this.prisma.tutorial.update({ where: { id }, data: dto });
  }

  async deleteTutorial(id: string) {
    try {
      await this.prisma.tutorial.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Tutorial not found.');
    }
  }

  private assertTutorialContent(type: TutorialType, url?: string, body?: string) {
    if (type === TutorialType.VIDEO && !url) {
      throw new BadRequestException('Video tutorials require contentUrl.');
    }
    if (type === TutorialType.ARTICLE && !body) {
      throw new BadRequestException('Article tutorials require body.');
    }
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────

  async upsertQuiz(tutorialId: string, dto: UpsertQuizDto) {
    this.validateQuestions(dto.questions);
    const tutorial = await this.prisma.tutorial.findUnique({ where: { id: tutorialId } });
    if (!tutorial) throw new NotFoundException('Tutorial not found.');

    const data = {
      questions: dto.questions as unknown as Prisma.InputJsonValue,
      rewardPoints: dto.rewardPoints,
    };
    return this.prisma.quiz.upsert({
      where: { tutorialId },
      create: { tutorialId, ...data },
      update: data,
    });
  }

  async deleteQuiz(tutorialId: string) {
    try {
      await this.prisma.quiz.delete({ where: { tutorialId } });
    } catch {
      throw new NotFoundException('Quiz not found.');
    }
  }

  private validateQuestions(questions: QuizQuestionDto[]) {
    for (const [i, q] of questions.entries()) {
      if (q.answerIndex >= q.options.length) {
        throw new BadRequestException(
          `Question ${i + 1}: answerIndex ${q.answerIndex} out of range (options.length=${q.options.length}).`,
        );
      }
    }
  }

  // ─── Salesperson consumption ──────────────────────────────────────────

  /** Mark a tutorial complete for the authed salesperson. Idempotent — completing
   *  the same tutorial twice doesn't double-count. */
  async completeTutorial(user: AuthUser, tutorialId: string) {
    const profile = await this.requireSalespersonProfile(user);

    const tutorial = await this.prisma.tutorial.findUnique({ where: { id: tutorialId } });
    if (!tutorial) throw new NotFoundException('Tutorial not found.');

    const existing = await this.prisma.trackProgress.findUnique({
      where: { trackId_salespersonId: { trackId: tutorial.trackId, salespersonId: profile.id } },
    });
    const completed = new Set(existing?.completedTutorialIds ?? []);
    completed.add(tutorialId);
    const completedIds = Array.from(completed);

    return this.prisma.trackProgress.upsert({
      where: { trackId_salespersonId: { trackId: tutorial.trackId, salespersonId: profile.id } },
      create: { trackId: tutorial.trackId, salespersonId: profile.id, completedTutorialIds: completedIds },
      update: { completedTutorialIds: completedIds },
    });
  }

  /** Submit answers for a quiz. Scores server-side (answers never trusted from client).
   *  Reward awarded only on the salesperson's first passing attempt. */
  async attemptQuiz(user: AuthUser, quizId: string, answerIndices: number[]) {
    const profile = await this.requireSalespersonProfile(user);

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        tutorial: { select: { trackId: true, track: { select: { category: true } } } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found.');

    const questions = quiz.questions as unknown as QuizQuestion[];
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new BadRequestException('Quiz has no questions.');
    }
    if (answerIndices.length !== questions.length) {
      throw new BadRequestException(`Expected ${questions.length} answers, got ${answerIndices.length}.`);
    }

    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answerIndices[i] === questions[i].answerIndex) correct++;
    }
    const passed = correct / questions.length >= QUIZ_PASS_THRESHOLD;

    // Only award on the salesperson's FIRST passing attempt — prevents farming.
    const alreadyPassed = await this.prisma.quizAttempt.findFirst({
      where: { quizId, salespersonId: profile.id, passed: true },
    });
    const rewardEligible = passed && !alreadyPassed && quiz.rewardPoints > 0;

    const attempt = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizAttempt.create({
        data: { quizId, salespersonId: profile.id, score: correct, passed },
      });
      if (rewardEligible) {
        await tx.pointsTransaction.create({
          data: {
            salespersonId: profile.id,
            reason: PointsReason.QUIZ_REWARD,
            points: quiz.rewardPoints,
          },
        });
        await tx.salespersonProfile.update({
          where: { id: profile.id },
          data: { totalPoints: { increment: quiz.rewardPoints } },
        });
      }
      return created;
    });

    if (rewardEligible) {
      await this.leaderboards.recordScore(
        profile.id,
        quiz.rewardPoints,
        quiz.tutorial.track.category,
      );
    }

    return {
      attempt,
      score: correct,
      total: questions.length,
      passed,
      rewardPointsAwarded: rewardEligible ? quiz.rewardPoints : 0,
    };
  }

  async getMyProgress(user: AuthUser) {
    if (user.role !== UserRole.SALESPERSON) return [];
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return [];
    return this.prisma.trackProgress.findMany({
      where: { salespersonId: profile.id },
      include: {
        track: {
          select: {
            id: true,
            title: true,
            category: true,
            tutorials: { select: { id: true } },
          },
        },
      },
    });
  }

  private async requireSalespersonProfile(user: AuthUser) {
    if (user.role !== UserRole.SALESPERSON) {
      throw new ForbiddenException('Only salespeople have learning progress.');
    }
    const profile = await this.prisma.salespersonProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new NotFoundException('Salesperson profile missing.');
    return profile;
  }

  // ─── Visibility shaping ───────────────────────────────────────────────

  /** Strips quiz answer indices for non-admin viewers — they take the quiz blind. */
  private shapeTutorial(viewer: AuthUser, t: any): any {
    if (!t.quiz) return t;
    if (viewer.role === UserRole.ADMIN) return t;
    const safeQuestions = (t.quiz.questions as Array<{ q: string; options: string[] }>).map(
      (q) => ({ q: q.q, options: q.options }),
    );
    return { ...t, quiz: { ...t.quiz, questions: safeQuestions } };
  }
}
