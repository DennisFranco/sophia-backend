import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../../../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Schema({
  collection: 'users',
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  })
  institutionalEmail!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  internalCode!: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.STUDENT,
  })
  role!: Role;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  lastLoginAt?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ institutionalEmail: 1 }, { unique: true });
UserSchema.index({ internalCode: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
