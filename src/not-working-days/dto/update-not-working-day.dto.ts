import { PartialType } from '@nestjs/swagger';
import { CreateNotWorkingDayDto } from './create-not-working-day.dto';

export class UpdateNotWorkingDayDto extends PartialType(
  CreateNotWorkingDayDto,
) {}
