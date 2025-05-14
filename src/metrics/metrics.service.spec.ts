import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { DatabaseService } from '../database/database.service';
import { AppointmentStatus } from '@prisma/client';

describe('MetricsService', () => {
  let service: MetricsService;

  const mockDatabaseService = {
    appointment: {
      findMany: jest.fn(),
    },
    service: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    jest.clearAllMocks();
  });

  // Тест: Инициализация сервиса
  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // Тест: Получение метрик записей
  describe('getAppointmentsMetrics', () => {
    it('должен правильно рассчитывать метрики для записей', async () => {
      const mockAppointments = [
        {
          status: AppointmentStatus.COMPLETED,
          service: { price: 1000 },
          startTime: new Date('2024-03-20T10:00:00'),
          endTime: new Date('2024-03-20T11:00:00'),
        },
        {
          status: AppointmentStatus.CANCELLED,
          service: { price: 500 },
          startTime: new Date('2024-03-20T12:00:00'),
          endTime: new Date('2024-03-20T13:00:00'),
        },
        {
          status: AppointmentStatus.SCHEDULED,
          service: { price: 750 },
          startTime: new Date('2024-03-20T14:00:00'),
          endTime: new Date('2024-03-20T15:00:00'),
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAppointmentsMetrics({});

      expect(result.totalProfit).toBe(1000);
      expect(result.totalLoss).toBe(500);
      expect(result.plannedProfit).toBe(750);
      expect(result.counts[AppointmentStatus.COMPLETED]).toBe(1);
      expect(result.counts[AppointmentStatus.CANCELLED]).toBe(1);
      expect(result.counts[AppointmentStatus.SCHEDULED]).toBe(1);
      expect(result.totalHours).toBe(3);
      expect(result.totalMinutes).toBe(0);
    });
  });

  // Тест: Средняя продолжительность записи
  describe('getAverageDuration', () => {
    it('должен правильно рассчитывать среднюю продолжительность', async () => {
      const mockAppointments = [
        {
          startTime: new Date('2024-03-20T10:00:00'),
          endTime: new Date('2024-03-20T11:00:00'),
        },
        {
          startTime: new Date('2024-03-20T12:00:00'),
          endTime: new Date('2024-03-20T14:00:00'),
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAverageDuration({});
      expect(result).toBe(90); // (60 + 120) / 2 = 90 минут
    });

    it('должен возвращать 0 при отсутствии записей', async () => {
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      const result = await service.getAverageDuration({});
      expect(result).toBe(0);
    });
  });

  // Тест: Самая популярная услуга
  describe('getMostPopularService', () => {
    it('должен находить самую популярную услугу', async () => {
      const mockAppointments = [
        { serviceId: 1 },
        { serviceId: 1 },
        { serviceId: 2 },
      ];

      const mockService = {
        id: 1,
        name: 'Популярная услуга',
        price: 1000,
      };

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );
      mockDatabaseService.service.findUnique.mockResolvedValue(mockService);

      const result = await service.getMostPopularService({});

      expect(result.service).toEqual(mockService);
      expect(result.count).toBe(2);
    });

    it('должен возвращать null при отсутствии записей', async () => {
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      const result = await service.getMostPopularService({});
      expect(result).toBeNull();
    });
  });

  // Тест: Самое загруженное время
  describe('getBusiestTime', () => {
    it('должен определять самые загруженные часы', async () => {
      const mockAppointments = [
        { startTime: new Date('2024-03-20T10:00:00') },
        { startTime: new Date('2024-03-20T10:30:00') },
        { startTime: new Date('2024-03-20T14:00:00') },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getBusiestTime({});
      expect(result[0]).toEqual({ time: '10:00 - 11:00', count: 2 });
    });
  });

  // Тест: Количество уникальных клиентов
  describe('getUniqueClients', () => {
    it('должен подсчитывать количество уникальных клиентов', async () => {
      const mockAppointments = [
        { clientId: 1 },
        { clientId: 1 },
        { clientId: 2 },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getUniqueClients({});
      expect(result).toBe(2);
    });
  });

  // Тест: Средняя стоимость записи
  describe('getAverageAppointmentCost', () => {
    it('должен рассчитывать среднюю стоимость завершенных записей', async () => {
      const mockAppointments = [
        { service: { price: 1000 } },
        { service: { price: 2000 } },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAverageAppointmentCost({});
      expect(result).toBe(1500);
    });
  });

  // Тест: Записи по дням недели
  describe('getAppointmentsByWeekday', () => {
    it('должен группировать записи по дням недели', async () => {
      const mockAppointments = [
        { startTime: new Date('2024-03-20T10:00:00') }, // Среда
        { startTime: new Date('2024-03-20T14:00:00') }, // Среда
        { startTime: new Date('2024-03-21T10:00:00') }, // Четверг
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAppointmentsByWeekday({});
      expect(result['среда']).toBe(2);
      expect(result['четверг']).toBe(1);
    });
  });

  // Тест: Отмены по клиентам
  describe('getTopCancelingClients', () => {
    it('должен возвращать список клиентов с отменами', async () => {
      const mockAppointments = [
        { clientId: 1 },
        { clientId: 1 },
        { clientId: 2 },
      ];

      const mockUser = { id: 1, name: 'Тестовый клиент' };

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getTopCancelingClients({});
      expect(result[0]).toHaveProperty('cancelledCount', 2);
    });
  });

  // Тест: Средняя загрузка за рабочий день
  describe('getAverageDailyLoad', () => {
    it('должен рассчитывать среднюю загрузку за день', async () => {
      const mockAppointments = [
        {
          startTime: new Date('2024-03-20T10:00:00'),
          endTime: new Date('2024-03-20T11:00:00'),
        },
        {
          startTime: new Date('2024-03-20T14:00:00'),
          endTime: new Date('2024-03-20T15:00:00'),
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAverageDailyLoad({});
      expect(result).toBe(120); // 2 часа в минутах
    });
  });

  // Тест: Соотношение выручки по услугам
  describe('getRevenueShareByService', () => {
    it('должен рассчитывать долю выручки по каждой услуге', async () => {
      const mockAppointments = [
        {
          serviceId: 1,
          service: { name: 'Услуга 1', price: 1000 },
        },
        {
          serviceId: 1,
          service: { name: 'Услуга 1', price: 1000 },
        },
        {
          serviceId: 2,
          service: { name: 'Услуга 2', price: 2000 },
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getRevenueShareByService({});
      expect(result).toHaveLength(2);
      expect(result[0].percentage).toBe(50);
    });
  });

  // Тест: Уникальные клиенты по времени
  describe('getUniqueClientsOverTime', () => {
    it('должен группировать уникальных клиентов по периодам', async () => {
      const mockAppointments = [
        {
          clientId: 1,
          startTime: new Date('2024-03-01T10:00:00'),
        },
        {
          clientId: 1,
          startTime: new Date('2024-03-01T14:00:00'),
        },
        {
          clientId: 2,
          startTime: new Date('2024-03-15T10:00:00'),
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getUniqueClientsOverTime({}, 'month');
      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(2);
    });
  });

  // Тест: Динамика отмен
  describe('getCancellationTrends', () => {
    it('должен показывать динамику отмен по дням', async () => {
      const mockAppointments = [
        { startTime: new Date('2024-03-20T10:00:00') },
        { startTime: new Date('2024-03-20T14:00:00') },
        { startTime: new Date('2024-03-21T10:00:00') },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getCancellationTrends({}, 'day');
      expect(result).toHaveLength(2);
    });
  });

  // Тест: Средняя загрузка рабочего дня
  describe('getDailyLoad', () => {
    it('должен рассчитывать среднюю загрузку по дням', async () => {
      const mockAppointments = [
        {
          startTime: new Date('2024-03-20T10:00:00'),
          endTime: new Date('2024-03-20T11:00:00'),
        },
        {
          startTime: new Date('2024-03-20T14:00:00'),
          endTime: new Date('2024-03-20T16:00:00'),
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getDailyLoad({});
      expect(result).toHaveLength(1);
      expect(result[0].averageLoadMinutes).toBe(90); // (60 + 120) / 2
    });
  });

  // Тест: Выручка по времени
  describe('getRevenueOverTime', () => {
    it('должен группировать выручку по периодам', async () => {
      const mockAppointments = [
        {
          startTime: new Date('2024-03-20T10:00:00'),
          service: { price: 1000 },
        },
        {
          startTime: new Date('2024-03-20T14:00:00'),
          service: { price: 2000 },
        },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getRevenueOverTime({}, 'day');
      expect(result).toHaveLength(1);
      expect(result[0].revenue).toBe(3000);
    });
  });
});
