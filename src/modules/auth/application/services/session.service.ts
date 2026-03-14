import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BcryptPasswordHasherService } from '../../infrastructure/security/bcrypt-password-hasher.service';
import {
  UserSession,
  UserSessionDocument,
} from '../../infrastructure/persistence/schemas/user-session.schema';

interface CreateSessionInput {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
  deviceInfo?: {
    platform?: string;
    appVersion?: string;
    deviceName?: string;
  };
}

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(UserSession.name)
    private readonly userSessionModel: Model<UserSessionDocument>,
    private readonly passwordHasher: BcryptPasswordHasherService,
  ) {}

  async createSession(input: CreateSessionInput): Promise<UserSessionDocument> {
    const refreshTokenHash = await this.passwordHasher.hash(input.refreshToken);

    return this.userSessionModel.create({
      userId: new Types.ObjectId(input.userId),
      refreshTokenHash,
      expiresAt: input.expiresAt,
      ip: input.ip,
      userAgent: input.userAgent,
      deviceInfo: input.deviceInfo,
      isRevoked: false,
      lastUsedAt: new Date(),
    });
  }

  async validateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<UserSessionDocument> {
    const session = await this.userSessionModel.findById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const isValid = await this.passwordHasher.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return session;
  }

  async rotateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
    newExpiresAt: Date,
  ): Promise<void> {
    const refreshTokenHash = await this.passwordHasher.hash(newRefreshToken);

    await this.userSessionModel.findByIdAndUpdate(sessionId, {
      refreshTokenHash,
      expiresAt: newExpiresAt,
      lastUsedAt: new Date(),
      isRevoked: false,
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.userSessionModel.findByIdAndUpdate(sessionId, {
      isRevoked: true,
      lastUsedAt: new Date(),
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.userSessionModel.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { isRevoked: true, lastUsedAt: new Date() },
    );
  }
}
