import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { DatabaseService } from 'src/database/database.service';
import { GetAppointmentsDto, SortDirection } from './dto/get-appointments.dto';
import { PaginationMeta } from 'src/common/classes/pagination';
import { AppointmentStatus, Prisma } from '@prisma/client';
import {
  addDays,
  addHours,
  addMinutes,
  endOfDay,
  isAfter,
  startOfDay,
} from 'date-fns';
import { DayScheduleService } from 'src/day-schedule/day-schedule.service';
import { NotWorkingDaysService } from 'src/not-working-days/not-working-days.service';
import { getDay } from 'src/common/lib/get-day';
import { GetCalendarDto } from './dto/get-calendar';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly dayScheduleService: DayScheduleService,
    private readonly nonWorkingService: NotWorkingDaysService,
  ) {}

  async createAdminAppointment(
    createAppointmentDto: CreateAdminAppointmentDto,
  ) {
    const {
      clientId,
      serviceId,
      startTime,
      endTime,
      status = AppointmentStatus.SCHEDULED,
    } = createAppointmentDto;
    const client = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            id: clientId,
          },
          {
            telegramId: clientId,
          },
        ],
      },
    });

    if (!client) {
      throw new NotFoundException('no such client');
    }

    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new NotFoundException('no such service');
    }

    const daySchedule = await this.dayScheduleService.getDayIfWorkDay(
      getDay(startTime),
    );

    if (!daySchedule) {
      throw new BadRequestException('no such day');
    }

    const nonWorkingDay = await this.nonWorkingService.findByDate(startTime);
    if (nonWorkingDay) throw new BadRequestException('non working day');

    if (isAfter(endTime, addHours(startTime, daySchedule.endHour))) {
      throw new BadRequestException('end of day');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId,
        startTime,
        endTime,
        status,
      },
    });

    return appointment;
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { clientId, serviceId, date } = createAppointmentDto;
    const client = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            id: clientId,
          },
          {
            telegramId: clientId,
          },
        ],
      },
    });
    const lastAppointmentInDay = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay(date),
          lt: endOfDay(date),
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    const service = await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      throw new NotFoundException('no such service');
    }

    let appointment;
    const daySchedule = await this.dayScheduleService.getDayIfWorkDay(
      getDay(date),
    );

    if (!daySchedule) throw new BadRequestException('no such day');

    const nonWorkingDay = await this.nonWorkingService.findByDate(date);
    if (nonWorkingDay) throw new BadRequestException('non working day');

    if (!lastAppointmentInDay.length) {
      const startTime = addHours(startOfDay(date), daySchedule.startHour);
      const endTime = addMinutes(startTime, service.duration);
      if (isAfter(endTime, addHours(date, daySchedule.endHour))) {
        throw new BadRequestException('end of day');
      }
      appointment = await this.prisma.appointment.create({
        data: {
          status: AppointmentStatus.SCHEDULED,
          clientId: client.id,
          serviceId,
          startTime,
          endTime,
        },
      });
    } else {
      const startTime = addMinutes(lastAppointmentInDay[0].endTime, 10);
      const endTime = addMinutes(startTime, service.duration);
      if (isAfter(endTime, addHours(date, daySchedule.endHour))) {
        throw new BadRequestException('end of day');
      }
      appointment = await this.prisma.appointment.create({
        data: {
          status: AppointmentStatus.SCHEDULED,
          clientId: client.id,
          serviceId,
          startTime,
          endTime,
        },
      });
    }

    return appointment;
  }

  async findAll(params: GetAppointmentsDto) {
    const {
      page = 0,
      limit = 10,
      sortDirection = SortDirection.DESC,
      clientId,
      serviceId,
      date,
      dateFrom,
      dateTo,
    } = params;

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);
    const filters: Prisma.AppointmentWhereInput = {};

    if (clientId) {
      filters.OR = [
        { clientId: clientId },
        { client: { telegramId: clientId } },
      ];
    }

    if (serviceId) {
      filters.serviceId = serviceId;
    }

    if (date) {
      filters.startTime = {
        gte: new Date(date),
        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      };
    }

    if (dateFrom && dateTo) {
      filters.startTime = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      filters.startTime = {
        gte: new Date(dateFrom),
      };
    } else if (dateTo) {
      filters.startTime = {
        lte: new Date(dateTo),
      };
    }

    const skip = parsedPage * parsedLimit;

    const totalItems = await this.prisma.appointment.count({
      where: filters,
    });

    const appointments = await this.prisma.appointment.findMany({
      where: filters,
      orderBy: [{ startTime: sortDirection }, { id: 'asc' }],
      skip,
      take: parsedLimit,
      include: {
        client: true,
        service: true,
      },
    });

    const totalPages = Math.ceil(totalItems / parsedLimit);
    const currentPage = parsedPage;
    const nextPage =
      currentPage + 1 < totalPages ? currentPage + 1 : currentPage;
    const prevPage = currentPage > 0 ? currentPage - 1 : currentPage;

    const meta: PaginationMeta = {
      totalItems,
      totalPages,
      currentPage,
      nextPage,
      prevPage,
    };

    return { meta, items: appointments };
  }

  async findOne(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const { clientId, serviceId, startTime, endTime, status, note } =
      updateAppointmentDto;

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        clientId,
        serviceId,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status,
        note,
      },
    });

    return updatedAppointment;
  }

  async remove(id: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return await this.prisma.appointment.delete({
      where: { id },
    });
  }

  async getCalendar(params: GetCalendarDto) {
    const dateFrom = new Date(params.dateFrom);
    const dateTo = new Date(params.dateTo);

    if (isAfter(dateFrom, dateTo)) {
      throw new BadRequestException('Date from cannot be after date to');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startOfDay(dateFrom),
          lte: endOfDay(dateTo),
        },
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const appointmentsByDay = {};

    let currentDate = startOfDay(dateFrom);
    while (currentDate <= dateTo) {
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        appointmentsByDay[currentDate.toISOString()] = [];
      }
      currentDate = addDays(currentDate, 1);
    }

    appointments.forEach((appointment) => {
      const day = startOfDay(appointment.startTime).toISOString();
      if (!appointmentsByDay[day]) {
        // TODO: тут проверка это фикс последствий, по сути надо фиксить чтобы нельзя было записаться в день которого нет
        appointmentsByDay[day] = [];
      }
      appointmentsByDay[day].push(appointment);
    });

    return appointmentsByDay;
  }
}
