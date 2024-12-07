import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { DatabaseModule } from 'src/database/database.module';
import { DayScheduleModule } from 'src/day-schedule/day-schedule.module';
import { NotWorkingDaysModule } from 'src/not-working-days/not-working-days.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [DatabaseModule, DayScheduleModule, NotWorkingDaysModule],
})
export class AppointmentsModule {}
