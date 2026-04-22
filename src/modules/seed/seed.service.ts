import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  User,
  UserDocument,
} from '../auth/infrastructure/persistence/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../users/infrastructure/persistence/schemas/student-profile.schema';
import {
  Subject,
  SubjectDocument,
} from '../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicDocument,
} from '../topics/infrastructure/persistence/schemas/topic.schema';

import { studentProfileSeed, studentUserSeed } from './data/student-user.seed';
import { physics2SubjectSeed } from './data/subject.seed';
import { physics2TopicsSeed } from './data/topics.seed';
import {
  PracticeSet,
  PracticeSetDocument,
} from '../practice/infrastructure/persistence/schemas/practice-set.schema';
import {
  PracticeQuestion,
  PracticeQuestionDocument,
} from '../practice/infrastructure/persistence/schemas/practice-question.schema';
import { practiceSeedByTopicSlug } from './data/practice.seed';
import {
  TopicProgress,
  TopicProgressDocument,
} from '../progress/infrastructure/persistence/schemas/topic-progress.schema';
import { topicProgressSeedByOrder } from './data/topic-progress.seed';
import { TopicProgressStatus } from '../../common/enums/topic-progress-status.enum';
import {
  UserStats,
  UserStatsDocument,
} from '../progress/infrastructure/persistence/schemas/user-stats.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
    @InjectModel(TopicProgress.name)
    private readonly topicProgressModel: Model<TopicProgressDocument>,
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(PracticeSet.name)
    private readonly practiceSetModel: Model<PracticeSetDocument>,
    @InjectModel(PracticeQuestion.name)
    private readonly practiceQuestionModel: Model<PracticeQuestionDocument>,
    private readonly configService: ConfigService,
  ) {}

  private async recalculateStatsForSeed(
    userId: string,
    subjectId: string,
  ): Promise<void> {
    const topics = await this.topicModel.find({ subjectId });
    const progressList = await this.topicProgressModel.find({
      userId,
      subjectId,
    });

    const completedTopics = progressList.filter(
      (item) => item.status === TopicProgressStatus.COMPLETED,
    ).length;

    const totalStudyTimeSeconds = progressList.reduce(
      (acc, item) => acc + item.timeStudiedSeconds,
      0,
    );

    const totalCorrectAnswers = progressList.reduce(
      (acc, item) => acc + item.correctAnswers,
      0,
    );

    const totalAnsweredQuestions = progressList.reduce(
      (acc, item) => acc + item.totalAnswered,
      0,
    );

    const overallProgressPercent =
      topics.length > 0
        ? Math.round(
            progressList.reduce((acc, item) => acc + item.progressPercent, 0) /
              topics.length,
          )
        : 0;

    const firstInProgress = progressList.find(
      (item) => item.status === TopicProgressStatus.IN_PROGRESS,
    );

    const now = new Date();

    await this.userStatsModel.findOneAndUpdate(
      { userId, subjectId },
      {
        userId,
        subjectId,
        overallProgressPercent,
        completedTopics,
        totalTopics: topics.length,
        completedPractices: 0,
        totalPracticeAttempts: 0,
        totalCorrectAnswers,
        totalAnsweredQuestions,
        totalStudyTimeSeconds,
        currentStreakDays: totalStudyTimeSeconds > 0 ? 1 : 0,
        longestStreakDays: totalStudyTimeSeconds > 0 ? 1 : 0,
        lastStudyDate: totalStudyTimeSeconds > 0 ? now : undefined,
        recommendedTopicId: firstInProgress?.topicId,
        updatedAt: now,
      },
      { upsert: true, new: true },
    );
  }

  async seedStudentUser(): Promise<{
    success: boolean;
    message: string;
    credentials: {
      institutionalEmail: string;
      internalCode: string;
    };
  }> {
    this.ensureSeedEnabled();

    let user = await this.userModel.findOne({
      institutionalEmail: studentUserSeed.institutionalEmail,
    });

    if (!user) {
      user = await this.userModel.create({
        institutionalEmail: studentUserSeed.institutionalEmail,
        internalCode: studentUserSeed.internalCode,
        role: studentUserSeed.role,
        status: studentUserSeed.status,
      });
    }

    const existingProfile = await this.studentProfileModel.findOne({
      userId: user._id,
    });

    if (!existingProfile) {
      await this.studentProfileModel.create({
        userId: user._id,
        ...studentProfileSeed,
      });
    }

    return {
      success: true,
      message: 'Student seed executed successfully',
      credentials: {
        institutionalEmail: studentUserSeed.institutionalEmail,
        internalCode: studentUserSeed.internalCode,
      },
    };
  }

  async seedPhysics2(): Promise<{
    success: boolean;
    message: string;
    subjectCode: string;
    topicsCount: number;
  }> {
    this.ensureSeedEnabled();

    let subject = await this.subjectModel.findOne({
      code: physics2SubjectSeed.code,
    });

    if (!subject) {
      subject = await this.subjectModel.create(physics2SubjectSeed);
    } else {
      subject.name = physics2SubjectSeed.name;
      subject.description = physics2SubjectSeed.description;
      subject.institutionName = physics2SubjectSeed.institutionName;
      subject.programName = physics2SubjectSeed.programName;
      subject.semester = physics2SubjectSeed.semester;
      subject.isActive = physics2SubjectSeed.isActive;
      subject.order = physics2SubjectSeed.order;
      await subject.save();
    }

    for (const topicSeed of physics2TopicsSeed) {
      const existingTopic = await this.topicModel.findOne({
        subjectId: subject._id,
        slug: topicSeed.slug,
      });

      if (!existingTopic) {
        await this.topicModel.create({
          subjectId: subject._id,
          ...topicSeed,
        });
        continue;
      }

      existingTopic.name = topicSeed.name;
      existingTopic.shortDescription = topicSeed.shortDescription;
      existingTopic.contentSummary = topicSeed.contentSummary;
      existingTopic.order = topicSeed.order;
      existingTopic.estimatedMinutes = topicSeed.estimatedMinutes;
      existingTopic.isActive = topicSeed.isActive;
      await existingTopic.save();
    }

    return {
      success: true,
      message: 'Physics II subject and topics seeded successfully',
      subjectCode: physics2SubjectSeed.code,
      topicsCount: physics2TopicsSeed.length,
    };
  }

  private ensureSeedEnabled(): void {
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );

    if (nodeEnv === 'production') {
      throw new Error('Seed is disabled in production');
    }
  }

  async seedTopicProgress(): Promise<{
    success: boolean;
    message: string;
  }> {
    this.ensureSeedEnabled();

    const user = await this.userModel.findOne({
      institutionalEmail: studentUserSeed.institutionalEmail,
    });

    const subject = await this.subjectModel.findOne({
      code: physics2SubjectSeed.code,
    });

    if (!user || !subject) {
      throw new Error(
        'Student user or Physics II subject is missing. Run /seed/all first.',
      );
    }

    const topics = await this.topicModel
      .find({ subjectId: subject._id })
      .sort({ order: 1 });

    for (const item of topicProgressSeedByOrder) {
      const topic = topics.find(
        (topicEntry) => topicEntry.order === item.order,
      );

      if (!topic) {
        continue;
      }

      const existing = await this.topicProgressModel.findOne({
        userId: user._id,
        subjectId: subject._id,
        topicId: topic._id,
      });

      if (!existing) {
        await this.topicProgressModel.create({
          userId: user._id,
          subjectId: subject._id,
          topicId: topic._id,
          status: item.status,
          progressPercent: item.progressPercent,
          completedExercises: item.completedExercises,
          totalExercises: item.totalExercises,
          correctAnswers: item.correctAnswers,
          totalAnswered: item.totalAnswered,
          timeStudiedSeconds: item.timeStudiedSeconds,
          lastPracticedAt: new Date(),
        });
      } else {
        existing.status = item.status;
        existing.progressPercent = item.progressPercent;
        existing.completedExercises = item.completedExercises;
        existing.totalExercises = item.totalExercises;
        existing.correctAnswers = item.correctAnswers;
        existing.totalAnswered = item.totalAnswered;
        existing.timeStudiedSeconds = item.timeStudiedSeconds;
        existing.lastPracticedAt = new Date();
        await existing.save();
      }
    }

    await this.recalculateStatsForSeed(user.id, subject.id);

    return {
      success: true,
      message: 'Topic progress seeded successfully',
    };
  }

  async seedPractice(): Promise<{
    success: boolean;
    message: string;
  }> {
    this.ensureSeedEnabled();

    const subject = await this.subjectModel.findOne({
      code: physics2SubjectSeed.code,
    });

    if (!subject) {
      throw new Error('Physics II subject is missing. Run subject seed first.');
    }

    for (const item of practiceSeedByTopicSlug) {
      const topic = await this.topicModel.findOne({
        subjectId: subject._id,
        slug: item.topicSlug,
      });

      if (!topic) {
        continue;
      }

      let practiceSet = await this.practiceSetModel.findOne({
        topicId: topic._id,
        title: item.practiceSet.title,
      });

      if (!practiceSet) {
        practiceSet = await this.practiceSetModel.create({
          subjectId: subject._id,
          topicId: topic._id,
          title: item.practiceSet.title,
          description: item.practiceSet.description,
          difficulty: item.practiceSet.difficulty,
          estimatedMinutes: item.practiceSet.estimatedMinutes,
          questionCount: item.questions.length,
          tags: item.practiceSet.tags,
          isActive: true,
        });
      } else {
        practiceSet.description = item.practiceSet.description;
        practiceSet.difficulty = item.practiceSet.difficulty;
        practiceSet.estimatedMinutes = item.practiceSet.estimatedMinutes;
        practiceSet.questionCount = item.questions.length;
        practiceSet.tags = item.practiceSet.tags;
        practiceSet.isActive = true;
        await practiceSet.save();
      }

      for (const [index, questionSeed] of item.questions.entries()) {
        const order = index + 1;

        const existingQuestion = await this.practiceQuestionModel.findOne({
          practiceSetId: practiceSet._id,
          order,
        });

        if (!existingQuestion) {
          await this.practiceQuestionModel.create({
            practiceSetId: practiceSet._id,
            topicId: topic._id,
            prompt: questionSeed.prompt,
            options: questionSeed.options,
            correctAnswer: questionSeed.correctAnswer,
            explanation: questionSeed.explanation,
            difficulty: questionSeed.difficulty,
            order,
          });
        } else {
          existingQuestion.prompt = questionSeed.prompt;
          existingQuestion.options = questionSeed.options;
          existingQuestion.correctAnswer = questionSeed.correctAnswer;
          existingQuestion.explanation = questionSeed.explanation;
          existingQuestion.difficulty = questionSeed.difficulty;
          await existingQuestion.save();
        }
      }
    }

    return {
      success: true,
      message: 'Practice data seeded successfully',
    };
  }

  async seedAll(): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.seedStudentUser();
    await this.seedPhysics2();
    await this.seedTopicProgress();
    await this.seedPractice();

    return {
      success: true,
      message: 'All development seeds executed successfully',
    };
  }
}
