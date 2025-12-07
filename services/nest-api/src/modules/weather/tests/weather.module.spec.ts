import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { I18nService } from 'nestjs-i18n';
import { WeatherController } from '../weather.controller';
import { WeatherService } from '../weather.service';
import { WeatherRepository } from '../repositories/weather.repository';
import { WeatherLog } from '../schemas/weather.schema';

describe('WeatherModule (smoke)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('compiles controller/service/repository with mocked model token and i18n', async () => {
    const mockModel = jest.fn();
    const mockI18n = { t: jest.fn((k: string) => k) } as unknown as I18nService;

    const moduleRef = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        WeatherService,
        WeatherRepository,
        { provide: getModelToken(WeatherLog.name), useValue: mockModel },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compile();

    const svc = moduleRef.get(WeatherService);
    const repo = moduleRef.get(WeatherRepository);
    const ctrl = moduleRef.get(WeatherController);

    expect(svc).toBeDefined();
    expect(repo).toBeDefined();
    expect(ctrl).toBeDefined();
  });
});
