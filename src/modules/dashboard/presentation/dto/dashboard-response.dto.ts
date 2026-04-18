import { ApiProperty } from '@nestjs/swagger';

class DashboardSubjectDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

class DashboardTopicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  progressPercent!: number;

  @ApiProperty()
  status!: string;
}

class DashboardPracticeDto {
  @ApiProperty()
  label!: string;

  @ApiProperty({ required: false })
  topicId?: string;
}

class DashboardQuickActionDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  label!: string;
}

export class DashboardResponseDto {
  @ApiProperty()
  greeting!: string;

  @ApiProperty({ type: DashboardSubjectDto })
  currentSubject!: DashboardSubjectDto;

  @ApiProperty()
  overallProgressPercent!: number;

  @ApiProperty()
  currentStreakDays!: number;

  @ApiProperty({ type: DashboardTopicDto, required: false })
  recommendedTopic?: DashboardTopicDto;

  @ApiProperty({ type: DashboardPracticeDto, required: false })
  recommendedPractice?: DashboardPracticeDto;

  @ApiProperty({ type: [DashboardQuickActionDto] })
  quickActions!: DashboardQuickActionDto[];
}
