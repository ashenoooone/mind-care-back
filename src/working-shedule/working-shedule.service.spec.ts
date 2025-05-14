import { Test, TestingModule } from '@nestjs/testing';
import { WorkingSheduleService } from './working-shedule.service';
import { DatabaseService } from 'src/database/database.service';

describe('WorkingSheduleService', () => {
  let service: WorkingSheduleService;

  const mockDatabaseService = {
    workingSchedule: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkingSheduleService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<WorkingSheduleService>(WorkingSheduleService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать список всего рабочего расписания', async () => {
      const mockSchedules = [
        { id: 1, dayOfWeek: 0, isWorking: true, startHour: 9, endHour: 18 },
        { id: 2, dayOfWeek: 1, isWorking: true, startHour: 9, endHour: 18 },
      ];

      mockDatabaseService.workingSchedule.findMany.mockResolvedValue(
        mockSchedules,
      );

      const result = await service.findAll();

      expect(mockDatabaseService.workingSchedule.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockSchedules);
    });
  });

  describe('update', () => {
    it('должен обновлять расписание по указанному ID', async () => {
      const id = 1;
      const updateDto = {
        dayOfWeek: 0,
        isWorking: false,
        startHour: 10,
        endHour: 19,
      };

      const mockUpdatedSchedule = {
        id,
        ...updateDto,
      };

      mockDatabaseService.workingSchedule.update.mockResolvedValue(
        mockUpdatedSchedule,
      );

      const result = await service.update(id, updateDto);

      expect(mockDatabaseService.workingSchedule.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
      expect(result).toEqual(mockUpdatedSchedule);
    });
  });
});
