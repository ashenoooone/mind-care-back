import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Telegram ID пользователя' })
  @IsInt()
  telegramId: number;

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
