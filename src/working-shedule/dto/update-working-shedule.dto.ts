import { PartialType } from '@nestjs/swagger';
import { CreateWorkingScheduleDto } from './create-working-shedule.dto';

export class UpdateWorkingSheduleDto extends PartialType(
  CreateWorkingScheduleDto,
) {}
