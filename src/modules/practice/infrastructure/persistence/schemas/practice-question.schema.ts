import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PracticeDifficulty } from '../../../../../common/enums/practice-difficulty.enum';

export type PracticeQuestionDocument = HydratedDocument<PracticeQuestion>;

export enum PracticeQuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
}

@Schema({
  collection: 'practice_questions',
  timestamps: true,
  versionKey: false,
})
export class PracticeQuestion {
  @Prop({
    type: Types.ObjectId,
    ref: 'PracticeSet',
    required: true,
  })
  practiceSetId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Topic',
    required: true,
  })
  topicId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: PracticeQuestionType,
    default: PracticeQuestionType.MULTIPLE_CHOICE,
  })
  type!: PracticeQuestionType;

  @Prop({
    required: true,
    trim: true,
  })
  prompt!: string;

  @Prop({
    type: [String],
    default: [],
  })
  options!: string[];

  @Prop({
    required: true,
    trim: true,
  })
  correctAnswer!: string;

  @Prop({
    trim: true,
  })
  explanation?: string;

  @Prop({
    type: String,
    enum: PracticeDifficulty,
    required: true,
  })
  difficulty!: PracticeDifficulty;

  @Prop({
    required: true,
  })
  order!: number;
}

export const PracticeQuestionSchema =
  SchemaFactory.createForClass(PracticeQuestion);

PracticeQuestionSchema.index({ practiceSetId: 1, order: 1 }, { unique: true });
PracticeQuestionSchema.index({ topicId: 1, difficulty: 1 });
