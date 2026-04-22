import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class StartPracticeDto {
  @ApiProperty()
  @IsMongoId()
  practiceSetId!: string;
}
