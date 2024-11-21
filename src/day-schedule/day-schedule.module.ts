import { Module } from '@nestjs/common';
import { DayScheduleService } from './day-schedule.service';
import { DayScheduleController } from './day-schedule.controller';

@Module({
  controllers: [DayScheduleController],
  providers: [DayScheduleService],
})
export class DayScheduleModule {}
