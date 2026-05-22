import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiModule } from '../../infrastructure/ai/ai.module';
import { TutorService } from './application/services/tutor.service';
import { TutorController } from './presentation/controllers/tutor.controller';

import {
  TutorSession,
  TutorSessionSchema,
} from './infrastructure/persistence/schemas/tutor-session.schema';

import {
  TutorMessage,
  TutorMessageSchema,
} from './infrastructure/persistence/schemas/tutor-message.schema';

import {
  Topic,
  TopicSchema,
} from '../topics/infrastructure/persistence/schemas/topic.schema';

import {
  Subject,
  SubjectSchema,
} from '../subjects/infrastructure/persistence/schemas/subject.schema';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: TutorSession.name, schema: TutorSessionSchema },
      { name: TutorMessage.name, schema: TutorMessageSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
  ],
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
