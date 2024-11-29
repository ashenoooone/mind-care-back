import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class GetMetricDto {
  @ApiPropertyOptional({
    description: 'Дата начала периода (включительно)',
    example: '2024-11-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateFrom?: Date;

  @ApiPropertyOptional({
    description: 'Дата конца периода (включительно)',
    example: '2024-11-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  dateTo?: Date;
}
