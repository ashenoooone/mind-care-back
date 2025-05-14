import { Test, TestingModule } from '@nestjs/testing';
import { WorkingSheduleController } from './working-shedule.controller';
import { WorkingSheduleService } from './working-shedule.service';

describe('WorkingSheduleController', () => {
  let controller: WorkingSheduleController;

  const mockWorkingSheduleService = {
    findAll: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkingSheduleController],
      providers: [
        {
          provide: WorkingSheduleService,
          useValue: mockWorkingSheduleService,
        },
      ],
    }).compile();

    controller = module.get<WorkingSheduleController>(WorkingSheduleController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать список всего рабочего расписания', async () => {
      const mockSchedules = [
        { id: 1, dayOfWeek: 0, isWorking: true, startHour: 9, endHour: 18 },
        { id: 2, dayOfWeek: 1, isWorking: true, startHour: 9, endHour: 18 },
      ];

      mockWorkingSheduleService.findAll.mockResolvedValue(mockSchedules);

      const result = await controller.findAll();

      expect(mockWorkingSheduleService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockSchedules);
    });
  });

  describe('update', () => {
    it('должен обновлять расписание по указанному ID', async () => {
      const id = '1';
      const updateDto = {
        dayOfWeek: 0,
        isWorking: false,
        startHour: 10,
        endHour: 19,
      };

      const mockUpdatedSchedule = {
        id: 1,
        ...updateDto,
      };

      mockWorkingSheduleService.update.mockResolvedValue(mockUpdatedSchedule);

      const result = await controller.update(id, updateDto);

      expect(mockWorkingSheduleService.update).toHaveBeenCalledWith(
        1,
        updateDto,
      );
      expect(result).toEqual(mockUpdatedSchedule);
    });
  });
});
