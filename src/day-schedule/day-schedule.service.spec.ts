import { Test, TestingModule } from '@nestjs/testing';
import { DayScheduleService } from './day-schedule.service';
import { DatabaseService } from 'src/database/database.service';
import { BadRequestException } from '@nestjs/common';
import { addHours, addMinutes } from 'date-fns';

describe('DayScheduleService', () => {
  let service: DayScheduleService;

  const mockDbService = {
    daySchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workingSchedule: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
    },
    service: {
      findFirst: jest.fn(),
    },
    nonWorkingDay: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DayScheduleService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<DayScheduleService>(DayScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDaySchedule', () => {
    it('должен вернуть время начала рабочего дня, если нет записей', async () => {
      const testDate = new Date('2024-03-20');
      const mockWorkingDay = { startHour: 9, endHour: 18 };

      mockDbService.workingSchedule.findFirst.mockResolvedValue(mockWorkingDay);
      mockDbService.appointment.findMany.mockResolvedValue([]);

      const result = await service.getDaySchedule(testDate);
      expect(result).toEqual(addHours(testDate, mockWorkingDay.startHour));
    });

    it('должен вернуть время через 10 минут после последней записи', async () => {
      const testDate = new Date('2024-03-20');
      const mockWorkingDay = { startHour: 9, endHour: 18 };
      const mockAppointment = {
        endTime: new Date('2024-03-20T14:00:00'),
      };

      mockDbService.workingSchedule.findFirst.mockResolvedValue(mockWorkingDay);
      mockDbService.appointment.findMany.mockResolvedValue([mockAppointment]);

      const result = await service.getDaySchedule(testDate);
      expect(result).toEqual(addMinutes(mockAppointment.endTime, 10));
    });

    it('должен выбросить BadRequestException, если день не рабочий', async () => {
      const testDate = new Date('2024-03-20');
      mockDbService.workingSchedule.findFirst.mockResolvedValue(null);

      await expect(service.getDaySchedule(testDate)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('должен создать новое расписание дня', async () => {
      const createDto = {
        date: new Date('2024-03-20'),
        startHour: 9,
        endHour: 18,
      };
      const expectedResult = { id: 1, ...createDto };

      mockDbService.daySchedule.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.daySchedule.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('должен вернуть все расписания дней', async () => {
      const expectedSchedules = [
        { id: 1, date: new Date(), startHour: 9, endHour: 18 },
        { id: 2, date: new Date(), startHour: 10, endHour: 19 },
      ];

      mockDbService.daySchedule.findMany.mockResolvedValue(expectedSchedules);

      const result = await service.findAll();
      expect(result).toEqual(expectedSchedules);
      expect(mockDbService.daySchedule.findMany).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('должен обновить расписание дня', async () => {
      const updateDto = {
        date: new Date('2024-03-20'),
        startHour: 10,
        endHour: 19,
      };
      const expectedResult = { id: 1, ...updateDto };

      mockDbService.daySchedule.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateDto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.daySchedule.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('должен удалить расписание дня', async () => {
      const expectedResult = {
        id: 1,
        date: new Date(),
        startHour: 9,
        endHour: 18,
      };

      mockDbService.daySchedule.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(1);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.daySchedule.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getAvailableDays', () => {
    it('должен вернуть доступные дни в указанном диапазоне', async () => {
      const params = {
        fromDate: '2024-03-20',
        toDate: '2024-03-25',
      };

      const mockService = { duration: 60 };
      const mockWorkingDays = [
        { dayOfWeek: 1, startHour: 9, endHour: 18 },
        { dayOfWeek: 2, startHour: 9, endHour: 18 },
      ];
      const mockAppointments = [];
      const mockHolidays = [];

      mockDbService.service.findFirst.mockResolvedValue(mockService);
      mockDbService.workingSchedule.findMany.mockResolvedValue(mockWorkingDays);
      mockDbService.appointment.findMany.mockResolvedValue(mockAppointments);
      mockDbService.nonWorkingDay.findMany.mockResolvedValue(mockHolidays);

      const result = await service.getAvailableDays(params);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
