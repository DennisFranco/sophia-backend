import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import {
  User,
  UserSchema,
} from '../auth/infrastructure/persistence/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../users/infrastructure/persistence/schemas/student-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
