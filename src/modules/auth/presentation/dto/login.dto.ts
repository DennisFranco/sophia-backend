import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

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
    example: 'Sophia123*',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password!: string;

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
