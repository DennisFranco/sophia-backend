import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TopicDocument = HydratedDocument<Topic>;

@Schema({
  collection: 'topics',
  timestamps: true,
  versionKey: false,
})
export class Topic {
  @Prop({
    type: Types.ObjectId,
    ref: 'Subject',
    required: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  slug!: string;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    trim: true,
  })
  shortDescription!: string;

  @Prop({
    trim: true,
  })
  contentSummary?: string;

  @Prop({
    required: true,
  })
  order!: number;

  @Prop({
    default: 90,
  })
  estimatedMinutes!: number;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);

TopicSchema.index({ subjectId: 1, slug: 1 }, { unique: true });
TopicSchema.index({ subjectId: 1, order: 1 });
TopicSchema.index({ isActive: 1 });
