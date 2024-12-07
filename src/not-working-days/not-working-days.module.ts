import { Module } from '@nestjs/common';
import { NotWorkingDaysService } from './not-working-days.service';
import { NotWorkingDaysController } from './not-working-days.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [NotWorkingDaysController],
  providers: [NotWorkingDaysService],
  exports: [NotWorkingDaysService],
  imports: [DatabaseModule],
})
export class NotWorkingDaysModule {}
