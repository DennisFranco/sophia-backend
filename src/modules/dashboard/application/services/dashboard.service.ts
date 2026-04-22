import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Subject,
  SubjectDocument,
} from '../../../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicDocument,
} from '../../../topics/infrastructure/persistence/schemas/topic.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../../../users/infrastructure/persistence/schemas/student-profile.schema';
import {
  UserStats,
  UserStatsDocument,
} from '../../../progress/infrastructure/persistence/schemas/user-stats.schema';

import { ProgressService } from '../../../progress/application/services/progress.service';
import { TopicProgressStatus } from '../../../../common/enums/topic-progress-status.enum';

type DashboardTopicProgressItem = {
  topicId: {
    _id: Types.ObjectId;
  };
  status: TopicProgressStatus;
  progressPercent: number;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly progressService: ProgressService,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStatsDocument>,
  ) {}

  async getDashboard(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const profile = await this.studentProfileModel.findOne({
      userId: userObjectId,
    });

    const activeSubject = await this.subjectModel.findOne({ isActive: true });

    if (!activeSubject) {
      throw new NotFoundException('Active subject not found');
    }

    await this.progressService.ensureInitialProgressForUser(userId);

    const stats = await this.progressService.getOverview(userId);

    const topicProgressRaw =
      await this.progressService.getTopicProgressByUser(userId);
    const topicProgressList = topicProgressRaw as DashboardTopicProgressItem[];

    const topics = await this.topicModel
      .find({ subjectId: activeSubject._id })
      .sort({ order: 1 });

    const progressMap = new Map<string, DashboardTopicProgressItem>(
      topicProgressList.map((item) => [String(item.topicId._id), item]),
    );

    const recommendedTopic = this.resolveRecommendedTopic(
      topics,
      topicProgressList,
    );

    const recommendedPractice = recommendedTopic
      ? this.buildSuggestedPractice(
          recommendedTopic,
          stats.overallProgressPercent,
        )
      : undefined;

    return {
      greeting: `Hola, ${profile?.firstName ?? 'Estudiante'}`,

      currentSubject: {
        id: activeSubject.id,
        name: activeSubject.name,
      },

      overallProgressPercent: stats.overallProgressPercent,
      currentStreakDays: stats.currentStreakDays,

      recommendedTopic: recommendedTopic
        ? {
            id: recommendedTopic.id,
            name: recommendedTopic.name,
            progressPercent:
              progressMap.get(recommendedTopic.id)?.progressPercent ?? 0,
            status:
              progressMap.get(recommendedTopic.id)?.status ??
              TopicProgressStatus.NOT_STARTED,
            shortDescription: recommendedTopic.shortDescription,
          }
        : undefined,

      recommendedPractice,

      quickActions: [
        { key: 'continue-topic', label: 'Continuar tema' },
        { key: 'start-practice', label: 'Practicar' },
        { key: 'ask-tutor', label: 'Preguntar al tutor' },
      ],
    };
  }

  private resolveRecommendedTopic(
    topics: TopicDocument[],
    topicProgressList: DashboardTopicProgressItem[],
  ): TopicDocument | undefined {
    const progressMap = new Map<string, DashboardTopicProgressItem>(
      topicProgressList.map((item) => [String(item.topicId._id), item]),
    );

    const inProgress = topics.find((topic) => {
      const progress = progressMap.get(topic.id);
      return progress?.status === TopicProgressStatus.IN_PROGRESS;
    });

    if (inProgress) {
      return inProgress;
    }

    const notStarted = topics.find((topic) => {
      const progress = progressMap.get(topic.id);
      return !progress || progress.status === TopicProgressStatus.NOT_STARTED;
    });

    if (notStarted) {
      return notStarted;
    }

    return topics[0];
  }

  private buildSuggestedPractice(
    topic: TopicDocument,
    overallProgressPercent: number,
  ) {
    let difficulty = 'EASY';
    let reason = 'Reforzar conceptos base.';

    if (overallProgressPercent >= 30) {
      difficulty = 'MEDIUM';
      reason = 'Consolidar conocimiento.';
    }

    if (overallProgressPercent >= 70) {
      difficulty = 'HARD';
      reason = 'Dominio avanzado.';
    }

    return {
      topicId: topic.id,
      topicName: topic.name,
      difficulty,
      estimatedMinutes: Math.max(10, Math.round(topic.estimatedMinutes * 0.3)),
      reason,
    };
  }
}
