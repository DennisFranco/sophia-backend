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
    private readonly configService: ConfigService,
  ) {}

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

  async seedAll(): Promise<{
    success: boolean;
    message: string;
  }> {
    await this.seedStudentUser();
    await this.seedPhysics2();

    return {
      success: true,
      message: 'All development seeds executed successfully',
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
}
