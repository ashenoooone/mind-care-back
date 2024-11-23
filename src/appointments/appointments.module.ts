import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [DatabaseModule],
})
export class AppointmentsModule {}
