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
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  institutionalEmail!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    index: true,
  })
  internalCode!: string;

  @Prop({
    required: true,
    minlength: 8,
  })
  passwordHash!: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.STUDENT,
    index: true,
  })
  role!: Role;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status!: UserStatus;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ institutionalEmail: 1 }, { unique: true });
UserSchema.index({ internalCode: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
