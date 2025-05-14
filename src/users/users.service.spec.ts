import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from 'src/database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockDatabaseService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
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

      mockDatabaseService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          id: createUserDto.telegramId,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('должен возвращать список пользователей с пагинацией', async () => {
      const params = {
        page: 0,
        limit: 10,
        name: 'Тест',
      };

      const mockUsers = [
        { id: 1, name: 'Тест Тестович', tgNick: '@test1' },
        { id: 2, name: 'Тест Тестов', tgNick: '@test2' },
      ];

      mockDatabaseService.user.findMany.mockResolvedValue(mockUsers);
      mockDatabaseService.user.count.mockResolvedValue(2);

      const result = await service.findAll(params);

      expect(mockDatabaseService.user.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {
          OR: [
            { name: { contains: 'Тест' } },
            { name: { equals: 'Тест' } },
            { tgNickname: { equals: 'Тест' } },
            { tgNickname: { contains: 'Тест' } },
          ],
        },
      });
      expect(result.items).toEqual(mockUsers);
      expect(result.meta.totalItems).toBe(2);
    });
  });

  describe('findOne', () => {
    it('должен находить пользователя по ID', async () => {
      const id = 1;
      const mockUser = {
        id: 1,
        name: 'Тест Тестович',
        tgNick: '@test',
      };

      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(id, false);

      expect(mockDatabaseService.user.findFirst).toHaveBeenCalledWith({
        include: undefined,
        where: {
          OR: [{ id: 1 }, { telegramId: 1 }],
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('должен выбрасывать NotFoundException если пользователь не найден', async () => {
      const id = 999;

      mockDatabaseService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne(id, false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('должен возвращать расширенную информацию о пользователе', async () => {
      const id = 1;
      const mockUser = {
        id: 1,
        name: 'Тест Тестович',
        tgNick: '@test',
        appointments: [
          {
            id: 1,
            startTime: new Date(),
            service: { id: 1, name: 'Консультация' },
          },
        ],
      };

      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(id, true);

      expect(mockDatabaseService.user.findFirst).toHaveBeenCalledWith({
        include: {
          appointments: {
            take: 10,
            orderBy: {
              startTime: 'desc',
            },
            include: {
              service: true,
            },
          },
        },
        where: {
          OR: [{ id: 1 }, { telegramId: 1 }],
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('должен обновлять данные пользователя', async () => {
      const id = 1;
      const updateUserDto = {
        name: 'Новое Имя',
      };

      const mockUpdatedUser = {
        id: 1,
        ...updateUserDto,
      };

      mockDatabaseService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(id, updateUserDto);

      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: updateUserDto,
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('должен удалять пользователя', async () => {
      const id = 1;
      const mockDeletedUser = {
        id: 1,
        name: 'Тест Тестович',
      };

      mockDatabaseService.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await service.remove(id);

      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockDeletedUser);
    });
  });
});
