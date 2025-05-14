import { Test, TestingModule } from '@nestjs/testing';
import { NotWorkingDaysService } from './not-working-days.service';
import { DatabaseService } from '../database/database.service';

describe('NotWorkingDaysService', () => {
  let service: NotWorkingDaysService;

  const mockDatabaseService = {
    nonWorkingDay: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotWorkingDaysService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<NotWorkingDaysService>(NotWorkingDaysService);
  });

  // Тест: Инициализация сервиса
  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // Тест: Поиск по дате
  describe('findByDate', () => {
    it('должен находить нерабочий день по дате', async () => {
      const testDate = new Date('2024-03-20');
      const mockDay = {
        id: 1,
        date: testDate,
        reason: 'Праздник',
      };

      mockDatabaseService.nonWorkingDay.findFirst.mockResolvedValue(mockDay);

      const result = await service.findByDate(testDate);
      expect(result).toEqual(mockDay);
    });
  });

  // Тест: Создание нерабочего дня
  describe('create', () => {
    it('должен создавать новый нерабочий день', async () => {
      const createDto = {
        date: new Date('2024-03-20'),
        reason: 'Праздник',
      };

      mockDatabaseService.nonWorkingDay.create.mockResolvedValue({
        id: 1,
        ...createDto,
      });

      const result = await service.create(createDto);
      expect(result).toHaveProperty('id');
      expect(result.reason).toBe(createDto.reason);
    });
  });

  // Тест: Получение всех нерабочих дней
  describe('findAll', () => {
    it('должен возвращать список всех нерабочих дней', async () => {
      const mockDays = [
        {
          id: 1,
          date: new Date('2024-03-20'),
          reason: 'Праздник 1',
        },
        {
          id: 2,
          date: new Date('2024-03-21'),
          reason: 'Праздник 2',
        },
      ];

      mockDatabaseService.nonWorkingDay.findMany.mockResolvedValue(mockDays);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockDays);
    });
  });

  // Тест: Обновление нерабочего дня
  describe('update', () => {
    it('должен обновлять существующий нерабочий день', async () => {
      const updateDto = {
        reason: 'Обновленное описание',
      };

      const mockUpdatedDay = {
        id: 1,
        date: new Date('2024-03-20'),
        ...updateDto,
      };

      mockDatabaseService.nonWorkingDay.update.mockResolvedValue(
        mockUpdatedDay,
      );

      const result = await service.update(1, updateDto);
      expect(result.reason).toBe(updateDto.reason);
    });
  });

  // Тест: Удаление нерабочего дня
  describe('remove', () => {
    it('должен удалять нерабочий день', async () => {
      const mockDeletedDay = {
        id: 1,
        date: new Date('2024-03-20'),
        reason: 'Удаленный день',
      };

      mockDatabaseService.nonWorkingDay.delete.mockResolvedValue(
        mockDeletedDay,
      );

      const result = await service.remove(1);
      expect(result).toEqual(mockDeletedDay);
    });
  });
});
