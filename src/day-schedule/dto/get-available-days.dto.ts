import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GetAvailableDays {
  @ApiProperty({
    description: 'Начальная дата диапазона',
    example: '2024-11-21',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fromDate: string = new Date().toISOString().split('T')[0];

  @ApiProperty({
    description: 'Конечная дата диапазона',
    example: '2024-12-21',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  toDate: string = new Date(new Date().setMonth(new Date().getMonth() + 1))
    .toISOString()
    .split('T')[0];
}
