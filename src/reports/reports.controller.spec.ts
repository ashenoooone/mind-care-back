import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SupportStatus } from '@prisma/client';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен создавать новый запрос в поддержку', async () => {
      const createReportDto = {
        phone: '+79001234567',
        text: 'Тестовое обращение',
      };

      const mockCreatedReport = {
        id: 1,
        description: createReportDto.text,
        status: SupportStatus.PENDING,
        clientId: 1,
      };

      mockReportsService.create.mockResolvedValue(mockCreatedReport);

      const result = await controller.create(createReportDto);

      expect(mockReportsService.create).toHaveBeenCalledWith(createReportDto);
      expect(result).toEqual(mockCreatedReport);
    });
  });

  describe('findAll', () => {
    it('должен возвращать список запросов с пагинацией', async () => {
      const params = {
        page: 0,
        limit: 10,
      };

      const mockResponse = {
        items: [
          {
            id: 1,
            description: 'Тестовое обращение 1',
            status: SupportStatus.PENDING,
            client: { id: 1, name: 'Тест Тестович' },
          },
        ],
        meta: {
          currentPage: 0,
          nextPage: 0,
          prevPage: 0,
          totalItems: 1,
          totalPages: 1,
        },
      };

      mockReportsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(params);

      expect(mockReportsService.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('должен находить запрос по ID', async () => {
      const id = '1';
      const mockReport = {
        id: 1,
        description: 'Тестовое обращение',
        status: SupportStatus.PENDING,
      };

      mockReportsService.findOne.mockResolvedValue(mockReport);

      const result = await controller.findOne(id);

      expect(mockReportsService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReport);
    });
  });

  describe('update', () => {
    it('должен обновлять статус запроса', async () => {
      const id = '1';
      const updateReportDto = {
        status: SupportStatus.RESOLVED,
      };

      const mockUpdatedReport = {
        id: 1,
        description: 'Тестовое обращение',
        ...updateReportDto,
      };

      mockReportsService.update.mockResolvedValue(mockUpdatedReport);

      const result = await controller.update(id, updateReportDto);

      expect(mockReportsService.update).toHaveBeenCalledWith(
        1,
        updateReportDto,
      );
      expect(result).toEqual(mockUpdatedReport);
    });
  });

  describe('remove', () => {
    it('должен удалять запрос', async () => {
      const id = '1';
      const mockDeletedReport = {
        id: 1,
        description: 'Тестовое обращение',
        status: SupportStatus.PENDING,
      };

      mockReportsService.remove.mockResolvedValue(mockDeletedReport);

      const result = await controller.remove(id);

      expect(mockReportsService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDeletedReport);
    });
  });
});
