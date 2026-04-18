import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TopicsService } from './application/services/topics.service';
import { TopicsController } from './presentation/controllers/topics.controller';
import {
  Topic,
  TopicSchema,
} from './infrastructure/persistence/schemas/topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Topic.name, schema: TopicSchema }]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService, MongooseModule],
})
export class TopicsModule {}
