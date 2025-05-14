import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;

  const mockMetricsService = {
    getAppointmentsMetrics: jest.fn(),
    getAverageDuration: jest.fn(),
    getMostPopularService: jest.fn(),
    getBusiestTime: jest.fn(),
    getUniqueClients: jest.fn(),
    getAverageAppointmentCost: jest.fn(),
    getAppointmentsByWeekday: jest.fn(),
    getTopCancelingClients: jest.fn(),
    getAverageDailyLoad: jest.fn(),
    getRevenueShareByService: jest.fn(),
    getUniqueClientsOverTime: jest.fn(),
    getCancellationTrends: jest.fn(),
    getDailyLoad: jest.fn(),
    getTopCancellingClients: jest.fn(),
    getRevenueOverTime: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    jest.clearAllMocks();
  });

  // Тест: Инициализация контроллера
  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  // Тест: Получение метрик записей
  describe('getAppointments', () => {
    it('должен возвращать метрики записей', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockMetrics = {
        totalProfit: 1000,
        totalLoss: 500,
      };

      mockMetricsService.getAppointmentsMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getAppointments(mockParams);

      expect(result).toEqual(mockMetrics);
      expect(mockMetricsService.getAppointmentsMetrics).toHaveBeenCalledWith(
        mockParams,
      );
    });
  });

  // Тест: Получение всех отчетов
  describe('getAllReports', () => {
    it('должен возвращать все отчеты', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockReports = {
        averageDuration: 60,
        mostPopularService: { service: { name: 'Test' }, count: 5 },
        busiestTime: [{ time: '10:00', count: 3 }],
        uniqueClients: 10,
        averageAppointmentCost: 1000,
        appointmentsByWeekday: { Понедельник: 5 },
        topCancelingClients: [{ client: 'Test', count: 2 }],
        averageDailyLoad: 480,
      };

      Object.keys(mockReports).forEach((key) => {
        mockMetricsService[
          `get${key.charAt(0).toUpperCase() + key.slice(1)}`
        ].mockResolvedValue(mockReports[key]);
      });

      const result = await controller.getAllReports(mockParams);

      expect(result).toEqual(mockReports);
    });
  });

  // Тест: Получение выручки по услугам
  describe('getRevenueShareByService', () => {
    it('должен возвращать распределение выручки по услугам', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockRevenue = [
        { serviceId: 1, serviceName: 'Test', revenue: 1000, percentage: 50 },
      ];

      mockMetricsService.getRevenueShareByService.mockResolvedValue(
        mockRevenue,
      );

      const result = await controller.getRevenueShareByService(mockParams);

      expect(result).toEqual(mockRevenue);
      expect(mockMetricsService.getRevenueShareByService).toHaveBeenCalledWith(
        mockParams,
      );
    });
  });

  // Тест: Получение уникальных клиентов по времени
  describe('getUniqueClientsOverTime', () => {
    it('должен возвращать статистику уникальных клиентов', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockStats = [{ period: '2024-03', count: 10 }];

      mockMetricsService.getUniqueClientsOverTime.mockResolvedValue(mockStats);

      const result = await controller.getUniqueClientsOverTime(
        mockParams,
        'month',
      );

      expect(result).toEqual(mockStats);
      expect(mockMetricsService.getUniqueClientsOverTime).toHaveBeenCalledWith(
        mockParams,
        'month',
      );
    });
  });

  // Тест: Получение трендов отмен
  describe('getCancellationTrends', () => {
    it('должен возвращать тренды отмен', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockTrends = [{ period: '2024-03-20', count: 5 }];

      mockMetricsService.getCancellationTrends.mockResolvedValue(mockTrends);

      const result = await controller.getCancellationTrends(mockParams, 'day');

      expect(result).toEqual(mockTrends);
      expect(mockMetricsService.getCancellationTrends).toHaveBeenCalledWith(
        mockParams,
        'day',
      );
    });
  });

  // Тест: Получение загрузки по дням
  describe('getDailyLoad', () => {
    it('должен возвращать загрузку по дням', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockLoad = [{ date: '2024-03-20', averageLoadMinutes: 480 }];

      mockMetricsService.getDailyLoad.mockResolvedValue(mockLoad);

      const result = await controller.getDailyLoad(mockParams);

      expect(result).toEqual(mockLoad);
      expect(mockMetricsService.getDailyLoad).toHaveBeenCalledWith(mockParams);
    });
  });

  // Тест: Получение списка клиентов с отменами
  describe('getTopCancellingClients', () => {
    it('должен возвращать список клиентов с отменами', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockClients = [{ client: 'Test', cancelledCount: 5 }];

      mockMetricsService.getTopCancellingClients.mockResolvedValue(mockClients);

      const result = await controller.getTopCancellingClients(mockParams);

      expect(result).toEqual(mockClients);
      expect(mockMetricsService.getTopCancellingClients).toHaveBeenCalledWith(
        mockParams,
      );
    });
  });

  // Тест: Получение выручки по времени
  describe('getRevenueOverTime', () => {
    it('должен возвращать выручку по периодам', async () => {
      const mockParams = { dateFrom: new Date(), dateTo: new Date() };
      const mockRevenue = [{ period: '2024-03-20', revenue: 1000 }];

      mockMetricsService.getRevenueOverTime.mockResolvedValue(mockRevenue);

      const result = await controller.getRevenueOverTime(mockParams, 'day');

      expect(result).toEqual(mockRevenue);
      expect(mockMetricsService.getRevenueOverTime).toHaveBeenCalledWith(
        mockParams,
        'day',
      );
    });
  });
});
