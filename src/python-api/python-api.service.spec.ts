import { Test, TestingModule } from '@nestjs/testing';
import { PythonApiService } from './python-api.service';
import { HttpService } from '@nestjs/axios';

describe('PythonApiService', () => {
  let service: PythonApiService;

  const mockHttpService = {
    axiosRef: {
      post: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PythonApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<PythonApiService>(PythonApiService);
    jest.clearAllMocks();
  });

  // Тест: Инициализация сервиса
  it('сервис должен быть определен', () => {
    expect(service).toBeDefined();
  });

  // Тест: Получение рекомендаций
  describe('getRecommendation', () => {
    it('должен получать рекомендации от Python бэкенда', async () => {
      const mockNotes = ['Заметка 1', 'Заметка 2'];
      const mockResponse = {
        data: {
          recommendation: 'Тестовая рекомендация',
        },
      };

      mockHttpService.axiosRef.post.mockResolvedValue(mockResponse);

      const result = await service.getRecommendation(mockNotes);

      expect(mockHttpService.axiosRef.post).toHaveBeenCalledWith(
        '/get_recommendation',
        { notes: mockNotes },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('должен обрабатывать пустой массив заметок', async () => {
      const mockResponse = {
        data: {
          recommendation: '',
        },
      };

      mockHttpService.axiosRef.post.mockResolvedValue(mockResponse);

      const result = await service.getRecommendation([]);

      expect(mockHttpService.axiosRef.post).toHaveBeenCalledWith(
        '/get_recommendation',
        { notes: [] },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('должен обрабатывать ошибки от Python бэкенда', async () => {
      const mockError = new Error('Python backend error');
      mockHttpService.axiosRef.post.mockRejectedValue(mockError);

      await expect(service.getRecommendation([])).rejects.toThrow(mockError);
    });
  });
});
