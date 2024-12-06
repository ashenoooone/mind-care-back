import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GetAppointmentsMetricDto } from './dto/get-appointments-metric.dto';
import { AppointmentStatus, Prisma, Service } from '@prisma/client';
import {
  endOfWeek,
  formatISO,
  isAfter,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

@Injectable()
export class MetricsService {
  constructor(private db: DatabaseService) {}

  async getAppointmentsMetrics(params: GetAppointmentsMetricDto) {
    const { dateFrom, dateTo, serviceId, clientId } = params;

    const filters: Prisma.AppointmentWhereInput = {};

    if (dateFrom) {
      filters.startTime = { gte: dateFrom };
    }
    if (dateTo) {
      filters.endTime = { lte: dateTo };
    }
    if (serviceId) {
      filters.serviceId = serviceId;
    }
    if (clientId) {
      filters.clientId = clientId;
    }

    const appointments = await this.db.appointment.findMany({
      where: filters,
      include: {
        service: true,
      },
    });

    const initialMetrics = {
      totalProfit: 0,
      totalLoss: 0,
      plannedProfit: 0,
      counts: {
        [AppointmentStatus.COMPLETED]: 0,
        [AppointmentStatus.CANCELLED]: 0,
        [AppointmentStatus.SCHEDULED]: 0,
      },
      totalMinutes: 0,
    };

    const metrics = appointments.reduce((acc, appointment) => {
      const { status, service, startTime, endTime } = appointment;

      if (status === AppointmentStatus.COMPLETED) {
        acc.totalProfit += service.price;
        acc.counts[AppointmentStatus.COMPLETED]++;
      } else if (status === AppointmentStatus.CANCELLED) {
        acc.totalLoss += service.price;
        acc.counts[AppointmentStatus.CANCELLED]++;
      } else if (status === AppointmentStatus.SCHEDULED) {
        acc.plannedProfit += service.price;
        acc.counts[AppointmentStatus.SCHEDULED]++;
      }

      if (isAfter(new Date(endTime), new Date(startTime))) {
        const duration =
          (new Date(endTime).getTime() - new Date(startTime).getTime()) /
          1000 /
          60;
        acc.totalMinutes += Math.floor(duration);
      }

      return acc;
    }, initialMetrics);

    const totalHours = Math.floor(metrics.totalMinutes / 60);
    const remainingMinutes = metrics.totalMinutes % 60;

    return {
      totalProfit: metrics.totalProfit,
      totalLoss: metrics.totalLoss,
      plannedProfit: metrics.plannedProfit,
      counts: metrics.counts,
      totalHours,
      totalMinutes: remainingMinutes,
    };
  }

  // 1. Средняя продолжительность записи
  async getAverageDuration(params: GetAppointmentsMetricDto): Promise<number> {
    const appointments = await this.getFilteredAppointments(
      params,
      AppointmentStatus.COMPLETED,
    );
    const totalDuration = appointments.reduce((sum, a) => {
      const duration =
        (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) /
        1000 /
        60; // minutes
      return sum + duration;
    }, 0);
    return appointments.length > 0 ? totalDuration / appointments.length : 0;
  }

  // 3. Самая популярная услуга
  async getMostPopularService(
    params: GetAppointmentsMetricDto,
  ): Promise<{ service: Service; count: number } | null> {
    const appointments = await this.getFilteredAppointments(params);

    const serviceCounts = appointments.reduce<Record<number, number>>(
      (acc, a) => {
        acc[a.serviceId] = (acc[a.serviceId] || 0) + 1;
        return acc;
      },
      {},
    );

    const mostPopular = Object.entries(serviceCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    if (!mostPopular) {
      return null;
    }

    const [serviceId, count] = mostPopular;

    const service = await this.getServiceById(+serviceId);

    if (!service) {
      return null;
    }

    return { service, count: +count };
  }

  private async getServiceById(serviceId: number): Promise<Service | null> {
    return await this.db.service.findUnique({ where: { id: serviceId } });
  }

  // 4. Самое загруженное время
  async getBusiestTime(
    params: GetAppointmentsMetricDto,
  ): Promise<{ time: string; count: number }[]> {
    const appointments = await this.getFilteredAppointments(params);

    const timeCounts = appointments.reduce<Record<number, number>>((acc, a) => {
      const hour = new Date(a.startTime).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(timeCounts)
      .map(([hour, count]) => ({
        time: `${hour}:00 - ${+hour + 1}:00`,
        count, // `count` теперь точно имеет тип `number`
      }))
      .sort((a, b) => b.count - a.count);
  }

  // 5. Количество уникальных клиентов
  async getUniqueClients(params: GetAppointmentsMetricDto): Promise<number> {
    const appointments = await this.getFilteredAppointments(params);
    const uniqueClientIds = new Set(appointments.map((a) => a.clientId));
    return uniqueClientIds.size;
  }

  // 6. Средняя стоимость записи
  async getAverageAppointmentCost(
    params: GetAppointmentsMetricDto,
  ): Promise<number> {
    const appointments = await this.getFilteredAppointments(
      params,
      AppointmentStatus.COMPLETED,
    );
    const totalCost = appointments.reduce((sum, a) => sum + a.service.price, 0);
    return appointments.length > 0 ? totalCost / appointments.length : 0;
  }

  // 8. Записи по дням недели
  async getAppointmentsByWeekday(
    params: GetAppointmentsMetricDto,
  ): Promise<Record<string, number>> {
    const appointments = await this.getFilteredAppointments(params);
    const weekdayCounts = appointments.reduce((acc, a) => {
      const weekday = new Date(a.startTime).toLocaleDateString('ru-RU', {
        weekday: 'long',
      });
      acc[weekday] = (acc[weekday] || 0) + 1;
      return acc;
    }, {});
    return weekdayCounts;
  }

  // 11. Процент отмен по клиентам
  async getTopCancelingClients(params: GetAppointmentsMetricDto) {
    const appointments = await this.getFilteredAppointments(
      params,
      AppointmentStatus.CANCELLED,
    );

    const clientCancelCounts = appointments.reduce<Record<number, number>>(
      (acc, a) => {
        acc[a.clientId] = (acc[a.clientId] || 0) + 1;
        return acc;
      },
      {},
    );

    const data = await Promise.all(
      Object.entries(clientCancelCounts)
        .map(([clientId, count]) => ({
          clientId: +clientId,
          cancelledCount: count,
        }))
        .sort((a, b) => b.cancelledCount - a.cancelledCount)
        .map(async ({ cancelledCount, clientId }) => {
          const client = await this.db.user.findUnique({
            where: {
              id: clientId,
            },
          });
          return {
            ...client,
            cancelledCount,
          };
        }),
    );

    return data;
  }

  // 15. Средняя загрузка за рабочий день
  async getAverageDailyLoad(params: GetAppointmentsMetricDto): Promise<number> {
    const appointments = await this.getFilteredAppointments(params);

    const dailyDurations = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        const day = startOfDay(new Date(a.startTime)).toISOString();
        const duration =
          (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) /
          1000 /
          60;
        acc[day] = (acc[day] || 0) + duration;
        return acc;
      },
      {},
    );

    const totalDays = Object.keys(dailyDurations).length;
    const totalDuration = Object.values(dailyDurations).reduce(
      (sum, duration) => sum + duration,
      0,
    );

    return totalDays > 0 ? totalDuration / totalDays : 0;
  }

  // Helper: Получение записей с фильтрацией по времени
  private async getFilteredAppointments(
    params: GetAppointmentsMetricDto,
    status?: AppointmentStatus,
  ) {
    return this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        ...(status ? { status } : {}),
      },
      include: {
        service: true,
        client: true,
      },
    });
  }

  // Helper: Построение фильтров по времени
  private buildDateFilters(params: GetAppointmentsMetricDto) {
    const { dateFrom, dateTo } = params;
    const filters: any = {};
    if (dateFrom) {
      filters.startTime = {
        ...filters.startTime,
        gte: parseISO(dateFrom.toISOString()),
      };
    }
    if (dateTo) {
      filters.endTime = {
        ...filters.endTime,
        lte: parseISO(dateTo.toISOString()),
      };
    }
    return filters;
  }

  // 13. Соотношение выручки по услугам
  async getRevenueShareByService(params: GetAppointmentsMetricDto): Promise<
    {
      serviceId: number;
      serviceName: string;
      revenue: number;
      percentage: number;
    }[]
  > {
    const appointments = await this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        status: AppointmentStatus.COMPLETED,
      },
      include: { service: true },
    });

    const totalRevenue = appointments.reduce(
      (sum, a) => sum + a.service.price,
      0,
    );
    const revenueByService = appointments.reduce<
      Record<number, { revenue: number; name: string }>
    >((acc, a) => {
      if (!acc[a.serviceId])
        acc[a.serviceId] = { revenue: 0, name: a.service.name };
      acc[a.serviceId].revenue += a.service.price;
      return acc;
    }, {});

    return Object.entries(revenueByService).map(
      ([serviceId, { revenue, name }]) => ({
        serviceId: +serviceId,
        serviceName: name,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }),
    );
  }

  // 12. Уникальные клиенты по времени
  async getUniqueClientsOverTime(
    params: GetAppointmentsMetricDto,
    interval: 'week' | 'month' = 'month',
  ): Promise<{ period: string; count: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: this.buildDateFilters(params),
    });

    const uniqueClients = appointments.reduce<Record<string, Set<number>>>(
      (acc, a) => {
        const period = formatISO(
          interval === 'week'
            ? startOfWeek(new Date(a.startTime))
            : startOfMonth(new Date(a.startTime)),
          { representation: 'date' },
        );
        if (!acc[period]) acc[period] = new Set();
        acc[period].add(a.clientId);
        return acc;
      },
      {},
    );

    return Object.entries(uniqueClients).map(([period, clientSet]) => ({
      period,
      count: clientSet.size,
    }));
  }

  // 11. Динамика отмен
  async getCancellationTrends(
    params: GetAppointmentsMetricDto,
    interval: 'day' | 'week' = 'day',
  ): Promise<{ period: string; count: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        status: AppointmentStatus.CANCELLED,
      },
    });

    const cancellationsByPeriod = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        const period = formatISO(
          interval === 'day'
            ? startOfDay(new Date(a.startTime))
            : startOfWeek(new Date(a.startTime)),
          { representation: 'date' },
        );
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(cancellationsByPeriod).map(([period, count]) => ({
      period,
      count,
    }));
  }

  // 9. Средняя загрузка рабочего дня
  async getDailyLoad(
    params: GetAppointmentsMetricDto,
  ): Promise<{ date: string; averageLoadMinutes: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: this.buildDateFilters(params),
    });

    const dailyLoads = appointments.reduce<
      Record<string, { totalMinutes: number; count: number }>
    >((acc, a) => {
      const date = startOfDay(new Date(a.startTime)).toISOString();
      const durationMinutes =
        (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) /
        1000 /
        60;
      if (!acc[date]) acc[date] = { totalMinutes: 0, count: 0 };
      acc[date].totalMinutes += durationMinutes;
      acc[date].count++;
      return acc;
    }, {});

    return Object.entries(dailyLoads).map(
      ([date, { totalMinutes, count }]) => ({
        date,
        averageLoadMinutes: count > 0 ? totalMinutes / count : 0,
      }),
    );
  }

  // 8. Отмены по клиентам
  async getTopCancellingClients(params: GetAppointmentsMetricDto) {
    const appointments = await this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        status: AppointmentStatus.CANCELLED,
      },
      include: {
        client: true,
      },
    });

    const cancellationsByClient = appointments.reduce<Record<number, number>>(
      (acc, a) => {
        acc[a.client.name] = (acc[a.client.name] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(cancellationsByClient)
      .map(([client, count]) => ({
        client,
        cancelledCount: count,
      }))
      .sort((a, b) => b.cancelledCount - a.cancelledCount)
      .slice(0, 10);
  }

  // 7. Средняя стоимость записи
  async getAverageCostByTime(
    params: GetAppointmentsMetricDto,
    interval: 'day' | 'week' = 'week',
  ): Promise<{ period: string; averageCost: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        service: true,
      },
    });

    const costsByPeriod = appointments.reduce<
      Record<string, { totalCost: number; count: number }>
    >((acc, a) => {
      let period: string;

      if (interval === 'day') {
        // Форматируем дату как начало дня
        period = formatISO(startOfDay(new Date(a.startTime)), {
          representation: 'date',
        });
      } else {
        // Форматируем дату как "начало недели - конец недели"
        const weekStart = startOfWeek(new Date(a.startTime));
        const weekEnd = endOfWeek(new Date(a.startTime));
        period = `${formatISO(weekStart, { representation: 'date' })} - ${formatISO(weekEnd, { representation: 'date' })}`;
      }

      if (!acc[period]) acc[period] = { totalCost: 0, count: 0 };
      acc[period].totalCost += a.service.price;
      acc[period].count++;
      return acc;
    }, {});

    return Object.entries(costsByPeriod).map(
      ([period, { totalCost, count }]) => ({
        period,
        averageCost: count > 0 ? totalCost / count : 0,
      }),
    );
  }

  // 6. Загруженность по дням недели
  async getLoadByWeekday(
    params: GetAppointmentsMetricDto,
  ): Promise<Record<string, Record<number, number>>> {
    const appointments = await this.db.appointment.findMany({
      where: this.buildDateFilters(params),
    });

    const loadByWeekday = appointments.reduce<
      Record<string, Record<number, number>>
    >((acc, a) => {
      const weekday = new Date(a.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const hour = new Date(a.startTime).getHours();
      if (!acc[weekday]) acc[weekday] = {};
      acc[weekday][hour] = (acc[weekday][hour] || 0) + 1;
      return acc;
    }, {});

    return loadByWeekday;
  }

  // 5. Процент записей по статусам
  async getStatusPercentage(
    params: GetAppointmentsMetricDto,
  ): Promise<{ status: AppointmentStatus; percentage: number }[]> {
    const totalAppointments = await this.db.appointment.count({
      where: this.buildDateFilters(params),
    });

    const countsByStatus = await Promise.all(
      Object.values(AppointmentStatus).map(async (status) => ({
        status,
        count: await this.db.appointment.count({
          where: {
            ...this.buildDateFilters(params),
            status,
          },
        }),
      })),
    );

    return countsByStatus.map(({ status, count }) => ({
      status,
      percentage: totalAppointments > 0 ? (count / totalAppointments) * 100 : 0,
    }));
  }

  // 4. Выручка по дням или неделям
  async getRevenueOverTime(
    params: GetAppointmentsMetricDto,
    interval: 'day' | 'week' = 'week',
  ): Promise<{ period: string; revenue: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: {
        ...this.buildDateFilters(params),
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        service: true,
      },
    });

    const revenueByPeriod = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        const period = formatISO(
          interval === 'day'
            ? startOfDay(new Date(a.startTime))
            : startOfWeek(new Date(a.startTime)),
          { representation: 'date' },
        );
        acc[period] = (acc[period] || 0) + a.service.price;
        return acc;
      },
      {},
    );

    return Object.entries(revenueByPeriod).map(([period, revenue]) => ({
      period,
      revenue,
    }));
  }

  // 3. Динамика количества записей
  async getAppointmentTrends(
    params: GetAppointmentsMetricDto,
    interval: 'day' | 'week' = 'day',
  ): Promise<{ period: string; count: number }[]> {
    const appointments = await this.db.appointment.findMany({
      where: this.buildDateFilters(params),
    });

    const countsByPeriod = appointments.reduce<Record<string, number>>(
      (acc, a) => {
        const period = formatISO(
          interval === 'day'
            ? startOfDay(new Date(a.startTime))
            : startOfWeek(new Date(a.startTime)),
          { representation: 'date' },
        );
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(countsByPeriod).map(([period, count]) => ({
      period,
      count,
    }));
  }
}
