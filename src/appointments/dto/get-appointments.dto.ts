import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { PaginationParams } from 'src/common/classes/pagination';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAppointmentsDto extends PaginationParams {
  @ApiPropertyOptional({
    description: 'Направление сортировки (по умолчанию DESC)',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({
    description: 'ID клиента для фильтрации записей',
  })
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @ApiPropertyOptional({
    description: 'ID услуги для фильтрации записей',
  })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiPropertyOptional({
    description: 'Фильтрация записей по конкретной дате',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Начало диапазона дат для фильтрации',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Конец диапазона дат для фильтрации',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
