import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { GetAppointmentsMetricDto } from './dto/get-appointments-metric.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('/appointments')
  getAppointments(@Query() params: GetAppointmentsMetricDto) {
    return this.metricsService.getAppointmentsMetrics(params);
  }
}
