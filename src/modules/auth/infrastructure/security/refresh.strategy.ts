import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  type JwtFromRequestFunction,
  type StrategyOptionsWithRequest,
} from 'passport-jwt';
import type { Request } from 'express';

import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import type { JwtPayload } from '../../../../common/interfaces/jwt-payload.interface';

function extractRefreshTokenFromBody(request: Request): string | null {
  const requestLike = request as unknown as { body?: unknown };
  const body = requestLike.body;

  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const bodyRecord = body as Record<string, unknown>;
  const refreshToken = bodyRecord['refreshToken'];

  return typeof refreshToken === 'string' ? refreshToken : null;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const refreshTokenExtractor: JwtFromRequestFunction = (
      request: Request,
    ): string | null => extractRefreshTokenFromBody(request);

    const secret = configService.get<string>('auth.jwtRefreshSecret');
    if (!secret) {
      throw new Error('auth.jwtRefreshSecret is not configured');
    }

    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([refreshTokenExtractor]),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    };

    super(options);
  }

  validate(_request: Request, payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
