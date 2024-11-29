import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { GetAppointmentsMetricDto } from './dto/get-appointments-metric.dto';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { isAfter } from 'date-fns';

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
}
