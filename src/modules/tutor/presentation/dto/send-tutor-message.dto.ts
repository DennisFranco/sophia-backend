import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SendTutorMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(4000)
  message!: string;
}
