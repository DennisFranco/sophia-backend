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
}
