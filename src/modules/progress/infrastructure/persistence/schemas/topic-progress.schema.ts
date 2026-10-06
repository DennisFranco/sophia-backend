import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TopicProgressStatus } from '../../../../../common/enums/topic-progress-status.enum';

export type TopicProgressDocument = HydratedDocument<TopicProgress>;

@Schema({
  collection: 'topic_progress',
  timestamps: true,
  versionKey: false,
})
export class TopicProgress {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

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
    enum: TopicProgressStatus,
    default: TopicProgressStatus.NOT_STARTED,
  })
  status!: TopicProgressStatus;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  })
  progressPercent!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  completedExercises!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalExercises!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  correctAnswers!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalAnswered!: number;

  @Prop({
    type: Date,
  })
  lastPracticedAt?: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  timeStudiedSeconds!: number;
}

export const TopicProgressSchema = SchemaFactory.createForClass(TopicProgress);

TopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
TopicProgressSchema.index({ userId: 1, subjectId: 1 });
TopicProgressSchema.index({ userId: 1, status: 1 });
TopicProgressSchema.index({ userId: 1, lastPracticedAt: -1 });
