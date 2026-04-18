import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Subject,
  SubjectDocument,
} from '../../infrastructure/persistence/schemas/subject.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
  ) {}

  async findAll(): Promise<SubjectDocument[]> {
    return this.subjectModel.find().sort({ order: 1 }).exec();
  }

  async findById(subjectId: string): Promise<SubjectDocument> {
    const subject = await this.subjectModel.findById(subjectId).exec();

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async findActiveSubject(): Promise<SubjectDocument | null> {
    return this.subjectModel
      .findOne({ isActive: true })
      .sort({ order: 1 })
      .exec();
  }
}
