import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import {
  User,
  UserSchema,
} from '../auth/infrastructure/persistence/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../users/infrastructure/persistence/schemas/student-profile.schema';
import {
  Subject,
  SubjectSchema,
} from '../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicSchema,
} from '../topics/infrastructure/persistence/schemas/topic.schema';
import {
  PracticeSet,
  PracticeSetSchema,
} from '../practice/infrastructure/persistence/schemas/practice-set.schema';
import {
  PracticeQuestion,
  PracticeQuestionSchema,
} from '../practice/infrastructure/persistence/schemas/practice-question.schema';
import {
  TopicProgress,
  TopicProgressSchema,
} from '../progress/infrastructure/persistence/schemas/topic-progress.schema';
import {
  UserStats,
  UserStatsSchema,
} from '../progress/infrastructure/persistence/schemas/user-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: PracticeSet.name, schema: PracticeSetSchema },
      { name: PracticeQuestion.name, schema: PracticeQuestionSchema },
      { name: TopicProgress.name, schema: TopicProgressSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
