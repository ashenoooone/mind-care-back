import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from './owner.service';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('OwnerService', () => {
  let service: OwnerService;

  const mockDatabaseService = {
    serverSettings: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
  });

  // Тест: Инициализация сервиса
  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // Тест: Проверка логина
  describe('login', () => {
    it('должен успешно авторизовать с правильными учетными данными', async () => {
      const mockToken = 'test-token';
      const mockSettings = { id: 1, adminToken: '' };

      mockConfigService.get.mockReturnValue('admin:password');
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockDatabaseService.serverSettings.findFirst.mockResolvedValue(
        mockSettings,
      );
      mockDatabaseService.serverSettings.update.mockResolvedValue({
        ...mockSettings,
        adminToken: mockToken,
      });

      const result = await service.login({
        login: 'admin',
        password: 'password',
      });

      expect(result.token).toBe(mockToken);
      expect(mockDatabaseService.serverSettings.update).toHaveBeenCalled();
    });

    it('должен выбрасывать UnauthorizedException при неверных учетных данных', async () => {
      mockConfigService.get.mockReturnValue('admin:password');

      await expect(
        service.login({ login: 'wrong', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // Тест: Проверка токена
  describe('checkToken', () => {
    it('должен успешно проверять валидный токен', async () => {
      const mockToken = 'valid-token';
      const mockPayload = { sub: 'admin' };
      const mockSettings = { adminToken: mockToken };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockDatabaseService.serverSettings.findFirst.mockResolvedValue(
        mockSettings,
      );

      const result = await service.checkToken(mockToken);

      expect(result).toEqual(mockPayload);
    });

    it('должен выбрасывать ForbiddenException при невалидном токене', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error());

      await expect(service.checkToken('invalid-token')).rejects.toThrow();
    });
  });
});
