import { Test, TestingModule } from '@nestjs/testing';
import { HintsController } from './hints.controller';
import { HintsService } from './hints.service';

describe('HintsController', () => {
  let controller: HintsController;
  let hintsService: HintsService;

  const mockHintsService = {
    generateHints: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HintsController],
      providers: [
        {
          provide: HintsService,
          useValue: mockHintsService,
        },
      ],
    }).compile();

    controller = module.get<HintsController>(HintsController);
    hintsService = module.get<HintsService>(HintsService);
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('generateHints', () => {
    it('должен вызывать метод generateHints сервиса с правильными параметрами', async () => {
      const dto = { userId: 1 };
      const expectedResult = ['Рекомендация 1', 'Рекомендация 2'];

      mockHintsService.generateHints.mockResolvedValue(expectedResult);

      const result = await controller.generateHints(dto);

      expect(mockHintsService.generateHints).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
