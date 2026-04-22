import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PracticeService } from './application/services/practice.service';
import { PracticeController } from './presentation/controllers/practice.controller';
import {
  PracticeSet,
  PracticeSetSchema,
} from './infrastructure/persistence/schemas/practice-set.schema';
import {
  PracticeQuestion,
  PracticeQuestionSchema,
} from './infrastructure/persistence/schemas/practice-question.schema';
import {
  PracticeAttempt,
  PracticeAttemptSchema,
} from './infrastructure/persistence/schemas/practice-attempt.schema';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    ProgressModule,
    MongooseModule.forFeature([
      { name: PracticeSet.name, schema: PracticeSetSchema },
      { name: PracticeQuestion.name, schema: PracticeQuestionSchema },
      { name: PracticeAttempt.name, schema: PracticeAttemptSchema },
    ]),
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
