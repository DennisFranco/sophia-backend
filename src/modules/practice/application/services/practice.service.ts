import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  PracticeSet,
  PracticeSetDocument,
} from '../../infrastructure/persistence/schemas/practice-set.schema';
import {
  PracticeQuestion,
  PracticeQuestionDocument,
} from '../../infrastructure/persistence/schemas/practice-question.schema';
import {
  PracticeAttempt,
  PracticeAttemptDocument,
  PracticeAttemptStatus,
} from '../../infrastructure/persistence/schemas/practice-attempt.schema';
import { PracticeDifficulty } from '../../../../common/enums/practice-difficulty.enum';
import { ProgressService } from '../../../../modules/progress/application/services/progress.service';

@Injectable()
export class PracticeService {
  constructor(
    @InjectModel(PracticeSet.name)
    private readonly practiceSetModel: Model<PracticeSetDocument>,
    @InjectModel(PracticeQuestion.name)
    private readonly practiceQuestionModel: Model<PracticeQuestionDocument>,
    @InjectModel(PracticeAttempt.name)
    private readonly practiceAttemptModel: Model<PracticeAttemptDocument>,
    private readonly progressService: ProgressService,
  ) {}

  async getPracticeSets(topicId?: string, difficulty?: PracticeDifficulty) {
    const filter: Record<string, unknown> = { isActive: true };

    if (topicId) {
      filter.topicId = new Types.ObjectId(topicId);
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    return this.practiceSetModel
      .find(filter)
      .sort({ difficulty: 1, createdAt: 1 })
      .exec();
  }

  async getRecommendedPractice(topicId: string) {
    const easyPractice = await this.practiceSetModel
      .findOne({
        topicId: new Types.ObjectId(topicId),
        difficulty: PracticeDifficulty.EASY,
        isActive: true,
      })
      .sort({ createdAt: 1 })
      .exec();

    if (easyPractice) {
      return easyPractice;
    }

    const fallbackPractice = await this.practiceSetModel
      .findOne({
        topicId: new Types.ObjectId(topicId),
        isActive: true,
      })
      .sort({ difficulty: 1, createdAt: 1 })
      .exec();

    if (!fallbackPractice) {
      throw new NotFoundException('Recommended practice not found');
    }

    return fallbackPractice;
  }

  async startPractice(userId: string, practiceSetId: string) {
    const practiceSet = await this.practiceSetModel
      .findById(practiceSetId)
      .exec();

    if (!practiceSet || !practiceSet.isActive) {
      throw new NotFoundException('Practice set not found');
    }

    const questions = await this.practiceQuestionModel
      .find({ practiceSetId: practiceSet._id })
      .sort({ order: 1 })
      .exec();

    if (questions.length === 0) {
      throw new BadRequestException('Practice set has no questions');
    }

    const existingStartedAttempt = await this.practiceAttemptModel.findOne({
      userId: new Types.ObjectId(userId),
      practiceSetId: practiceSet._id,
      status: PracticeAttemptStatus.STARTED,
    });

    if (existingStartedAttempt) {
      return {
        attemptId: existingStartedAttempt.id,
        practiceSet: {
          id: practiceSet.id,
          title: practiceSet.title,
          description: practiceSet.description,
          difficulty: practiceSet.difficulty,
          estimatedMinutes: practiceSet.estimatedMinutes,
        },
        questions: questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          order: question.order,
        })),
        reusedAttempt: true,
      };
    }

    try {
      const attempt = await this.practiceAttemptModel.create({
        userId: new Types.ObjectId(userId),
        practiceSetId: practiceSet._id,
        topicId: practiceSet.topicId,
        subjectId: practiceSet.subjectId,
        status: PracticeAttemptStatus.STARTED,
        startedAt: new Date(),
        totalQuestions: questions.length,
        correctAnswers: 0,
        scorePercent: 0,
        durationSeconds: 0,
        answers: [],
      });

      return {
        attemptId: attempt.id,
        practiceSet: {
          id: practiceSet.id,
          title: practiceSet.title,
          description: practiceSet.description,
          difficulty: practiceSet.difficulty,
          estimatedMinutes: practiceSet.estimatedMinutes,
        },
        questions: questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          order: question.order,
        })),
        reusedAttempt: false,
      };
    } catch (error: unknown) {
      const mongoError = error as { code?: number };

      if (mongoError?.code === 11000) {
        const lockedAttempt = await this.practiceAttemptModel.findOne({
          userId: new Types.ObjectId(userId),
          practiceSetId: practiceSet._id,
          status: PracticeAttemptStatus.STARTED,
        });

        if (lockedAttempt) {
          return {
            attemptId: lockedAttempt.id,
            practiceSet: {
              id: practiceSet.id,
              title: practiceSet.title,
              description: practiceSet.description,
              difficulty: practiceSet.difficulty,
              estimatedMinutes: practiceSet.estimatedMinutes,
            },
            questions: questions.map((question) => ({
              id: question.id,
              type: question.type,
              prompt: question.prompt,
              options: question.options,
              order: question.order,
            })),
            reusedAttempt: true,
          };
        }
      }

      throw error;
    }
  }

  async submitAttempt(
    userId: string,
    attemptId: string,
    payload: {
      answers: Array<{
        questionId: string;
        selectedAnswer: string;
      }>;
      durationSeconds: number;
    },
  ) {
    const attempt = await this.practiceAttemptModel.findById(attemptId).exec();

    if (!attempt) {
      throw new NotFoundException('Practice attempt not found');
    }

    if (attempt.userId.toString() !== userId) {
      throw new BadRequestException(
        'Practice attempt does not belong to current user',
      );
    }

    if (attempt.status === PracticeAttemptStatus.COMPLETED) {
      throw new BadRequestException('Practice attempt already completed');
    }

    if (attempt.status === PracticeAttemptStatus.ABANDONED) {
      throw new BadRequestException('Practice attempt was abandoned');
    }

    const questions = await this.practiceQuestionModel
      .find({ practiceSetId: attempt.practiceSetId })
      .sort({ order: 1 })
      .exec();

    if (questions.length === 0) {
      throw new BadRequestException('Practice set has no questions');
    }

    if (payload.answers.length !== questions.length) {
      throw new BadRequestException(
        'All practice questions must be answered exactly once',
      );
    }

    const duplicatedIds = payload.answers
      .map((item) => item.questionId)
      .filter((id, index, array) => array.indexOf(id) !== index);

    if (duplicatedIds.length > 0) {
      throw new BadRequestException(
        'Duplicated question answers are not allowed',
      );
    }

    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );

    const resolvedAnswers = payload.answers.map((answer) => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new BadRequestException(
          `Question ${answer.questionId} not found in this practice set`,
        );
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;

      return {
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      };
    });

    const correctAnswers = resolvedAnswers.filter(
      (answer) => answer.isCorrect,
    ).length;

    const totalQuestions = questions.length;
    const scorePercent =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    attempt.answers = resolvedAnswers;
    attempt.correctAnswers = correctAnswers;
    attempt.totalQuestions = totalQuestions;
    attempt.scorePercent = scorePercent;
    attempt.durationSeconds = payload.durationSeconds;
    attempt.status = PracticeAttemptStatus.COMPLETED;
    attempt.completedAt = new Date();

    await attempt.save();

    const progressPercent =
      scorePercent >= 100 ? 100 : Math.max(10, Math.min(scorePercent, 95));

    await this.progressService.updateTopicProgress(
      userId,
      attempt.topicId.toString(),
      {
        progressPercent,
        completedExercises: 1,
        totalExercises: 1,
        correctAnswers,
        totalAnswered: totalQuestions,
        timeStudiedSeconds: payload.durationSeconds,
      },
    );

    return {
      attemptId: attempt.id,
      status: attempt.status,
      correctAnswers,
      totalQuestions,
      scorePercent,
      feedback: resolvedAnswers.map((answer) => {
        const question = questionMap.get(answer.questionId.toString());

        return {
          questionId: answer.questionId.toString(),
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          correctAnswer: question?.correctAnswer,
          explanation: question?.explanation,
        };
      }),
    };
  }

  async abandonAttempt(userId: string, attemptId: string) {
    const attempt = await this.practiceAttemptModel.findById(attemptId).exec();

    if (!attempt) {
      throw new NotFoundException('Practice attempt not found');
    }

    if (attempt.userId.toString() !== userId) {
      throw new BadRequestException(
        'Practice attempt does not belong to current user',
      );
    }

    if (attempt.status === PracticeAttemptStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed practice attempts cannot be abandoned',
      );
    }

    if (attempt.status === PracticeAttemptStatus.ABANDONED) {
      return {
        success: true,
        message: 'Practice attempt already abandoned',
        attemptId: attempt.id,
        status: attempt.status,
      };
    }

    attempt.status = PracticeAttemptStatus.ABANDONED;
    attempt.completedAt = new Date();

    await attempt.save();

    return {
      success: true,
      message: 'Practice attempt abandoned successfully',
      attemptId: attempt.id,
      status: attempt.status,
    };
  }

  async getHistory(userId: string) {
    return this.practiceAttemptModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('practiceSetId')
      .populate('topicId')
      .exec();
  }

  async getAttemptById(userId: string, attemptId: string) {
    const attempt = await this.practiceAttemptModel
      .findById(attemptId)
      .populate('practiceSetId')
      .populate('topicId')
      .exec();

    if (!attempt) {
      throw new NotFoundException('Practice attempt not found');
    }

    if (attempt.userId.toString() !== userId) {
      throw new BadRequestException(
        'Practice attempt does not belong to current user',
      );
    }

    const questions = await this.practiceQuestionModel
      .find({
        practiceSetId: attempt.practiceSetId,
      })
      .sort({ order: 1 })
      .exec();

    const answerMap = new Map(
      attempt.answers.map((answer) => [
        answer.questionId.toString(),
        {
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
        },
      ]),
    );

    const isCompleted = attempt.status === PracticeAttemptStatus.COMPLETED;

    const practiceSet = attempt.practiceSetId as unknown as {
      id?: string;
      _id?: { toString(): string };
      title?: string;
      description?: string;
      difficulty?: string;
      estimatedMinutes?: number;
    };

    const topic = attempt.topicId as unknown as {
      id?: string;
      _id?: { toString(): string };
      name?: string;
    };

    return {
      attemptId: attempt.id,
      status: attempt.status,
      practiceSet: {
        id: practiceSet.id ?? practiceSet._id?.toString(),
        title: practiceSet.title,
        description: practiceSet.description,
        difficulty: practiceSet.difficulty,
        estimatedMinutes: practiceSet.estimatedMinutes,
      },
      topic: {
        id: topic.id ?? topic._id?.toString(),
        name: topic.name,
      },
      subjectId: attempt.subjectId.toString(),
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      durationSeconds: attempt.durationSeconds,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      scorePercent: attempt.scorePercent,
      questions: questions.map((question) => {
        const answer = answerMap.get(question.id);

        return {
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          order: question.order,
          selectedAnswer: answer?.selectedAnswer ?? null,
          isCorrect: answer?.isCorrect ?? null,
          ...(isCompleted
            ? {
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
              }
            : {}),
        };
      }),
    };
  }
}
