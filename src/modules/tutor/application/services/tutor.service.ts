import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { AiProvider } from '../../../../infrastructure/ai/providers/ai-provider.interface';
import { buildTutorSystemInstruction } from '../../../../infrastructure/ai/prompts/prompt-builder';
import {
  TutorSession,
  TutorSessionStatus,
} from '../../../tutor/infrastructure/persistence/schemas/tutor-session.schema';
import {
  TutorMessage,
} from '../../../tutor/infrastructure/persistence/schemas/tutor-message.schema';
import {
  Topic,
  TopicDocument,
} from '../../../topics/infrastructure/persistence/schemas/topic.schema';
import {
  Subject,
} from '../../../subjects/infrastructure/persistence/schemas/subject.schema';
import { TutorMessageRole } from '../../../../common/enums/tutor-message-role.enum';

@Injectable()
export class TutorService {
  constructor(
    @Inject('AI_PROVIDER')
    private readonly aiProvider: AiProvider,
    @InjectModel(TutorSession.name)
    private readonly tutorSessionModel: Model<TutorSession>,
    @InjectModel(TutorMessage.name)
    private readonly tutorMessageModel: Model<TutorMessage>,
    @InjectModel(Topic.name)
    private readonly topicModel: Model<Topic>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<Subject>,
  ) {}

  async createSession(
    userId: string,
    input: {
      subjectId?: string;
      topicId?: string;
      title?: string;
    },
  ) {
    const session = await this.tutorSessionModel.create({
      userId: new Types.ObjectId(userId),
      subjectId: input.subjectId
        ? new Types.ObjectId(input.subjectId)
        : undefined,
      topicId: input.topicId ? new Types.ObjectId(input.topicId) : undefined,
      title: input.title,
      status: TutorSessionStatus.ACTIVE,
      lastMessageAt: new Date(),
      messageCount: 0,
      provider: 'gemini',
    });

    return session;
  }

  async listSessions(userId: string) {
    return this.tutorSessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(userId: string, sessionId: string) {
    await this.ensureSessionOwnership(userId, sessionId);

    return this.tutorMessageModel
      .find({
        sessionId: new Types.ObjectId(sessionId),
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async sendMessage(userId: string, sessionId: string, message: string) {
    const session = await this.ensureSessionOwnership(userId, sessionId);

    if (session.status !== TutorSessionStatus.ACTIVE) {
      throw new BadRequestException('Tutor session is not active');
    }

    const [subject, topic, rawSubjectTopics, recentMessages] =
      await Promise.all([
        session.subjectId
          ? this.subjectModel.findById(session.subjectId).exec()
          : Promise.resolve(null),
        session.topicId
          ? this.topicModel.findById(session.topicId).exec()
          : Promise.resolve(null),
        session.subjectId
          ? this.topicModel
              .find({
                subjectId: session.subjectId,
                isActive: true,
              })
              .sort({ order: 1 })
              .exec()
          : Promise.resolve([] as TopicDocument[]),
        this.tutorMessageModel
          .find({ sessionId: session._id })
          .sort({ createdAt: 1 })
          .limit(12)
          .exec(),
      ]);

    const subjectTopics: TopicDocument[] = rawSubjectTopics;

    await this.tutorMessageModel.create({
      sessionId: session._id,
      userId: new Types.ObjectId(userId),
      role: TutorMessageRole.USER,
      content: message,
    });

    const history: Array<{ role: 'user' | 'model'; text: string }> =
      recentMessages.map((item) => ({
        role: item.role === TutorMessageRole.ASSISTANT ? 'model' : 'user',
        text: item.content,
      }));

    const allowedTopics = subjectTopics.map((item) => item.name);

    try {
      const aiResponse = await this.aiProvider.generateTutorResponse({
        systemInstruction: buildTutorSystemInstruction({
          subjectName: subject?.name,
          topicName: topic?.name,
          allowedTopics,
        }),
        userMessage: message,
        conversationHistory: history,
      });

      const assistantMessage = await this.tutorMessageModel.create({
        sessionId: session._id,
        userId: new Types.ObjectId(userId),
        role: TutorMessageRole.ASSISTANT,
        content: aiResponse.text,
        model: aiResponse.model,
        tokenUsage: {
          inputTokens: aiResponse.inputTokens,
          outputTokens: aiResponse.outputTokens,
          totalTokens: aiResponse.totalTokens,
        },
      });

      session.lastMessageAt = new Date();
      session.messageCount = session.messageCount + 2;
      await session.save();

      return {
        sessionId: session.id,
        reply: assistantMessage.content,
        usage: assistantMessage.tokenUsage,
        model: assistantMessage.model,
        fallbackUsed: aiResponse.fallbackUsed ?? false,
        ...(aiResponse.providerError
          ? { providerError: aiResponse.providerError }
          : {}),
        curriculumContext: {
          subject: subject?.name,
          topic: topic?.name,
          allowedTopicsCount: allowedTopics.length,
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown tutor service error';

      const assistantMessage = await this.tutorMessageModel.create({
        sessionId: session._id,
        userId: new Types.ObjectId(userId),
        role: TutorMessageRole.ASSISTANT,
        content:
          'No pude responder en este momento. Intenta reformular tu duda indicando el tema, qué entiendes y en qué paso te bloqueaste.',
        model: 'fallback:service-error',
        error: {
          code: 'TUTOR_SERVICE_ERROR',
          message: errorMessage,
        },
      });

      session.lastMessageAt = new Date();
      session.messageCount = session.messageCount + 2;
      await session.save();

      return {
        sessionId: session.id,
        reply: assistantMessage.content,
        usage: assistantMessage.tokenUsage,
        model: assistantMessage.model,
        fallbackUsed: true,
        curriculumContext: {
          subject: subject?.name,
          topic: topic?.name,
          allowedTopicsCount: allowedTopics.length,
        },
      };
    }
  }

  private async ensureSessionOwnership(userId: string, sessionId: string) {
    const session = await this.tutorSessionModel.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    });

    if (!session) {
      throw new NotFoundException('Tutor session not found');
    }

    return session;
  }
}
