import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      success: true,
      message: 'SOPHIA backend is running',
      timestamp: new Date().toISOString(),
    };
  }
}
