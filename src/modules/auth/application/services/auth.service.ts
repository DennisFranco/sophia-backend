import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LoginDto } from '../../presentation/dto/login.dto';
import { AuthResponseDto } from '../../presentation/dto/auth-response.dto';
import {
  User,
  UserDocument,
  UserStatus,
} from '../../infrastructure/persistence/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '../../../users/infrastructure/persistence/schemas/student-profile.schema';
import { BcryptPasswordHasherService } from '../../infrastructure/security/bcrypt-password-hasher.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(StudentProfile.name)
    private readonly studentProfileModel: Model<StudentProfileDocument>,
    private readonly passwordHasher: BcryptPasswordHasherService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    dto: LoginDto,
    meta?: {
      ip?: string;
      userAgent?: string;
    },
  ): Promise<AuthResponseDto> {
    const email = dto.institutionalEmail.trim().toLowerCase();
    const internalCode = dto.internalCode.trim();

    const user = await this.userModel.findOne({
      institutionalEmail: email,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.internalCode !== internalCode) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('User is blocked');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('User is inactive');
    }

    const passwordMatches = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const refreshTokenExpiresAt = this.buildRefreshTokenExpirationDate();

    const provisionalSessionId = 'temp';
    const provisionalTokens = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.institutionalEmail,
      role: user.role,
      sessionId: provisionalSessionId,
    });

    const session = await this.sessionService.createSession({
      userId: user.id,
      refreshToken: provisionalTokens.refreshToken,
      expiresAt: refreshTokenExpiresAt,
      ip: meta?.ip,
      userAgent: meta?.userAgent,
      deviceInfo: {
        platform: dto.devicePlatform,
        appVersion: dto.appVersion,
        deviceName: dto.deviceName,
      },
    });

    const tokens = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.institutionalEmail,
      role: user.role,
      sessionId: session.id,
    });

    await this.sessionService.rotateRefreshToken(
      session.id,
      tokens.refreshToken,
      refreshTokenExpiresAt,
    );

    user.lastLoginAt = new Date();
    await user.save();

    const profile = await this.studentProfileModel.findOne({
      userId: user._id,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        institutionalEmail: user.institutionalEmail,
        role: user.role,
      },
      profile: profile
        ? {
            fullName: profile.fullName,
            program: profile.program,
          }
        : undefined,
    };
  }

  async refreshToken(
    payload: JwtPayload,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    const session = await this.sessionService.validateRefreshToken(
      payload.sessionId,
      refreshToken,
    );

    const user = await this.userModel.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('User is not active');
    }

    const newExpiresAt = this.buildRefreshTokenExpirationDate();

    const tokens = await this.tokenService.generateTokenPair({
      userId: user.id,
      email: user.institutionalEmail,
      role: user.role,
      sessionId: session.id,
    });

    await this.sessionService.rotateRefreshToken(
      session.id,
      tokens.refreshToken,
      newExpiresAt,
    );

    const profile = await this.studentProfileModel.findOne({
      userId: user._id,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        institutionalEmail: user.institutionalEmail,
        role: user.role,
      },
      profile: profile
        ? {
            fullName: profile.fullName,
            program: profile.program,
          }
        : undefined,
    };
  }

  async logout(
    sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.sessionService.revokeSession(sessionId);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async getMe(userId: string): Promise<{
    id: string;
    institutionalEmail: string;
    role: string;
    profile?: {
      fullName: string;
      program: string;
      semester?: number;
    };
  }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const profile = await this.studentProfileModel.findOne({
      userId: user._id,
    });

    return {
      id: user.id,
      institutionalEmail: user.institutionalEmail,
      role: user.role,
      profile: profile
        ? {
            fullName: profile.fullName,
            program: profile.program,
            semester: profile.semester,
          }
        : undefined,
    };
  }

  private buildRefreshTokenExpirationDate(): Date {
    const refreshExpiresIn = this.configService.get<string>(
      'auth.jwtRefreshExpiresIn',
      '7d',
    );

    const now = new Date();

    if (refreshExpiresIn.endsWith('d')) {
      const days = Number(refreshExpiresIn.replace('d', ''));
      now.setDate(now.getDate() + days);
      return now;
    }

    if (refreshExpiresIn.endsWith('h')) {
      const hours = Number(refreshExpiresIn.replace('h', ''));
      now.setHours(now.getHours() + hours);
      return now;
    }

    now.setDate(now.getDate() + 7);
    return now;
  }
}
