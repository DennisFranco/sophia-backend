import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { PracticeService } from '../../application/services/practice.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../common/interfaces/authenticated-user.interface';
import { PracticeDifficulty } from '../../../../common/enums/practice-difficulty.enum';
import { StartPracticeDto } from '../../presentation/dto/start-practice.dto';
import { SubmitPracticeAttemptDto } from '../../presentation/dto/submit-practice-attempt.dto';

@ApiTags('Practice')
@Controller('practice')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('sets')
  @ApiOperation({ summary: 'Get practice sets' })
  @ApiQuery({ name: 'topicId', required: false })
  @ApiQuery({ name: 'difficulty', required: false, enum: PracticeDifficulty })
  async getPracticeSets(
    @Query('topicId') topicId?: string,
    @Query('difficulty') difficulty?: PracticeDifficulty,
  ) {
    return this.practiceService.getPracticeSets(topicId, difficulty);
  }

  @Get('sets/recommended/:topicId')
  @ApiOperation({ summary: 'Get recommended practice set by topic' })
  async getRecommendedPractice(@Param('topicId') topicId: string) {
    return this.practiceService.getRecommendedPractice(topicId);
  }

  @Post('attempts')
  @ApiOperation({ summary: 'Start practice attempt' })
  async startPractice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartPracticeDto,
  ) {
    return this.practiceService.startPractice(user.userId, dto.practiceSetId);
  }

  @Post('attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit practice attempt' })
  async submitAttempt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitPracticeAttemptDto,
  ) {
    return this.practiceService.submitAttempt(user.userId, attemptId, dto);
  }

  @Patch('attempts/:attemptId/abandon')
  @ApiOperation({ summary: 'Abandon started practice attempt' })
  async abandonAttempt(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId') attemptId: string,
  ) {
    return this.practiceService.abandonAttempt(user.userId, attemptId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get practice attempt history' })
  async getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.practiceService.getHistory(user.userId);
  }

  @Get('attempts/:attemptId')
  @ApiOperation({ summary: 'Get practice attempt detail by id' })
  async getAttemptById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('attemptId') attemptId: string,
  ) {
    return this.practiceService.getAttemptById(user.userId, attemptId);
  }
}
