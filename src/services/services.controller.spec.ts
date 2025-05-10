import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { GetServicesDto } from './dto/get-services.dto';

describe('ServicesController', () => {
  let controller: ServicesController;

  const mockServicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
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
      mockServicesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createServiceDto);
      expect(result).toEqual(expectedResult);
      expect(mockServicesService.create).toHaveBeenCalledWith(createServiceDto);
    });
  });

  describe('получение всех', () => {
    it('должен вернуть все услуги', async () => {
      const query: GetServicesDto = {
        page: 0,
        limit: 10,
      };

      const expectedResult = {
        meta: {
          currentPage: 0,
          nextPage: 0,
          totalItems: 2,
          prevPage: 0,
          totalPages: 0,
        },
        items: [
          { id: 1, name: 'Услуга 1' },
          { id: 2, name: 'Услуга 2' },
        ],
      };

      mockServicesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(mockServicesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('получение одной', () => {
    it('должен вернуть услугу по id', async () => {
      const id = '1';
      const expectedService = { id: 1, name: 'Тестовая Услуга' };

      mockServicesService.findOne.mockResolvedValue(expectedService);

      const result = await controller.findOne(id);
      expect(result).toEqual(expectedService);
      expect(mockServicesService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('обновление', () => {
    it('должен обновить услугу', async () => {
      const id = '1';
      const updateServiceDto: UpdateServiceDto = {
        name: 'Обновленная Услуга',
      };

      const expectedResult = { id: 1, ...updateServiceDto };
      mockServicesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateServiceDto);
      expect(result).toEqual(expectedResult);
      expect(mockServicesService.update).toHaveBeenCalledWith(
        1,
        updateServiceDto,
      );
    });
  });

  describe('удаление', () => {
    it('должен удалить услугу', async () => {
      const id = '1';
      const expectedResult = { id: 1, name: 'Удаленная Услуга' };

      mockServicesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockServicesService.remove).toHaveBeenCalledWith(1);
    });
  });
});
