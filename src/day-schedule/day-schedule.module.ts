import { Module } from '@nestjs/common';
import { DayScheduleService } from './day-schedule.service';
import { DayScheduleController } from './day-schedule.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [DayScheduleController],
  providers: [DayScheduleService],
  imports: [DatabaseModule],
})
export class DayScheduleModule {}
