import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/password-hasher.interface';

@Injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
  constructor(private readonly configService: ConfigService) {}

  async hash(value: string): Promise<string> {
    const rounds = this.configService.get<number>('auth.bcryptSaltRounds', 10);
    return bcrypt.hash(value, rounds);
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
