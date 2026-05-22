import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({
  collection: 'subjects',
  timestamps: true,
  versionKey: false,
})
export class Subject {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  code!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  description!: string;

  @Prop({
    type: String,
    trim: true,
    default: 'Fundación Universitaria Católica Lumen Gentium',
  })
  institutionName!: string;

  @Prop({
    type: String,
    trim: true,
    default: 'Ingeniería de Sistemas',
  })
  programName!: string;

  @Prop({
    type: Number,
    default: 4,
  })
  semester!: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive!: boolean;

  @Prop({
    type: Number,
    default: 1,
  })
  order!: number;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);

SubjectSchema.index({ code: 1 }, { unique: true });
SubjectSchema.index({ isActive: 1, order: 1 });
