import { User } from '@prisma/client';
import {
  PaginationMeta,
  PaginationParams,
} from 'src/common/classes/pagination';

export class GetUsersDto extends PaginationParams {}

export class GetUsersResponse {
  items: User[];
  meta: PaginationMeta;
}
