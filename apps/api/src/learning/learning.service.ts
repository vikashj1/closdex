import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TutorialType, UserRole } from '@closdex/db';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/jwt.strategy';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateTutorialDto } from './dto/create-tutorial.dto';
import { UpdateTutorialDto } from './dto/update-tutorial.dto';
import { UpsertQuizDto, QuizQuestionDto } from './dto/upsert-quiz.dto';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

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
