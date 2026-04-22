import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SubmitPracticeAnswerDto {
  @ApiProperty()
  @IsMongoId()
  questionId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  selectedAnswer!: string;
}

export class SubmitPracticeAttemptDto {
  @ApiProperty({ type: [SubmitPracticeAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitPracticeAnswerDto)
  answers!: SubmitPracticeAnswerDto[];

  @ApiProperty({ example: 900 })
  @IsInt()
  @Min(0)
  durationSeconds!: number;
}
