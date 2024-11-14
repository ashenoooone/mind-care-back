import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Telegram ID пользователя' })
  @IsInt()
  telegramId: number;

  @ApiProperty({ description: 'Nickname' })
  @IsString()
  @IsOptional()
  tgNick: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Номер пользователя' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Часовой пояс пользователя' })
  @IsInt()
  timezone: number;
}
