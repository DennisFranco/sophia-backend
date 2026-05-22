import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TutorMessageDocument = HydratedDocument<TutorMessage>;

export enum TutorMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
}

@Schema({
  collection: 'tutor_messages',
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
  versionKey: false,
})
export class TutorMessage {
  @Prop({
    type: Types.ObjectId,
    ref: 'TutorSession',
    required: true,
  })
  sessionId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: TutorMessageRole,
    required: true,
  })
  role!: TutorMessageRole;

  @Prop({
    required: true,
    trim: true,
  })
  content!: string;

  @Prop({
    trim: true,
  })
  model?: string;

  @Prop({
    type: {
      inputTokens: { type: Number, required: false },
      outputTokens: { type: Number, required: false },
      totalTokens: { type: Number, required: false },
    },
    _id: false,
    required: false,
  })
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  @Prop({
    type: {
      code: { type: String, required: false },
      message: { type: String, required: false },
    },
    _id: false,
    required: false,
  })
  error?: {
    code?: string;
    message?: string;
  };
}

export const TutorMessageSchema = SchemaFactory.createForClass(TutorMessage);

TutorMessageSchema.index({ sessionId: 1, createdAt: 1 });
TutorMessageSchema.index({ userId: 1, createdAt: -1 });
TutorMessageSchema.index({ sessionId: 1, role: 1 });
