import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Имя пользователя', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Часовой пояс пользователя', required: false })
  @IsOptional()
  @IsInt()
  timezone?: number;

  @ApiProperty({ description: 'Номер телефона пользователя', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
