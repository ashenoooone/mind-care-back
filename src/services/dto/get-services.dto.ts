import { ApiPropertyOptional } from '@nestjs/swagger';
import { Service } from '@prisma/client';
import {
  PaginationMeta,
  PaginationParams,
} from 'src/common/classes/pagination';

export class GetServicesDto extends PaginationParams {
  @ApiPropertyOptional()
  name?: string;
}

export class GetServicesReturnDto {
  @ApiPropertyOptional()
  items: Service[];
  @ApiPropertyOptional()
  meta: PaginationMeta;
}
