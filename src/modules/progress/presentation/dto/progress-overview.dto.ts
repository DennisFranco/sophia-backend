import { ApiProperty } from '@nestjs/swagger';

export class ProgressOverviewDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  subjectId!: string;

  @ApiProperty()
  overallProgressPercent!: number;

  @ApiProperty()
  completedTopics!: number;

  @ApiProperty()
  totalTopics!: number;

  @ApiProperty()
  totalStudyTimeSeconds!: number;

  @ApiProperty()
  currentStreakDays!: number;

  @ApiProperty()
  longestStreakDays!: number;

  @ApiProperty({ required: false })
  lastStudyDate?: Date;
}
