import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PracticeDifficulty } from '../../../../../common/enums/practice-difficulty.enum';

export type PracticeSetDocument = HydratedDocument<PracticeSet>;

@Schema({
  collection: 'practice_sets',
  timestamps: true,
  versionKey: false,
})
export class PracticeSet {
  @Prop({
    type: Types.ObjectId,
    ref: 'Subject',
    required: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Topic',
    required: true,
  })
  topicId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  description!: string;

  @Prop({
    type: String,
    enum: PracticeDifficulty,
    required: true,
  })
  difficulty!: PracticeDifficulty;

  @Prop({
    type: Number,
    default: 15,
  })
  estimatedMinutes!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  questionCount!: number;

  @Prop({
    type: [String],
    default: [],
  })
  tags!: string[];

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;
}

export const PracticeSetSchema = SchemaFactory.createForClass(PracticeSet);

PracticeSetSchema.index({ topicId: 1, difficulty: 1, isActive: 1 });
PracticeSetSchema.index({ subjectId: 1, topicId: 1, isActive: 1 });
