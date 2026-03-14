import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../common/enums/role.enum';

class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  institutionalEmail!: string;

  @ApiProperty({ enum: Role })
  role!: Role;
}

class StudentProfileResponseDto {
  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  program!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: StudentProfileResponseDto, required: false })
  profile?: StudentProfileResponseDto;
}
