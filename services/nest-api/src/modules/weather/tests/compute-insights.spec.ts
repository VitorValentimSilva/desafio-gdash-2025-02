import { I18nService } from 'nestjs-i18n';
import { computeInsightsFromRows } from '../utils/insights';

describe('computeInsightsFromRows', () => {
  const i18nMock = {
    t: jest.fn((k: string, opts: unknown) => {
      const args =
        opts && typeof opts === 'object' && 'args' in opts
          ? (opts as { args?: unknown }).args
          : undefined;

      if (k === 'weather.summary.header')
        return `Header ${Array.isArray(args) ? args.length : 0}`;
      if (k.startsWith('weather.summary'))
        return `${k}:${JSON.stringify(args)}`;
      if (k === 'weather.noData') return 'No data';
      if (k === 'weather.unknown') return 'Unknown';
      if (k === 'weather.cold') return 'Cold';
      if (k === 'weather.pleasant') return 'Pleasant';
      if (k === 'weather.hot') return 'Hot';
      if (k === 'weather.warm') return 'Warm';
      if (k === 'weather.highChanceOfRain') return 'HighRain';
      if (k === 'weather.extremeHeat') return 'Heat';
      if (k === 'weather.intenseCold') return 'ColdExtreme';
      return k;
    }),
  } as unknown as I18nService;

  it('returns no-data structure for empty rows', () => {
    const r = computeInsightsFromRows([], i18nMock, 24);
    expect(r.samples).toBe(0);
    expect(r.summary).toContain('No data');
  });

  it('computes averages and classification + alerts', () => {
    const rows = [
      {
        current: {
          temperature_c: 35,
          relative_humidity_percent: 20,
          precipitation_probability_percent: 80,
        },
      },
      {
        current: {
          temperature_c: 36,
          relative_humidity_percent: 25,
          precipitation_probability_percent: 90,
        },
      },
      {
        current: {
          temperature_c: 34,
          relative_humidity_percent: 15,
          precipitation_probability_percent: 70,
        },
      },
    ];
    const out = computeInsightsFromRows(rows, i18nMock, 24);
    expect(out.samples).toBe(3);
    expect(out.avg_temperature).toBeGreaterThanOrEqual(34);
    expect(out.alerts).toEqual(expect.arrayContaining(['HighRain']));
    expect(out.alerts).toEqual(expect.arrayContaining(['Heat']));
    expect(typeof out.summary).toBe('string');
  });

  it('classifies cold/pleasant/warm/hot boundaries', () => {
    const cases = [
      { t: 5, expectClass: 'Cold' },
      { t: 15, expectClass: 'Pleasant' },
      { t: 22, expectClass: 'Warm' },
      { t: 30, expectClass: 'Hot' },
    ];
    for (const c of cases) {
      const out = computeInsightsFromRows(
        [{ current: { temperature_c: c.t, relative_humidity_percent: 50 } }],
        i18nMock,
        24,
      );
      expect(out.condition_classification).toBeDefined();
    }
  });
});
