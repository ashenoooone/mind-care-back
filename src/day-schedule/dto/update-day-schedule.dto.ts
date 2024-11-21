import { PartialType } from '@nestjs/swagger';
import { CreateDayScheduleDto } from './create-day-schedule.dto';

export class UpdateDayScheduleDto extends PartialType(CreateDayScheduleDto) {}
