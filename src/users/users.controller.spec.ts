import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('должен создавать нового пользователя', async () => {
      const createUserDto = {
        telegramId: 123456,
        name: 'Тест Тестович',
        tgNick: '@test',
        phoneNumber: '+79001234567',
        timezone: 3,
      };

      const expectedUser = {
        id: 123456,
        ...createUserDto,
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('должен возвращать список пользователей', async () => {
      const params = {
        page: 0,
        limit: 10,
        name: 'Тест',
      };

      const mockResponse = {
        items: [
          { id: 1, name: 'Тест Тестович', tgNick: '@test1' },
          { id: 2, name: 'Тест Тестов', tgNick: '@test2' },
        ],
        meta: {
          currentPage: 0,
          nextPage: 0,
          prevPage: 0,
          totalItems: 2,
          totalPages: 1,
        },
      };

      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(params);

      expect(mockUsersService.findAll).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('должен находить пользователя по ID', async () => {
      const id = '1';
      const type = 'extended';
      const mockUser = {
        id: 1,
        name: 'Тест Тестович',
        tgNick: '@test',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(id, type);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(1, true);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('должен обновлять данные пользователя', async () => {
      const id = '1';
      const updateUserDto = {
        name: 'Новое Имя',
      };

      const mockUpdatedUser = {
        id: 1,
        ...updateUserDto,
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update(id, updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('должен удалять пользователя', async () => {
      const id = '1';
      const mockDeletedUser = {
        id: 1,
        name: 'Тест Тестович',
      };

      mockUsersService.remove.mockResolvedValue(mockDeletedUser);

      const result = await controller.remove(id);

      expect(mockUsersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDeletedUser);
    });
  });
});
