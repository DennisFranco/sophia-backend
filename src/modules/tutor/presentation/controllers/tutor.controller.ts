import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { TutorService } from '../../application/services/tutor.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { CreateTutorSessionDto } from '../dto/create-tutor-session.dto';
import { SendTutorMessageDto } from '../dto/send-tutor-message.dto';

@ApiTags('Tutor')
@Controller('tutor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create tutor session' })
  async createSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTutorSessionDto,
  ) {
    return this.tutorService.createSession(user.userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List tutor sessions' })
  async listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.tutorService.listSessions(user.userId);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get tutor message history' })
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.tutorService.getMessages(user.userId, sessionId);
  }

  @Post('sessions/:sessionId/messages')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Send message to tutor and persist conversation' })
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendTutorMessageDto,
  ) {
    return this.tutorService.sendMessage(user.userId, sessionId, dto.message);
  }
}
