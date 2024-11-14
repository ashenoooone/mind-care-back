import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UUID } from 'crypto';

export class LoginDto {
  @ApiProperty()
  @IsString()
  login: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  token: UUID;
}
