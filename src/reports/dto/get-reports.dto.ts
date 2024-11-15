import { SupportRequest } from '@prisma/client';
import {
  PaginationMeta,
  PaginationParams,
} from 'src/common/classes/pagination';

export class GetReportsDto extends PaginationParams {}

export class GetReportsResponse {
  items: SupportRequest[];
  meta: PaginationMeta;
}
