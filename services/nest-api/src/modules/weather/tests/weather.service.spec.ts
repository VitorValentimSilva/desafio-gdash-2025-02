import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from '../weather.service';
import { WeatherRepository } from '../repositories/weather.repository';
import { computeInsightsFromRows } from '../utils/insights';
import { I18nService } from 'nestjs-i18n';

describe('WeatherService', () => {
  let service: WeatherService;
  let i18n: Partial<I18nService>;

  const repoMock = {
    create: jest.fn(),
    list: jest.fn(),
    findAllLean: jest.fn(),
    findRecent: jest.fn(),
    findLast24: jest.fn(),
  };

  beforeEach(async () => {
    i18n = {
      t: jest.fn().mockImplementation((k: string) => k),
    } as Partial<I18nService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherRepository, useValue: repoMock },
        { provide: I18nService, useValue: i18n },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => jest.clearAllMocks());

  it('computeInsights delegates to repo and returns structure', async () => {
    const rows = [
      {
        current: {
          temperature_c: 20,
          relative_humidity_percent: 50,
          precipitation_probability_percent: 10,
        },
      },
    ];
    repoMock.findRecent.mockResolvedValue(rows);

    const res = await service.computeInsights(24);
    const expected = computeInsightsFromRows(rows, i18n as I18nService, 24);
    expect(res).toMatchObject({
      samples: expected.samples,
      avg_temperature: expected.avg_temperature,
    });
    expect(repoMock.findRecent).toHaveBeenCalledWith(24);
  });

  it('exportCsv uses findAllLean', async () => {
    repoMock.findAllLean.mockResolvedValue([
      { id: '1', current: { temperature_c: 10 } },
    ]);
    const csv = await service.exportCsv();
    expect(csv).toContain('id');
    expect(repoMock.findAllLean).toHaveBeenCalled();
  });
});
