import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'dennis@unicatolica.edu.co',
  })
  @IsEmail()
  institutionalEmail!: string;

  @ApiProperty({
    example: '2024123456',
  })
  @IsString()
  @MinLength(4)
  internalCode!: string;

  @ApiProperty({
    example: 'ios',
    required: false,
  })
  @IsOptional()
  @IsString()
  devicePlatform?: string;

  @ApiProperty({
    example: '1.0.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiProperty({
    example: 'iPhone 15',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceName?: string;
}
