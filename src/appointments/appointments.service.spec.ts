import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { DatabaseService } from 'src/database/database.service';
import { DayScheduleService } from 'src/day-schedule/day-schedule.service';
import { NotWorkingDaysService } from 'src/not-working-days/not-working-days.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { GetCalendarDto } from './dto/get-calendar';
import { AppointmentStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { addHours, addMinutes, startOfDay } from 'date-fns';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  const mockPrisma = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
  };

  const mockDayScheduleService = {
    getDayIfWorkDay: jest.fn(),
  };

  const mockNonWorkingService = {
    findByDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: DatabaseService,
          useValue: mockPrisma,
        },
        {
          provide: DayScheduleService,
          useValue: mockDayScheduleService,
        },
        {
          provide: NotWorkingDaysService,
          useValue: mockNonWorkingService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('должен создать новую запись', async () => {
      const createDto: CreateAppointmentDto = {
        clientId: 1,
        serviceId: 1,
        date: new Date(),
      };

      const mockClient = {
        id: 1,
        telegramId: '123',
      };

      const mockService = {
        id: 1,
        duration: 60,
      };

      const mockDaySchedule = {
        startHour: 9,
        endHour: 18,
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockClient);
      mockPrisma.service.findUnique.mockResolvedValue(mockService);
      mockDayScheduleService.getDayIfWorkDay.mockResolvedValue(mockDaySchedule);
      mockNonWorkingService.findByDate.mockResolvedValue(null);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const expectedAppointment = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: addHours(
          startOfDay(createDto.date),
          mockDaySchedule.startHour,
        ),
        endTime: addMinutes(
          addHours(startOfDay(createDto.date), mockDaySchedule.startHour),
          mockService.duration,
        ),
      };

      mockPrisma.appointment.create.mockResolvedValue(expectedAppointment);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedAppointment);
    });

    it('должен выбросить ошибку, если услуга не найдена', async () => {
      const createDto: CreateAppointmentDto = {
        clientId: 1,
        serviceId: 1,
        date: new Date(),
      };

      mockPrisma.service.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException('no such service'),
      );
    });

    it('должен выбросить ошибку, если день не рабочий', async () => {
      const createDto: CreateAppointmentDto = {
        clientId: 1,
        serviceId: 1,
        date: new Date(),
      };

      mockPrisma.service.findUnique.mockResolvedValue({ id: 1, duration: 60 });
      mockDayScheduleService.getDayIfWorkDay.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('no such day'),
      );
    });
  });

  describe('findAll', () => {
    it('должен вернуть список записей с пагинацией', async () => {
      const params: GetAppointmentsDto = {
        page: 0,
        limit: 10,
      };

      const mockAppointments = [
        {
          id: 1,
          status: AppointmentStatus.SCHEDULED,
          clientId: 1,
          serviceId: 1,
          startTime: new Date(),
          endTime: new Date(),
          client: { id: 1, name: 'Test Client' },
          service: { id: 1, name: 'Test Service' },
        },
      ];

      mockPrisma.appointment.count.mockResolvedValue(1);
      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments);

      const expectedResult = {
        meta: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 0,
          nextPage: 0,
          prevPage: 0,
        },
        items: mockAppointments,
      };

      const result = await service.findAll(params);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('должен вернуть одну запись по id', async () => {
      const id = 1;
      const mockAppointment = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
        client: { id: 1, name: 'Test Client' },
        service: { id: 1, name: 'Test Service' },
      };

      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await service.findOne(id);
      expect(result).toEqual(mockAppointment);
    });

    it('должен выбросить ошибку, если запись не найдена', async () => {
      const id = 1;
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(
        new NotFoundException(`Appointment with ID ${id} not found`),
      );
    });
  });

  describe('update', () => {
    it('должен обновить запись', async () => {
      const id = 1;
      const updateDto: UpdateAppointmentDto = {
        id: 1,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: AppointmentStatus.COMPLETED,
      };

      const expectedAppointment = {
        id: 1,
        ...updateDto,
      };

      mockPrisma.appointment.update.mockResolvedValue(expectedAppointment);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(expectedAppointment);
    });
  });

  describe('remove', () => {
    it('должен удалить запись', async () => {
      const id = 1;
      const mockAppointment = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);
      mockPrisma.appointment.delete.mockResolvedValue(mockAppointment);

      const result = await service.remove(id);
      expect(result).toEqual(mockAppointment);
    });

    it('должен выбросить ошибку, если запись не найдена', async () => {
      const id = 1;
      mockPrisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(
        new NotFoundException(`Appointment with ID ${id} not found`),
      );
    });
  });

  describe('getCalendar', () => {
    it('должен вернуть календарь записей', async () => {
      const params: GetCalendarDto = {
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31',
      };

      const mockAppointments = [
        {
          id: 1,
          status: AppointmentStatus.SCHEDULED,
          startTime: new Date('2024-03-01T10:00:00'),
          endTime: new Date('2024-03-01T11:00:00'),
        },
      ];

      const expectedResult = {
        '2024-02-29T20:00:00.000Z': mockAppointments,
        '2024-03-03T20:00:00.000Z': [],
        '2024-03-04T20:00:00.000Z': [],
        '2024-03-05T20:00:00.000Z': [],
        '2024-03-06T20:00:00.000Z': [],
        '2024-03-07T20:00:00.000Z': [],
        '2024-03-10T20:00:00.000Z': [],
        '2024-03-11T20:00:00.000Z': [],
        '2024-03-12T20:00:00.000Z': [],
        '2024-03-13T20:00:00.000Z': [],
        '2024-03-14T20:00:00.000Z': [],
        '2024-03-17T20:00:00.000Z': [],
        '2024-03-18T20:00:00.000Z': [],
        '2024-03-19T20:00:00.000Z': [],
        '2024-03-20T20:00:00.000Z': [],
        '2024-03-21T20:00:00.000Z': [],
        '2024-03-24T20:00:00.000Z': [],
        '2024-03-25T20:00:00.000Z': [],
        '2024-03-26T20:00:00.000Z': [],
        '2024-03-27T20:00:00.000Z': [],
        '2024-03-28T20:00:00.000Z': [],
      };

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await service.getCalendar(params);
      expect(result).toEqual(expectedResult);
    });
  });
});
