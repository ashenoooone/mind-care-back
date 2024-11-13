import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'Название сервиса' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Описание сервиса', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Длительность сервиса в минутах' })
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiProperty({ description: 'Цена сервиса' })
  @IsNumber()
  @IsPositive()
  price: number;
}
