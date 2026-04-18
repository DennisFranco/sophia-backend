import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProgressService } from '../../application/services/progress.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

@ApiTags('Progress')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get current user progress overview' })
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getOverview(user.userId);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get current user topic progress list' })
  async getTopicsProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.progressService.getTopicProgressByUser(user.userId);
  }

  @Patch('topics/:topicId')
  @ApiOperation({ summary: 'Update topic progress manually for MVP testing' })
  async updateTopicProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('topicId') topicId: string,
    @Body()
    body: {
      progressPercent: number;
      completedExercises?: number;
      totalExercises?: number;
      correctAnswers?: number;
      totalAnswered?: number;
      timeStudiedSeconds?: number;
    },
  ) {
    return this.progressService.updateTopicProgress(user.userId, topicId, body);
  }
}
