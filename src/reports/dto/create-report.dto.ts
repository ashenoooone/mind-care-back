import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty()
  @IsString({ message: 'Описание обязательно и должно быть строкой.' })
  phone: string;

  @ApiProperty()
  @IsString({ message: 'Описание обязательно и должно быть строкой.' })
  text: string;
}
