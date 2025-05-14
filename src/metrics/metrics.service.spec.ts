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
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );

      const result = await service.getAppointmentsMetrics({});

      expect(result.totalProfit).toBe(1000);
      expect(result.totalLoss).toBe(500);
      expect(result.counts[AppointmentStatus.COMPLETED]).toBe(1);
      expect(result.counts[AppointmentStatus.CANCELLED]).toBe(1);
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
  });
});
