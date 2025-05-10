import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { GetAppointmentsDto } from './dto/get-appointments.dto';
import { GetCalendarDto } from './dto/get-calendar';
import { AppointmentStatus } from '@prisma/client';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockAppointmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getCalendar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: mockAppointmentsService,
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен создать новую запись', async () => {
      const createDto: CreateAppointmentDto = {
        clientId: 1,
        serviceId: 1,
        date: new Date(),
      };

      const expectedResult = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockAppointmentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('должен вернуть список записей с пагинацией', async () => {
      const queryDto: GetAppointmentsDto = {
        page: 0,
        limit: 10,
      };

      const expectedResult = {
        meta: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 0,
          nextPage: 0,
          prevPage: 0,
        },
        items: [
          {
            id: 1,
            status: AppointmentStatus.SCHEDULED,
            clientId: 1,
            serviceId: 1,
            startTime: new Date(),
            endTime: new Date(),
          },
        ],
      };

      mockAppointmentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('должен вернуть одну запись по id', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockAppointmentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('должен обновить запись', async () => {
      const id = '1';
      const updateDto: UpdateAppointmentDto = {
        id: 1,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: AppointmentStatus.COMPLETED,
      };

      const expectedResult = {
        id: 1,
        status: AppointmentStatus.COMPLETED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockAppointmentsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('должен удалить запись', async () => {
      const id = '1';
      const expectedResult = {
        id: 1,
        status: AppointmentStatus.SCHEDULED,
        clientId: 1,
        serviceId: 1,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockAppointmentsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getCalendar', () => {
    it('должен вернуть календарь записей', async () => {
      const queryDto: GetCalendarDto = {
        dateFrom: '2024-03-01',
        dateTo: '2024-03-31',
      };

      const expectedResult = {
        items: [
          {
            date: new Date(),
            appointments: [
              {
                id: 1,
                status: AppointmentStatus.SCHEDULED,
                startTime: new Date(),
                endTime: new Date(),
              },
            ],
          },
        ],
      };

      mockAppointmentsService.getCalendar.mockResolvedValue(expectedResult);

      const result = await controller.getCalendar(queryDto);
      expect(result).toEqual(expectedResult);
      expect(service.getCalendar).toHaveBeenCalledWith(queryDto);
    });
  });
});
