import { ApiProperty } from '@nestjs/swagger';

export class TopicResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  subjectId!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  shortDescription!: string;

  @ApiProperty({ required: false })
  contentSummary?: string;

  @ApiProperty()
  order!: number;

  @ApiProperty()
  estimatedMinutes!: number;

  @ApiProperty()
  isActive!: boolean;
}
