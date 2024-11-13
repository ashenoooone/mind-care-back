import { ApiPropertyOptional } from '@nestjs/swagger';
import { Service } from '@prisma/client';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { PaginationMeta } from 'src/common/types';

export class GetServicesDto {
  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class GetServicesReturnDto {
  @ApiPropertyOptional()
  items: Service[];
  @ApiPropertyOptional()
  meta: PaginationMeta;
}
