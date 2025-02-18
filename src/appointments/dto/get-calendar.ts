import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetCalendarDto {
  @ApiProperty({
    description: 'Дата начала периода',
    example: '2024-01-17',
  })
  @IsDateString()
  @IsNotEmpty()
  dateFrom: string;

  @ApiProperty({
    description: 'Дата окончания периода',
    example: '2024-01-21',
  })
  @IsDateString()
  @IsNotEmpty()
  dateTo: string;
}
