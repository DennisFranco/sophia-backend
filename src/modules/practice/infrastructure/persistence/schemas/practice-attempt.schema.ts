import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PracticeAttemptDocument = HydratedDocument<PracticeAttempt>;

export enum PracticeAttemptStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

@Schema({ _id: false, versionKey: false })
export class PracticeAttemptAnswer {
  @Prop({
    type: Types.ObjectId,
    ref: 'PracticeQuestion',
    required: true,
  })
  questionId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  selectedAnswer!: string;

  @Prop({
    type: Boolean,
    required: true,
  })
  isCorrect!: boolean;

  @Prop({
    type: Date,
    required: true,
  })
  answeredAt!: Date;
}

const PracticeAttemptAnswerSchema = SchemaFactory.createForClass(
  PracticeAttemptAnswer,
);

@Schema({
  collection: 'practice_attempts',
  timestamps: true,
  versionKey: false,
})
export class PracticeAttempt {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

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
    type: Types.ObjectId,
    ref: 'Subject',
    required: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: PracticeAttemptStatus,
    default: PracticeAttemptStatus.STARTED,
  })
  status!: PracticeAttemptStatus;

  @Prop({
    type: Date,
    required: true,
  })
  startedAt!: Date;

  @Prop({
    type: Date,
  })
  completedAt?: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  durationSeconds!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalQuestions!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  correctAnswers!: number;

  @Prop({
    type: Number,
    default: 0,
  })
  scorePercent!: number;

  @Prop({
    type: [PracticeAttemptAnswerSchema],
    default: [],
  })
  answers!: PracticeAttemptAnswer[];
}

export const PracticeAttemptSchema =
  SchemaFactory.createForClass(PracticeAttempt);

PracticeAttemptSchema.index({ userId: 1, createdAt: -1 });
PracticeAttemptSchema.index({ userId: 1, topicId: 1, createdAt: -1 });
PracticeAttemptSchema.index({ practiceSetId: 1 });

/**
 * Solo permite un intento STARTED por usuario + práctica.
 * Sí permite múltiples COMPLETED o ABANDONED.
 */
PracticeAttemptSchema.index(
  { userId: 1, practiceSetId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: PracticeAttemptStatus.STARTED,
    },
    name: 'uniq_started_attempt_per_user_practice',
  },
);
