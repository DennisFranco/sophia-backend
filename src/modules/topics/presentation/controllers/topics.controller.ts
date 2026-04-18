import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TopicsService } from '../../application/services/topics.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all topics or filter by subjectId' })
  @ApiQuery({ name: 'subjectId', required: false })
  async findAll(@Query('subjectId') subjectId?: string) {
    return this.topicsService.findAll(subjectId);
  }

  @Get(':topicId')
  @ApiOperation({ summary: 'Get topic by id' })
  async findById(@Param('topicId') topicId: string) {
    return this.topicsService.findById(topicId);
  }
}
