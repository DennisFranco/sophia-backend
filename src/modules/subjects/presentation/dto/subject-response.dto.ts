import { ApiProperty } from '@nestjs/swagger';

export class SubjectResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  institutionName!: string;

  @ApiProperty()
  programName!: string;

  @ApiProperty()
  semester!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  order!: number;
}
