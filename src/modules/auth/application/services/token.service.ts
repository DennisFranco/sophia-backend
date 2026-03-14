import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

import { Role } from '../../../../common/enums/role.enum';
import type { JwtPayload } from '../../../../common/interfaces/jwt-payload.interface';

interface GenerateTokensInput {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(input: GenerateTokensInput): Promise<string> {
    const payload: JwtPayload = {
      sub: input.userId,
      email: input.email,
      role: input.role,
      sessionId: input.sessionId,
    };

    const secret = this.configService.get<string>('auth.jwtAccessSecret');
    if (!secret) {
      throw new Error('auth.jwtAccessSecret is not configured');
    }

    const expiresIn = this.configService.get<SignOptions['expiresIn']>(
      'auth.jwtAccessExpiresIn',
      '15m',
    );

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async generateRefreshToken(input: GenerateTokensInput): Promise<string> {
    const payload: JwtPayload = {
      sub: input.userId,
      email: input.email,
      role: input.role,
      sessionId: input.sessionId,
    };

    const secret = this.configService.get<string>('auth.jwtRefreshSecret');
    if (!secret) {
      throw new Error('auth.jwtRefreshSecret is not configured');
    }

    const expiresIn = this.configService.get<SignOptions['expiresIn']>(
      'auth.jwtRefreshExpiresIn',
      '7d',
    );

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async generateTokenPair(input: GenerateTokensInput): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(input),
      this.generateRefreshToken(input),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
