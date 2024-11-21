import { Module } from '@nestjs/common';
import { WorkingSheduleService } from './working-shedule.service';
import { WorkingSheduleController } from './working-shedule.controller';

@Module({
  controllers: [WorkingSheduleController],
  providers: [WorkingSheduleService],
})
export class WorkingSheduleModule {}
