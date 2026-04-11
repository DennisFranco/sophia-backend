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
import { studentProfileSeed, studentUserSeed } from './data/student-user.seed';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
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
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );

    if (nodeEnv === 'production') {
      throw new Error('Seed is disabled in production');
    }

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
}
