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
  TopicProgress,
  TopicProgressDocument,
} from '../../../progress/infrastructure/persistence/schemas/topic-progress.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../../../users/infrastructure/persistence/schemas/student-profile.schema';
import { ProgressService } from '../../../progress/application/services/progress.service';
import { TopicProgressStatus } from '../../../../common/enums/topic-progress-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly progressService: ProgressService,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
    @InjectModel(TopicProgress.name)
    private readonly topicProgressModel: Model<TopicProgressDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
  ) {}

  async getDashboard(userId: string) {
    const activeSubject = await this.subjectModel
      .findOne({ isActive: true })
      .exec();

    if (!activeSubject) {
      throw new NotFoundException('Active subject not found');
    }

    await this.progressService.ensureInitialProgressForUser(userId);

    const stats = await this.progressService.getOverview(userId);
    const profile = await this.studentProfileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    const recommendedTopic = await this.resolveRecommendedTopic(
      userId,
      activeSubject.id,
    );

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
            id: recommendedTopic.topic.id,
            name: recommendedTopic.topic.name,
            slug: recommendedTopic.topic.slug,
            progressPercent: recommendedTopic.progress.progressPercent,
            status: recommendedTopic.progress.status,
          }
        : undefined,
      recommendedPractice: recommendedTopic
        ? {
            label: `Práctica sugerida de ${recommendedTopic.topic.name}`,
            topicId: recommendedTopic.topic.id,
          }
        : undefined,
      quickActions: [
        { key: 'continue-topic', label: 'Continuar tema' },
        { key: 'start-practice', label: 'Practicar' },
        { key: 'ask-tutor', label: 'Preguntar al tutor' },
      ],
    };
  }

  private async resolveRecommendedTopic(userId: string, subjectId: string) {
    const topics = await this.topicModel
      .find({
        subjectId: new Types.ObjectId(subjectId),
        isActive: true,
      })
      .sort({ order: 1 })
      .exec();

    const progressList = await this.topicProgressModel
      .find({
        userId: new Types.ObjectId(userId),
        subjectId: new Types.ObjectId(subjectId),
      })
      .exec();

    const progressMap = new Map(
      progressList.map((item) => [String(item.topicId), item]),
    );

    for (const topic of topics) {
      const progress = progressMap.get(String(topic._id));
      if (progress?.status === TopicProgressStatus.IN_PROGRESS) {
        return { topic, progress };
      }
    }

    for (const topic of topics) {
      const progress = progressMap.get(String(topic._id));
      if (!progress || progress.status === TopicProgressStatus.NOT_STARTED) {
        return {
          topic,
          progress: progress ?? {
            progressPercent: 0,
            status: TopicProgressStatus.NOT_STARTED,
          },
        };
      }
    }

    if (topics[0]) {
      const progress = progressMap.get(String(topics[0]._id));
      return {
        topic: topics[0],
        progress: progress ?? {
          progressPercent: 100,
          status: TopicProgressStatus.COMPLETED,
        },
      };
    }

    return null;
  }
}
