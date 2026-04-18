import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubjectsService } from '../../application/services/subjects.service';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subjects' })
  async findAll() {
    return this.subjectsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active subject' })
  async findActive() {
    return this.subjectsService.findActiveSubject();
  }

  @Get(':subjectId')
  @ApiOperation({ summary: 'Get subject by id' })
  async findById(@Param('subjectId') subjectId: string) {
    return this.subjectsService.findById(subjectId);
  }
}
