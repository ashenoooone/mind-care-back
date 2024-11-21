import { Module } from '@nestjs/common';
import { WorkingSheduleService } from './working-shedule.service';
import { WorkingSheduleController } from './working-shedule.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [WorkingSheduleController],
  providers: [WorkingSheduleService],
  imports: [DatabaseModule],
})
export class WorkingSheduleModule {}
