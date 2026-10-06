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

  @Prop({ type: String, required: true, trim: true })
  firstName!: string;

  @Prop({ type: String, required: true, trim: true })
  lastName!: string;

  @Prop({ type: String, required: true, trim: true })
  fullName!: string;

  @Prop({ type: String, trim: true })
  universityCode?: string;

  @Prop({ type: String, trim: true })
  faculty?: string;

  @Prop({
    type: String,
    trim: true,
    default: 'Ingeniería de Sistemas',
  })
  program!: string;

  @Prop({ type: Number })
  semester?: number;

  @Prop({ type: String })
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
