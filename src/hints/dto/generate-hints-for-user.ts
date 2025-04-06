import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateHintsForUserDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}
