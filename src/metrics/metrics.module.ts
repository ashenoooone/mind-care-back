import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  imports: [DatabaseModule],
})
export class MetricsModule {}
