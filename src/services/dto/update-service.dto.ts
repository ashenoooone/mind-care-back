import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ description: 'Название сервиса', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Описание сервиса', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Длительность сервиса в минутах',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @ApiProperty({ description: 'Цена сервиса', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;
}
