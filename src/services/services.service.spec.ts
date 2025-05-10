import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { DatabaseService } from '../database/database.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './dto/get-services.dto';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockDbService = {
    service: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('создание', () => {
    it('должен создать новую услугу', async () => {
      const createServiceDto: CreateServiceDto = {
        name: 'Тестовая Услуга',
        description: 'Тестовое Описание',
        price: 100,
        duration: 60,
      };

      const expectedResult = { id: 1, ...createServiceDto };
      mockDbService.service.create.mockResolvedValue(expectedResult);

      const result = await service.create(createServiceDto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.service.create).toHaveBeenCalledWith({
        data: createServiceDto,
      });
    });
  });

  describe('получение всех', () => {
    it('должен вернуть услуги с пагинацией', async () => {
      const query: GetServicesDto = {
        page: 0,
        limit: 10,
      };

      const mockItems = [
        { id: 1, name: 'Услуга 1' },
        { id: 2, name: 'Услуга 2' },
      ];

      mockDbService.service.count.mockResolvedValue(2);
      mockDbService.service.findMany.mockResolvedValue(mockItems);

      const result = await service.findAll(query);

      expect(result).toEqual({
        meta: {
          currentPage: 0,
          nextPage: 0,
          totalItems: 2,
          prevPage: 0,
          totalPages: 0,
        },
        items: mockItems,
      });
    });
  });

  describe('получение одной', () => {
    it('должен вернуть услугу по id', async () => {
      const id = 1;
      const expectedService = { id, name: 'Тестовая Услуга' };

      mockDbService.service.findUnique.mockResolvedValue(expectedService);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedService);
      expect(mockDbService.service.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('обновление', () => {
    it('должен обновить услугу', async () => {
      const id = 1;
      const updateServiceDto: UpdateServiceDto = {
        name: 'Обновленная Услуга',
      };

      const expectedResult = { id, ...updateServiceDto };
      mockDbService.service.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateServiceDto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.service.update).toHaveBeenCalledWith({
        where: { id: Number(id) },
        data: updateServiceDto,
      });
    });
  });

  describe('удаление', () => {
    it('должен удалить услугу', async () => {
      const id = 1;
      const expectedResult = { id, name: 'Удаленная Услуга' };

      mockDbService.service.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.service.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
