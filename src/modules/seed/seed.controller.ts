import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('student')
  @ApiOperation({ summary: 'Seed development student user and profile' })
  async seedStudent() {
    return this.seedService.seedStudentUser();
  }

  @Post('physics-2')
  @ApiOperation({ summary: 'Seed Physics II subject and topics' })
  async seedPhysics2() {
    return this.seedService.seedPhysics2();
  }

  @Post('all')
  @ApiOperation({ summary: 'Seed student user, profile, subject and topics' })
  async seedAll() {
    return this.seedService.seedAll();
  }
}
