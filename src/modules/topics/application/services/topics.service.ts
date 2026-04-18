import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Topic,
  TopicDocument,
} from '../../infrastructure/persistence/schemas/topic.schema';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topic.name)
    private readonly topicModel: Model<TopicDocument>,
  ) {}

  async findAll(subjectId?: string): Promise<TopicDocument[]> {
    const filter = subjectId ? { subjectId } : {};

    return this.topicModel.find(filter).sort({ order: 1 }).exec();
  }

  async findById(topicId: string): Promise<TopicDocument> {
    const topic = await this.topicModel.findById(topicId).exec();

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }
}
