import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { TokenService } from './application/services/token.service';
import { SessionService } from './application/services/session.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { RefreshStrategy } from './infrastructure/security/refresh.strategy';
import { BcryptPasswordHasherService } from './infrastructure/security/bcrypt-password-hasher.service';
import {
  User,
  UserSchema,
} from './infrastructure/persistence/schemas/user.schema';
import {
  UserSession,
  UserSessionSchema,
} from './infrastructure/persistence/schemas/user-session.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../users/infrastructure/persistence/schemas/student-profile.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserSession.name, schema: UserSessionSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    SessionService,
    JwtStrategy,
    RefreshStrategy,
    BcryptPasswordHasherService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
