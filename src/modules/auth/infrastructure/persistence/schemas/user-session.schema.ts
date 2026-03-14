import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserSessionDocument = HydratedDocument<UserSession>;

@Schema({ _id: false, versionKey: false })
export class SessionDeviceInfo {
  @Prop()
  platform?: string;

  @Prop()
  appVersion?: string;

  @Prop()
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
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    index: true,
  })
  refreshTokenHash!: string;

  @Prop({
    type: SessionDeviceInfoSchema,
    required: false,
  })
  deviceInfo?: SessionDeviceInfo;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop({
    default: false,
    index: true,
  })
  isRevoked!: boolean;

  @Prop({
    required: true,
    index: true,
  })
  expiresAt!: Date;

  @Prop()
  lastUsedAt?: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);

UserSessionSchema.index({ userId: 1, isRevoked: 1 });
UserSessionSchema.index({ expiresAt: 1 });
UserSessionSchema.index({ refreshTokenHash: 1 });
