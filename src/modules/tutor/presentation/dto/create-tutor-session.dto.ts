import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTutorSessionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  topicId?: string;

  @ApiProperty({ required: false, maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
