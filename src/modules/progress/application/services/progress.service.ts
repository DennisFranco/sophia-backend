import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  TopicProgress,
  TopicProgressDocument,
} from '../../infrastructure/persistence/schemas/topic-progress.schema';
import {
  UserStats,
  UserStatsDocument,
} from '../../infrastructure/persistence/schemas/user-stats.schema';
import {
  Subject,
  SubjectDocument,
} from '../../../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicDocument,
} from '../../../topics/infrastructure/persistence/schemas/topic.schema';
import { TopicProgressStatus } from '../../../../common/enums/topic-progress-status.enum';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(TopicProgress.name)
    private readonly topicProgressModel: Model<TopicProgressDocument>,
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
  ) {}

  async ensureInitialProgressForUser(userId: string): Promise<void> {
    const activeSubject = await this.subjectModel
      .findOne({ isActive: true })
      .exec();

    if (!activeSubject) {
      return;
    }

    const topics = await this.topicModel
      .find({ subjectId: activeSubject._id, isActive: true })
      .sort({ order: 1 })
      .exec();

    if (topics.length === 0) {
      return;
    }

    for (const topic of topics) {
      const exists = await this.topicProgressModel.findOne({
        userId: new Types.ObjectId(userId),
        topicId: topic._id,
      });

      if (!exists) {
        await this.topicProgressModel.create({
          userId: new Types.ObjectId(userId),
          subjectId: activeSubject._id,
          topicId: topic._id,
          status: TopicProgressStatus.NOT_STARTED,
          progressPercent: 0,
          completedExercises: 0,
          totalExercises: 0,
          correctAnswers: 0,
          totalAnswered: 0,
          timeStudiedSeconds: 0,
        });
      }
    }

    await this.recalculateUserStats(userId, activeSubject.id);
  }

  async getOverview(userId: string): Promise<UserStatsDocument> {
    const activeSubject = await this.subjectModel
      .findOne({ isActive: true })
      .exec();

    if (!activeSubject) {
      throw new NotFoundException('Active subject not found');
    }

    await this.ensureInitialProgressForUser(userId);

    const existingStats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
      subjectId: activeSubject._id,
    });

    if (existingStats) {
      return existingStats;
    }

    return this.recalculateUserStats(userId, activeSubject.id);
  }

  async getTopicProgressByUser(userId: string) {
    const activeSubject = await this.subjectModel
      .findOne({ isActive: true })
      .exec();

    if (!activeSubject) {
      throw new NotFoundException('Active subject not found');
    }

    await this.ensureInitialProgressForUser(userId);

    return this.topicProgressModel
      .find({
        userId: new Types.ObjectId(userId),
        subjectId: activeSubject._id,
      })
      .sort({ createdAt: 1 })
      .populate('topicId')
      .exec();
  }

  async updateTopicProgress(
    userId: string,
    topicId: string,
    payload: {
      progressPercent: number;
      completedExercises?: number;
      totalExercises?: number;
      correctAnswers?: number;
      totalAnswered?: number;
      timeStudiedSeconds?: number;
    },
  ) {
    const topic = await this.topicModel.findById(topicId).exec();

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const status =
      payload.progressPercent >= 100
        ? TopicProgressStatus.COMPLETED
        : payload.progressPercent > 0
          ? TopicProgressStatus.IN_PROGRESS
          : TopicProgressStatus.NOT_STARTED;

    const progress = await this.topicProgressModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(userId),
          topicId: topic._id,
        },
        {
          $set: {
            status,
            progressPercent: payload.progressPercent,
            completedExercises: payload.completedExercises ?? 0,
            totalExercises: payload.totalExercises ?? 0,
            correctAnswers: payload.correctAnswers ?? 0,
            totalAnswered: payload.totalAnswered ?? 0,
            timeStudiedSeconds: payload.timeStudiedSeconds ?? 0,
            lastPracticedAt: new Date(),
            subjectId: topic.subjectId,
          },
        },
        {
          new: true,
          upsert: true,
        },
      )
      .exec();

    await this.recalculateUserStats(userId, String(topic.subjectId));

    return progress;
  }

  async recalculateUserStats(
    userId: string,
    subjectId: string,
  ): Promise<UserStatsDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const subjectObjectId = new Types.ObjectId(subjectId);

    const topics = await this.topicModel
      .find({ subjectId: subjectObjectId, isActive: true })
      .sort({ order: 1 })
      .exec();

    const topicProgressList = await this.topicProgressModel
      .find({
        userId: userObjectId,
        subjectId: subjectObjectId,
      })
      .exec();

    const totalTopics = topics.length;
    const completedTopics = topicProgressList.filter(
      (item) => item.status === TopicProgressStatus.COMPLETED,
    ).length;

    const totalStudyTimeSeconds = topicProgressList.reduce(
      (acc, item) => acc + (item.timeStudiedSeconds ?? 0),
      0,
    );

    const totalCorrectAnswers = topicProgressList.reduce(
      (acc, item) => acc + (item.correctAnswers ?? 0),
      0,
    );

    const totalAnsweredQuestions = topicProgressList.reduce(
      (acc, item) => acc + (item.totalAnswered ?? 0),
      0,
    );

    const overallProgressPercent =
      totalTopics > 0
        ? Math.round(
            topicProgressList.reduce(
              (acc, item) => acc + item.progressPercent,
              0,
            ) / totalTopics,
          )
        : 0;

    const recommendedTopic = this.resolveRecommendedTopic(
      topics,
      topicProgressList,
    );
    const lastStudyDate = this.resolveLastStudyDate(topicProgressList);
    const currentStreakDays = lastStudyDate ? 1 : 0;
    const longestStreakDays = currentStreakDays;

    await this.userStatsModel.findOneAndUpdate(
      {
        userId: userObjectId,
        subjectId: subjectObjectId,
      },
      {
        $set: {
          overallProgressPercent,
          completedTopics,
          totalTopics,
          completedPractices: 0,
          totalPracticeAttempts: 0,
          totalCorrectAnswers,
          totalAnsweredQuestions,
          totalStudyTimeSeconds,
          currentStreakDays,
          longestStreakDays,
          lastStudyDate,
          recommendedTopicId: recommendedTopic?._id,
          recommendedPracticeLabel: recommendedTopic
            ? `Práctica sugerida de ${recommendedTopic.name}`
            : undefined,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      },
    );

    const updatedStats = await this.userStatsModel.findOne({
      userId: userObjectId,
      subjectId: subjectObjectId,
    });

    if (!updatedStats) {
      throw new NotFoundException('User stats could not be recalculated');
    }

    return updatedStats;
  }

  private resolveRecommendedTopic(
    topics: TopicDocument[],
    topicProgressList: TopicProgressDocument[],
  ): TopicDocument | undefined {
    const progressMap = new Map(
      topicProgressList.map((item) => [String(item.topicId), item]),
    );

    const inProgressTopic = topics.find((topic) => {
      const progress = progressMap.get(String(topic._id));
      return progress?.status === TopicProgressStatus.IN_PROGRESS;
    });

    if (inProgressTopic) {
      return inProgressTopic;
    }

    const notStartedTopic = topics.find((topic) => {
      const progress = progressMap.get(String(topic._id));
      return !progress || progress.status === TopicProgressStatus.NOT_STARTED;
    });

    if (notStartedTopic) {
      return notStartedTopic;
    }

    return topics[0];
  }

  private resolveLastStudyDate(
    topicProgressList: TopicProgressDocument[],
  ): Date | undefined {
    const dates = topicProgressList
      .map((item) => item.lastPracticedAt)
      .filter((value): value is Date => value instanceof Date);

    if (dates.length === 0) {
      return undefined;
    }

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }
}
