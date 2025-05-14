import { Test, TestingModule } from '@nestjs/testing';
import { HintsService } from './hints.service';
import { DatabaseService } from 'src/database/database.service';
import { PythonApiService } from 'src/python-api/python-api.service';

describe('HintsService', () => {
  let service: HintsService;
  let databaseService: DatabaseService;
  let pythonApiService: PythonApiService;

  const mockDatabaseService = {
    appointment: {
      findMany: jest.fn(),
    },
  };

  const mockPythonApiService = {
    getRecommendation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HintsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: PythonApiService,
          useValue: mockPythonApiService,
        },
      ],
    }).compile();

    service = module.get<HintsService>(HintsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    pythonApiService = module.get<PythonApiService>(PythonApiService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('generateHints', () => {
    it('должен получать записи о встречах пользователя и генерировать рекомендации', async () => {
      const userId = 1;
      const mockAppointments = [
        { note: '**Проблемы со сном**' },
        { note: '**Тревожность**' },
        { note: 'Обычная заметка' },
      ];
      const expectedNotes = ['Проблемы со сном', 'Тревожность'];
      const mockRecommendation = ['Рекомендация 1', 'Рекомендация 2'];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );
      mockPythonApiService.getRecommendation.mockResolvedValue(
        mockRecommendation,
      );

      const result = await service.generateHints({ userId });

      expect(mockDatabaseService.appointment.findMany).toHaveBeenCalledWith({
        where: { clientId: userId },
        take: 5,
      });
      expect(mockPythonApiService.getRecommendation).toHaveBeenCalledWith(
        expectedNotes,
      );
      expect(result).toEqual(mockRecommendation);
    });

    it('должен корректно обрабатывать записи без выделенных заметок', async () => {
      const userId = 1;
      const mockAppointments = [
        { note: 'Обычная заметка 1' },
        { note: 'Обычная заметка 2' },
      ];

      mockDatabaseService.appointment.findMany.mockResolvedValue(
        mockAppointments,
      );
      mockPythonApiService.getRecommendation.mockResolvedValue([]);

      const result = await service.generateHints({ userId });

      expect(mockPythonApiService.getRecommendation).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('должен корректно обрабатывать пустой список встреч', async () => {
      const userId = 1;
      mockDatabaseService.appointment.findMany.mockResolvedValue([]);
      mockPythonApiService.getRecommendation.mockResolvedValue([]);

      const result = await service.generateHints({ userId });

      expect(mockPythonApiService.getRecommendation).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });
  });
});
