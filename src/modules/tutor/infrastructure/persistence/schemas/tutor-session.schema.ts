import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TutorSessionDocument = HydratedDocument<TutorSession>;

export enum TutorSessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Schema({
  collection: 'tutor_sessions',
  timestamps: true,
  versionKey: false,
})
export class TutorSession {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Subject',
    required: false,
  })
  subjectId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Topic',
    required: false,
  })
  topicId?: Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
  })
  title?: string;

  @Prop({
    type: String,
    enum: TutorSessionStatus,
    default: TutorSessionStatus.ACTIVE,
  })
  status!: TutorSessionStatus;

  @Prop({
    type: Date,
  })
  lastMessageAt?: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  messageCount!: number;

  @Prop({
    type: String,
    default: 'gemini',
  })
  provider!: string;
}

export const TutorSessionSchema = SchemaFactory.createForClass(TutorSession);

TutorSessionSchema.index({ userId: 1, createdAt: -1 });
TutorSessionSchema.index({ userId: 1, status: 1 });
TutorSessionSchema.index({ subjectId: 1, topicId: 1 });
