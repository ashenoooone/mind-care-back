import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class PaginationMeta {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  prevPage: number;
}

export class PaginationParams {
  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
