import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { GetAppointmentsMetricDto } from './dto/get-appointments-metric.dto';
import { GetMetricDto } from './dto/get-metric.dto';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('/appointments')
  getAppointments(@Query() params: GetAppointmentsMetricDto) {
    return this.metricsService.getAppointmentsMetrics(params);
  }

  @Get('/reports')
  async getAllReports(@Query() params: GetAppointmentsMetricDto) {
    const [
      averageDuration,
      mostPopularService,
      busiestTime,
      uniqueClients,
      averageAppointmentCost,
      appointmentsByWeekday,
      topCancelingClients,
      averageDailyLoad,
    ] = await Promise.all([
      this.metricsService.getAverageDuration(params),
      this.metricsService.getMostPopularService(params),
      this.metricsService.getBusiestTime(params),
      this.metricsService.getUniqueClients(params),
      this.metricsService.getAverageAppointmentCost(params),
      this.metricsService.getAppointmentsByWeekday(params),
      this.metricsService.getTopCancelingClients(params),
      this.metricsService.getAverageDailyLoad(params),
    ]);

    return {
      averageDuration,
      mostPopularService,
      busiestTime,
      uniqueClients,
      averageAppointmentCost,
      appointmentsByWeekday,
      topCancelingClients,
      averageDailyLoad,
    };
  }

  @Get('/revenue-by-service')
  getRevenueShareByService(@Query() params: GetMetricDto) {
    return this.metricsService.getRevenueShareByService(params);
  }

  @Get('/unique-clients-over-time')
  getUniqueClientsOverTime(
    @Query() params: GetMetricDto,
    @Query('interval') interval: 'week' | 'month' = 'month',
  ) {
    return this.metricsService.getUniqueClientsOverTime(params, interval);
  }

  @Get('/cancellation-trends')
  getCancellationTrends(
    @Query() params: GetMetricDto,
    @Query('interval') interval: 'day' | 'week' = 'day',
  ) {
    return this.metricsService.getCancellationTrends(params, interval);
  }

  @Get('/daily-load')
  getDailyLoad(@Query() params: GetMetricDto) {
    return this.metricsService.getDailyLoad(params);
  }

  @Get('/top-cancelling-clients')
  getTopCancellingClients(@Query() params: GetMetricDto) {
    return this.metricsService.getTopCancellingClients(params);
  }

  @Get('/revenue-over-time')
  getRevenueOverTime(
    @Query() params: GetMetricDto,
    @Query('interval') interval: 'day' | 'week' = 'week',
  ) {
    return this.metricsService.getRevenueOverTime(params, interval);
  }
}
