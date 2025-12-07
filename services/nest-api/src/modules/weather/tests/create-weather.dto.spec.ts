import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateWeatherDto } from '../dto/create-weather.dto';

describe('CreateWeatherDto validation', () => {
  it('validates a correct payload', async () => {
    const dto = plainToInstance(CreateWeatherDto, {
      id: 'abc',
      collected_at: '2025-12-05T12:00:00Z',
      source: 'openweathermap',
      location: { lat: 0, lon: 0 },
      current: { temperature_c: 10 },
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects when required fields missing', async () => {
    const dto = plainToInstance(CreateWeatherDto, { id: 'x' } as any);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
