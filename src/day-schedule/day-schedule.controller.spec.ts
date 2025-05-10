import { Test, TestingModule } from '@nestjs/testing';
import { DayScheduleController } from './day-schedule.controller';
import { DayScheduleService } from './day-schedule.service';

describe('DayScheduleController', () => {
  let controller: DayScheduleController;

  const mockDayScheduleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getDaySchedule: jest.fn(),
    getAvailableDays: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DayScheduleController],
      providers: [
        {
          provide: DayScheduleService,
          useValue: mockDayScheduleService,
        },
      ],
    }).compile();

    controller = module.get<DayScheduleController>(DayScheduleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создать новое расписание дня', async () => {
      const createDto = {
        date: new Date('2024-03-20'),
        startHour: 9,
        endHour: 18,
      };
      const expectedResult = { id: 1, ...createDto };

      mockDayScheduleService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(mockDayScheduleService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('должен вернуть все расписания дней', async () => {
      const expectedSchedules = [
        { id: 1, date: new Date(), startHour: 9, endHour: 18 },
        { id: 2, date: new Date(), startHour: 10, endHour: 19 },
      ];

      mockDayScheduleService.findAll.mockResolvedValue(expectedSchedules);

      const result = await controller.findAll();
      expect(result).toEqual(expectedSchedules);
      expect(mockDayScheduleService.findAll).toHaveBeenCalled();
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

      mockDayScheduleService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);
      expect(result).toEqual(expectedResult);
      expect(mockDayScheduleService.update).toHaveBeenCalledWith(1, updateDto);
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

      mockDayScheduleService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');
      expect(result).toEqual(expectedResult);
      expect(mockDayScheduleService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getDaySchedule', () => {
    it('должен вернуть расписание на конкретный день', async () => {
      const testDate = '2024-03-20';
      const expectedResult = new Date('2024-03-20T09:00:00');

      mockDayScheduleService.getDaySchedule.mockResolvedValue(expectedResult);

      const result = await controller.getDaySchedule(testDate);
      expect(result).toEqual(expectedResult);
      expect(mockDayScheduleService.getDaySchedule).toHaveBeenCalledWith(
        new Date(testDate),
      );
    });
  });

  describe('getAvailableDays', () => {
    it('должен вернуть доступные дни в указанном диапазоне', async () => {
      const params = {
        fromDate: '2024-03-20',
        toDate: '2024-03-25',
      };
      const expectedDays = [new Date('2024-03-20'), new Date('2024-03-21')];

      mockDayScheduleService.getAvailableDays.mockResolvedValue(expectedDays);

      const result = await controller.getAvailableDays(params);
      expect(result).toEqual(expectedDays);
      expect(mockDayScheduleService.getAvailableDays).toHaveBeenCalledWith(
        params,
      );
    });
  });
});
