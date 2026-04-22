import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DashboardService } from './application/services/dashboard.service';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { ProgressModule } from '../progress/progress.module';

import {
  Subject,
  SubjectSchema,
} from '../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicSchema,
} from '../topics/infrastructure/persistence/schemas/topic.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../users/infrastructure/persistence/schemas/student-profile.schema';
import {
  UserStats,
  UserStatsSchema,
} from '../progress/infrastructure/persistence/schemas/user-stats.schema';

@Module({
  imports: [
    ProgressModule,
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
