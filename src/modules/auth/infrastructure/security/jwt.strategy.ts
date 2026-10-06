import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  type StrategyOptionsWithoutRequest,
} from 'passport-jwt';

import { SessionService } from '../../application/services/session.service';
import type { JwtPayload } from '../../../../common/interfaces/jwt-payload.interface';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    const secret = configService.get<string>('auth.jwtAccessSecret');

    if (!secret) {
      throw new Error('auth.jwtAccessSecret is not configured');
    }

    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    };

    super(options);
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    await this.sessionService.validateActiveSession(
      payload.sessionId,
      payload.sub,
    );

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
