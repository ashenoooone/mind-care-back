import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import {
  PaginationMeta,
  PaginationParams,
} from 'src/common/classes/pagination';

export class GetUsersDto extends PaginationParams {
  @ApiProperty()
  name?: string;
}

export class GetUsersResponse {
  items: User[];
  meta: PaginationMeta;
}
