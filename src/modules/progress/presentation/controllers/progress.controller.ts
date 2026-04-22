import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProgressService } from '../../application/services/progress.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('subjects/:subjectId/overview')
  @ApiOperation({ summary: 'Get progress overview for a subject' })
  async getOverview(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subjectId') subjectId: string,
  ) {
    await this.progressService.ensureInitialProgressForUser(user.userId);
    return this.progressService.recalculateUserStats(user.userId, subjectId);
  }

  @Get('subjects/:subjectId/topics')
  @ApiOperation({ summary: 'Get topic progress list for a subject' })
  async getTopicProgressList(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subjectId') subjectId: string,
  ) {
    await this.progressService.ensureInitialProgressForUser(user.userId);

    const items = await this.progressService.getTopicProgressByUser(
      user.userId,
    );

    return items.filter((item) => item.subjectId.toString() === subjectId);
  }

  @Patch('subjects/:subjectId/topics/:topicId')
  @ApiOperation({
    summary: 'Update topic progress manually for development/MVP',
  })
  async updateTopicProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subjectId') subjectId: string,
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
    const result = await this.progressService.updateTopicProgress(
      user.userId,
      topicId,
      body,
    );

    if (result.subjectId.toString() !== subjectId) {
      return {
        warning:
          'Topic updated, but subjectId in path does not match topic subjectId',
        progress: result,
      };
    }

    return result;
  }
}
