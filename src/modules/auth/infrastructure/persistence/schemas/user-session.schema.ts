import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserSessionDocument = HydratedDocument<UserSession>;

@Schema({ _id: false, versionKey: false })
export class SessionDeviceInfo {
  @Prop({ type: String })
  platform?: string;

  @Prop({ type: String })
  appVersion?: string;

  @Prop({ type: String })
  deviceName?: string;
}

const SessionDeviceInfoSchema = SchemaFactory.createForClass(SessionDeviceInfo);

@Schema({
  collection: 'user_sessions',
  timestamps: true,
  versionKey: false,
})
export class UserSession {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  refreshTokenHash!: string;

  @Prop({
    type: SessionDeviceInfoSchema,
    required: false,
  })
  deviceInfo?: SessionDeviceInfo;

  @Prop({ type: String })
  ip?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRevoked!: boolean;

  @Prop({
    type: Date,
    required: true,
  })
  expiresAt!: Date;

  @Prop({ type: Date })
  lastUsedAt?: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

UserSessionSchema.index({ userId: 1, isRevoked: 1 });
UserSessionSchema.index({ expiresAt: 1 });
UserSessionSchema.index({ refreshTokenHash: 1 });
