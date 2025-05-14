import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { DatabaseService } from 'src/database/database.service';
import { SupportStatus } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockDatabaseService = {
    user: {
      findFirst: jest.fn(),
    },
    supportRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('должен создавать новый запрос в поддержку', async () => {
      const createReportDto = {
        phone: '+79001234567',
        text: 'Тестовое обращение',
      };

      const mockUser = {
        id: 1,
        name: 'Тест Тестович',
      };

      const mockCreatedReport = {
        id: 1,
        description: createReportDto.text,
        status: SupportStatus.PENDING,
        clientId: mockUser.id,
      };

      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);
      mockDatabaseService.supportRequest.create.mockResolvedValue(
        mockCreatedReport,
      );

      const result = await service.create(createReportDto);

      expect(mockDatabaseService.user.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: createReportDto.phone },
      });
      expect(mockDatabaseService.supportRequest.create).toHaveBeenCalledWith({
        data: {
          description: createReportDto.text,
          status: SupportStatus.PENDING,
          clientId: mockUser.id,
        },
      });
      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('findAll', () => {
    it('должен возвращать список запросов с пагинацией', async () => {
      const params = {
        page: 0,
        limit: 10,
      };

      const mockReports = [
        {
          id: 1,
          description: 'Тестовое обращение 1',
          status: SupportStatus.PENDING,
          client: { id: 1, name: 'Тест Тестович' },
        },
        {
          id: 2,
          description: 'Тестовое обращение 2',
          status: SupportStatus.RESOLVED,
          client: { id: 2, name: 'Тест Тестов' },
        },
      ];

      mockDatabaseService.supportRequest.findMany.mockResolvedValue(
        mockReports,
      );
      mockDatabaseService.supportRequest.count.mockResolvedValue(2);

      const result = await service.findAll(params);

      expect(mockDatabaseService.supportRequest.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: {
          client: true,
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
          {
            id: 'desc',
          },
        ],
      });
      expect(result.items).toEqual(mockReports);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('findOne', () => {
    it('должен находить запрос по ID', async () => {
      const id = 1;
      const mockReport = {
        id: 1,
        description: 'Тестовое обращение',
        status: SupportStatus.PENDING,
      };

      mockDatabaseService.supportRequest.findUnique.mockResolvedValue(
        mockReport,
      );

      const result = await service.findOne(id);

      expect(
        mockDatabaseService.supportRequest.findUnique,
      ).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockReport);
    });
  });

  describe('update', () => {
    it('должен обновлять статус запроса', async () => {
      const id = 1;
      const updateReportDto = {
        status: SupportStatus.RESOLVED,
      };

      const mockUpdatedReport = {
        id: 1,
        description: 'Тестовое обращение',
        ...updateReportDto,
      };

      mockDatabaseService.supportRequest.update.mockResolvedValue(
        mockUpdatedReport,
      );

      const result = await service.update(id, updateReportDto);

      expect(mockDatabaseService.supportRequest.update).toHaveBeenCalledWith({
        where: { id },
        data: updateReportDto,
      });
      expect(result).toEqual(mockUpdatedReport);
    });
  });

  describe('remove', () => {
    it('должен удалять запрос', async () => {
      const id = 1;
      const mockDeletedReport = {
        id: 1,
        description: 'Тестовое обращение',
        status: SupportStatus.PENDING,
      };

      mockDatabaseService.supportRequest.delete.mockResolvedValue(
        mockDeletedReport,
      );

      const result = await service.remove(id);

      expect(mockDatabaseService.supportRequest.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockDeletedReport);
    });
  });
});
