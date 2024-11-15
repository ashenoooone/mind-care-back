import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [DatabaseModule],
})
export class ReportsModule {}
