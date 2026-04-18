import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubjectsService } from './application/services/subjects.service';
import { SubjectsController } from './presentation/controllers/subjects.controller';
import {
  Subject,
  SubjectSchema,
} from './infrastructure/persistence/schemas/subject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subject.name, schema: SubjectSchema }]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}
