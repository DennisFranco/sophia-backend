import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;

@Schema({
  collection: 'student_profiles',
  timestamps: true,
  versionKey: false,
})
export class StudentProfile {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ trim: true })
  universityCode?: string;

  @Prop({ trim: true })
  faculty?: string;

  @Prop({
    trim: true,
    default: 'Ingeniería de Sistemas',
  })
  program!: string;

  @Prop()
  semester?: number;

  @Prop()
  avatarUrl?: string;

  @Prop({
    type: {
      preferredDifficulty: {
        type: String,
        enum: ['EASY', 'MEDIUM', 'HARD'],
        required: false,
      },
    },
    _id: false,
  })
  preferences?: {
    preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  };
}

export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);

StudentProfileSchema.index({ userId: 1 }, { unique: true });
