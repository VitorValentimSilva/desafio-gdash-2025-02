import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { WeatherController } from '../weather.controller';
import { WeatherService } from '../weather.service';
import { WeatherResponseDto } from '../dto/weather-response.dto';

describe('WeatherController', () => {
  let ctrl: WeatherController;
  const mockSvc = {
    create: jest.fn(),
    list: jest.fn(),
    exportCsv: jest.fn(),
    exportXlsxBuffer: jest.fn(),
    computeInsights: jest.fn(),
    last24: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: mockSvc }],
    }).compile();

    ctrl = moduleRef.get<WeatherController>(WeatherController);
  });

  afterEach(() => jest.resetAllMocks());

  it('createLog delegates and maps result', async () => {
    const created = {
      id: '1',
      collected_at: 'd',
      source: 's',
      location: {},
      current: {},
    };
    mockSvc.create.mockResolvedValueOnce(created);
    const out = await ctrl.createLog({
      id: '',
      collected_at: '',
      source: '',
      location: {},
      current: {},
    });
    expect(mockSvc.create).toHaveBeenCalled();
    expect(out).toMatchObject({ id: '1' } as Partial<WeatherResponseDto>);
  });

  it('list returns paginated shape', async () => {
    mockSvc.list.mockResolvedValueOnce({
      data: [{ id: '1' }],
      meta: { total: 1 },
    });
    const res = await ctrl.list('1', '10');
    expect(mockSvc.list).toHaveBeenCalledWith(1, 10);
    expect(res.data[0]).toHaveProperty('id');
    expect(res.meta.page).toBe(1);
  });
  it('exportCsv writes csv to res', async () => {
    const header = jest.fn();
    const attachment = jest.fn();
    const send = jest.fn();
    const fakeRes = {
      header,
      attachment,
      send,
    } as unknown as Response;
    mockSvc.exportCsv.mockResolvedValueOnce('a,b,c\n');
    await ctrl.exportCsv(fakeRes);
    expect(header).toHaveBeenCalled();
    expect(attachment).toHaveBeenCalledWith('weather.csv');
    expect(send).toHaveBeenCalled();
  });

  it('exportXlsx writes buffer to res', async () => {
    const header = jest.fn();
    const attachment = jest.fn();
    const send = jest.fn();
    const fakeRes = {
      header,
      attachment,
      send,
    } as unknown as Response;
    const buf = Buffer.from('x');
    mockSvc.exportXlsxBuffer.mockResolvedValueOnce(buf);
    await ctrl.exportXlsx(fakeRes);
    expect(attachment).toHaveBeenCalledWith('weather.xlsx');
    expect(send).toHaveBeenCalledWith(buf);
  });

  it('getInsights delegates', async () => {
    mockSvc.computeInsights.mockResolvedValueOnce({ samples: 3 });
    const r = await ctrl.getInsights('24');
    expect(mockSvc.computeInsights).toHaveBeenCalledWith(24);
    expect(r).toEqual({ samples: 3 });
  });

  it('getLast24 delegates and maps', async () => {
    mockSvc.last24.mockResolvedValueOnce([{ id: 'x' }]);
    const r = await ctrl.getLast24();
    expect(mockSvc.last24).toHaveBeenCalled();
    expect(Array.isArray(r)).toBe(true);
  });
});
