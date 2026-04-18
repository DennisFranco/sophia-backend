import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserStatsDocument = HydratedDocument<UserStats>;

@Schema({
  collection: 'user_stats',
  timestamps: false,
  versionKey: false,
})
export class UserStats {
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
    default: 0,
    min: 0,
    max: 100,
  })
  overallProgressPercent!: number;

  @Prop({
    default: 0,
  })
  completedTopics!: number;

  @Prop({
    default: 0,
  })
  totalTopics!: number;

  @Prop({
    default: 0,
  })
  completedPractices!: number;

  @Prop({
    default: 0,
  })
  totalPracticeAttempts!: number;

  @Prop({
    default: 0,
  })
  totalCorrectAnswers!: number;

  @Prop({
    default: 0,
  })
  totalAnsweredQuestions!: number;

  @Prop({
    default: 0,
  })
  totalStudyTimeSeconds!: number;

  @Prop({
    default: 0,
  })
  currentStreakDays!: number;

  @Prop({
    default: 0,
  })
  longestStreakDays!: number;

  @Prop()
  lastStudyDate?: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'Topic',
  })
  recommendedTopicId?: Types.ObjectId;

  @Prop({
    type: String,
  })
  recommendedPracticeLabel?: string;

  @Prop({
    required: true,
    default: () => new Date(),
  })
  updatedAt!: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);

UserStatsSchema.index({ userId: 1, subjectId: 1 }, { unique: true });
