import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { DatabaseService } from 'src/database/database.service';
import { GetAppointmentsDto, SortDirection } from './dto/get-appointments.dto';
import { PaginationMeta } from 'src/common/classes/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: DatabaseService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { clientId, serviceId, startTime, endTime, status } =
      createAppointmentDto;

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
      },
    });

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
      filters.clientId = clientId;
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
      orderBy: {
        startTime: sortDirection,
      },
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
    const { clientId, serviceId, startTime, endTime, status } =
      updateAppointmentDto;

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        clientId,
        serviceId,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status,
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
}
