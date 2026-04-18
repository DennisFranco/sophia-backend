import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProgressService } from './application/services/progress.service';
import { ProgressController } from './presentation/controllers/progress.controller';

import {
  TopicProgress,
  TopicProgressSchema,
} from './infrastructure/persistence/schemas/topic-progress.schema';
import {
  UserStats,
  UserStatsSchema,
} from './infrastructure/persistence/schemas/user-stats.schema';
import {
  Subject,
  SubjectSchema,
} from '../subjects/infrastructure/persistence/schemas/subject.schema';
import {
  Topic,
  TopicSchema,
} from '../topics/infrastructure/persistence/schemas/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TopicProgress.name, schema: TopicProgressSchema },
      { name: UserStats.name, schema: UserStatsSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
